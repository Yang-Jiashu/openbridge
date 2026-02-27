/**
 * API 配置管理器
 * 管理 OpenCode、OpenClaw、OpenAI 等 AI 提供商的配置
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class ConfigManager {
	constructor() {
		this.configPath = path.join(process.cwd(), 'config', 'api-config.json');
		this.configs = this.loadConfigs();
	}

	/**
	 * 加载配置文件
	 */
	loadConfigs() {
		try {
			if (fs.existsSync(this.configPath)) {
				const data = fs.readFileSync(this.configPath, 'utf-8');
				return JSON.parse(data);
			}
		} catch (error) {
			console.error('加载配置失败:', error);
		}
		return this.getDefaultConfigs();
	}

	/**
	 * 获取默认配置
	 */
	getDefaultConfigs() {
		return {
			opencode: {
				enabled: false,
				baseURL: 'http://localhost:12345',
				apiKey: '',
				model: 'claude-3-opus'
			},
			openclaw: {
				enabled: false,
				gatewayUrl: 'ws://localhost:18789',
				token: '',
				agentId: 'main'
			},
			openai: {
				enabled: false,
				apiKey: '',
				baseURL: 'https://api.openai.com/v1',
				model: 'gpt-4'
			},
			anthropic: {
				enabled: false,
				apiKey: '',
				baseURL: 'https://api.anthropic.com',
				model: 'claude-3-opus-20240229'
			},
			global: {
				defaultProvider: 'auto',
				timeout: 60000,
				streamMode: true
			}
		};
	}

	/**
	 * 保存配置到文件
	 */
	saveConfigs() {
		try {
			const configDir = path.dirname(this.configPath);
			if (!fs.existsSync(configDir)) {
				fs.mkdirSync(configDir, { recursive: true });
			}
			fs.writeFileSync(this.configPath, JSON.stringify(this.configs, null, 2));
			return { success: true };
		} catch (error) {
			console.error('保存配置失败:', error);
			return { success: false, error: error.message };
		}
	}

	/**
	 * 获取所有配置
	 */
	getConfigs() {
		return this.configs;
	}

	/**
	 * 更新配置
	 */
	updateConfigs(newConfigs) {
		this.configs = { ...this.configs, ...newConfigs };
		return this.saveConfigs();
	}

	/**
	 * 更新单个提供商配置
	 */
	updateProviderConfig(provider, config) {
		if (this.configs[provider]) {
			this.configs[provider] = { ...this.configs[provider], ...config };
			return this.saveConfigs();
		}
		return { success: false, error: '未知的提供商' };
	}

	/**
	 * 测试 OpenCode 连接
	 */
	async testOpenCode(config) {
		try {
			const { baseURL, apiKey } = config;
			
			// 简单的 HTTP 请求测试
			const testUrl = `${baseURL}/health`;
			
			return new Promise((resolve) => {
				const curl = exec(`curl -s -o /dev/null -w "%{http_code}" "${testUrl}"`, 
					{ timeout: 10000 },
					(error, stdout) => {
						if (error) {
							// 尝试其他端点
							this.testOpenCodeAlternate(config).then(resolve);
							return;
						}
						
						const statusCode = parseInt(stdout.trim());
						if (statusCode === 200) {
							resolve({ success: true, message: 'OpenCode 连接正常' });
						} else {
							resolve({ success: false, error: `HTTP 状态码: ${statusCode}` });
						}
					}
				);
			});
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	/**
	 * 备用 OpenCode 测试
	 */
	async testOpenCodeAlternate(config) {
		try {
			// 尝试使用 opencode CLI
			return new Promise((resolve) => {
				exec('opencode --version', { timeout: 5000 }, (error, stdout) => {
					if (error) {
						resolve({ success: false, error: '无法连接到 OpenCode，请检查服务是否运行' });
					} else {
						resolve({ success: true, message: `OpenCode 版本: ${stdout.trim()}` });
					}
				});
			});
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	/**
	 * 测试 OpenClaw 连接
	 */
	async testOpenClaw(config) {
		try {
			const { gatewayUrl, token } = config;
			
			// 检查 WebSocket 是否可连接
			const wsUrl = gatewayUrl.replace('ws://', 'http://').replace('wss://', 'https://');
			
			return new Promise((resolve) => {
				// 尝试使用 openclaw CLI
				exec('openclaw --version', { timeout: 5000 }, (error, stdout) => {
					if (error) {
						resolve({ success: false, error: 'OpenClaw CLI 未找到，请检查安装' });
					} else {
						// 检查 Gateway 是否运行
						const gatewayCheck = exec(`curl -s "${wsUrl}/health" || echo "fail"`, 
							{ timeout: 5000 },
							(gatewayError, gatewayStdout) => {
								if (gatewayStdout && gatewayStdout.includes('ok')) {
									resolve({ success: true, message: `OpenClaw 版本: ${stdout.trim()}, Gateway 运行正常` });
								} else {
									resolve({ success: true, message: `OpenClaw 版本: ${stdout.trim()} (Gateway 可能未运行)` });
								}
							}
						);
					}
				});
			});
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	/**
	 * 测试 OpenAI 连接
	 */
	async testOpenAI(config) {
		try {
			const { apiKey, baseURL } = config;
			
			if (!apiKey) {
				return { success: false, error: 'API Key 不能为空' };
			}

			return new Promise((resolve) => {
				// 使用 curl 测试 API
				const curlCmd = `curl -s -H "Authorization: Bearer ${apiKey}" \
					-H "Content-Type: application/json" \
					${baseURL}/models`;
				
				exec(curlCmd, { timeout: 10000 }, (error, stdout, stderr) => {
					if (error) {
						resolve({ success: false, error: '请求失败: ' + error.message });
						return;
					}

					try {
						const response = JSON.parse(stdout);
						if (response.data && Array.isArray(response.data)) {
							const modelCount = response.data.length;
							resolve({ success: true, message: `连接成功！可用模型: ${modelCount} 个` });
						} else if (response.error) {
							resolve({ success: false, error: response.error.message || 'API 错误' });
						} else {
							resolve({ success: false, error: '无效的响应格式' });
						}
					} catch (e) {
						resolve({ success: false, error: '解析响应失败: ' + e.message });
					}
				});
			});
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	/**
	 * 测试 Anthropic 连接
	 */
	async testAnthropic(config) {
		try {
			const { apiKey, baseURL } = config;
			
			if (!apiKey) {
				return { success: false, error: 'API Key 不能为空' };
			}

			return new Promise((resolve) => {
				const curlCmd = `curl -s -H "x-api-key: ${apiKey}" \
					-H "anthropic-version: 2023-06-01" \
					-H "Content-Type: application/json" \
					${baseURL}/v1/models`;
				
				exec(curlCmd, { timeout: 10000 }, (error, stdout) => {
					if (error) {
						resolve({ success: false, error: '请求失败: ' + error.message });
						return;
					}

					try {
						const response = JSON.parse(stdout);
						if (response.data) {
							resolve({ success: true, message: 'Anthropic API 连接成功！' });
						} else if (response.error) {
							resolve({ success: false, error: response.error.message });
						} else {
							resolve({ success: false, error: '无效的响应' });
						}
					} catch (e) {
						resolve({ success: false, error: '解析响应失败' });
					}
				});
			});
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	/**
	 * 测试指定提供商的连接
	 */
	async testConnection(provider, config) {
		switch (provider) {
			case 'opencode':
				return await this.testOpenCode(config);
			case 'openclaw':
				return await this.testOpenClaw(config);
			case 'openai':
				return await this.testOpenAI(config);
			case 'anthropic':
				return await this.testAnthropic(config);
			default:
				return { success: false, error: '未知的提供商' };
		}
	}

	/**
	 * 获取可用的 AI 提供商列表
	 */
	getAvailableProviders() {
		const providers = [];
		if (this.configs.opencode?.enabled) providers.push('opencode');
		if (this.configs.openclaw?.enabled) providers.push('openclaw');
		if (this.configs.openai?.enabled) providers.push('openai');
		if (this.configs.anthropic?.enabled) providers.push('anthropic');
		return providers;
	}

	/**
	 * 获取默认提供商
	 */
	getDefaultProvider() {
		const { defaultProvider } = this.configs.global || {};
		if (defaultProvider && defaultProvider !== 'auto') {
			if (this.configs[defaultProvider]?.enabled) {
				return defaultProvider;
			}
		}
		
		// 自动选择第一个可用的
		const available = this.getAvailableProviders();
		return available[0] || null;
	}
}

module.exports = ConfigManager;
