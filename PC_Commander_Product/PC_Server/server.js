/**
 * OpenCode Remote - PC 服务端
 * 集成 OpenCode + OpenClaw 的远程控制服务
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// 导入模块
const OpenCodeBridge = require('./opencode-bridge');
const ConfigManager = require('./config-manager');

const bridge = new OpenCodeBridge();
const configManager = new ConfigManager();

const app = express();
const PORT = process.env.PORT || 8000;

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 请求日志
app.use((req, res, next) => {
	const timestamp = new Date().toLocaleString('zh-CN');
	console.log(`[${timestamp}] ${req.method} ${req.path}`);
	next();
});

// ===== API 路由 =====

/**
 * 健康检查
 */
app.get('/api/health', (req, res) => {
	res.json({
		status: 'ok',
		timestamp: new Date().toISOString(),
		opencode: bridge.opencodePath ? 'available' : 'not found',
		openclaw: bridge.openclawPath ? 'available' : 'not found'
	});
});

/**
 * AI 聊天接口
 */
app.post('/api/chat', async (req, res) => {
	try {
		const { message, context = {} } = req.body;
		
		if (!message) {
			return res.status(400).json({ error: '消息不能为空' });
		}

		console.log('📱 收到消息:', message);

		// 使用 Bridge 处理消息
		const result = await bridge.processChat(message, context);
		
		res.json({
			success: true,
			response: result.message,
			type: result.type,
			error: result.error || null,
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('❌ 处理消息错误:', error);
		res.status(500).json({
			success: false,
			error: error.message,
			response: '服务器内部错误'
		});
	}
});

/**
 * 运行代码
 */
app.post('/api/code/run', async (req, res) => {
	try {
		const { code, language = 'javascript' } = req.body;
		
		if (!code) {
			return res.status(400).json({ error: '代码不能为空' });
		}

		console.log('💻 运行代码:', language);
		
		const result = await bridge.runCode(code, language);
		
		res.json({
			success: result.success,
			output: result.stdout,
			error: result.stderr,
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('❌ 运行代码错误:', error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
});

/**
 * 文件列表
 */
app.get('/api/files', async (req, res) => {
	try {
		const { path: dirPath = '.' } = req.query;
		
		const result = await bridge.listFiles(dirPath);
		
		res.json(result);

	} catch (error) {
		console.error('❌ 获取文件列表错误:', error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
});

/**
 * 读取文件
 */
app.get('/api/files/read', async (req, res) => {
	try {
		const { path: filePath } = req.query;
		
		if (!filePath) {
			return res.status(400).json({ error: '文件路径不能为空' });
		}
		
		const result = await bridge.readFile(filePath);
		
		res.json(result);

	} catch (error) {
		console.error('❌ 读取文件错误:', error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
});

/**
 * 写入文件
 */
app.post('/api/files/write', async (req, res) => {
	try {
		const { path: filePath, content } = req.body;
		
		if (!filePath || content === undefined) {
			return res.status(400).json({ error: '文件路径和内容不能为空' });
		}
		
		const result = await bridge.writeFile(filePath, content);
		
		res.json(result);

	} catch (error) {
		console.error('❌ 写入文件错误:', error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
});

/**
 * 执行命令
 */
app.post('/api/command', async (req, res) => {
	try {
		const { command, cwd } = req.body;
		
		if (!command) {
			return res.status(400).json({ error: '命令不能为空' });
		}

		console.log('⚡ 执行命令:', command);
		
		const result = await bridge.executeCommand(command, cwd);
		
		res.json({
			success: result.success,
			stdout: result.stdout,
			stderr: result.stderr,
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('❌ 执行命令错误:', error);
		res.status(500).json({
			success: false,
			error: error.message
		});
	}
});

/**
 * OpenCode 命令
 */
app.post('/api/opencode', async (req, res) => {
	try {
		const { command } = req.body;
		
		if (!command) {
			return res.status(400).json({ error: '命令不能为空' });
		}

		console.log('🔧 OpenCode 命令:', command);
		
		const result = await bridge.runOpenCode(command);
		
		res.json({
			success: true,
			output: result.stdout,
			error: result.stderr,
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('❌ OpenCode 错误:', error);
		res.status(500).json({
			success: false,
			error: error.error || error.message
		});
	}
});

// ===== API 配置管理接口 =====

/**
 * 获取所有 API 配置
 */
app.get('/api/config', (req, res) => {
	const configs = configManager.getConfigs();
	// 隐藏敏感信息
	const safeConfigs = {
		...configs,
		opencode: { ...configs.opencode, apiKey: configs.opencode.apiKey ? '***' : '' },
		openclaw: { ...configs.openclaw, token: configs.openclaw.token ? '***' : '' },
		openai: { ...configs.openai, apiKey: configs.openai.apiKey ? '***' : '' },
		anthropic: { ...configs.anthropic, apiKey: configs.anthropic.apiKey ? '***' : '' }
	};
	res.json(safeConfigs);
});

/**
 * 更新 API 配置
 */
app.post('/api/config/update', (req, res) => {
	try {
		const { opencode, openclaw, openai, anthropic, global } = req.body;
		
		const updates = {};
		if (opencode) updates.opencode = opencode;
		if (openclaw) updates.openclaw = openclaw;
		if (openai) updates.openai = openai;
		if (anthropic) updates.anthropic = anthropic;
		if (global) updates.global = global;

		const result = configManager.updateConfigs(updates);
		
		if (result.success) {
			console.log('✅ 配置已更新');
			res.json({ success: true, message: '配置保存成功' });
		} else {
			res.status(500).json({ success: false, error: result.error });
		}
	} catch (error) {
		console.error('❌ 更新配置错误:', error);
		res.status(500).json({ success: false, error: error.message });
	}
});

/**
 * 测试 API 连接
 */
app.post('/api/config/test', async (req, res) => {
	try {
		const { provider, config } = req.body;
		
		if (!provider) {
			return res.status(400).json({ error: '请指定提供商' });
		}

		console.log(`🧪 测试 ${provider} 连接...`);
		
		const result = await configManager.testConnection(provider, config);
		
		res.json(result);

	} catch (error) {
		console.error('❌ 测试连接错误:', error);
		res.status(500).json({ success: false, error: error.message });
	}
});

/**
 * 获取可用的 AI 提供商
 */
app.get('/api/config/providers', (req, res) => {
	const providers = configManager.getAvailableProviders();
	const defaultProvider = configManager.getDefaultProvider();
	
	res.json({
		providers,
		default: defaultProvider,
		all: ['opencode', 'openclaw', 'openai', 'anthropic']
	});
});

/**
 * OpenClaw 命令
 */
app.post('/api/openclaw', async (req, res) => {
	try {
		const { command } = req.body;
		
		if (!command) {
			return res.status(400).json({ error: '命令不能为空' });
		}

		console.log('🦞 OpenClaw 命令:', command);
		
		const result = await bridge.runOpenClaw(command);
		
		res.json({
			success: true,
			output: result.stdout,
			error: result.stderr,
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('❌ OpenClaw 错误:', error);
		res.status(500).json({
			success: false,
			error: error.error || error.message
		});
	}
});

// ===== 静态页面 =====

// 主页面
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 处理
app.use((req, res) => {
	res.status(404).json({ error: '接口不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
	console.error('服务器错误:', err);
	res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
	console.log('');
	console.log('╔════════════════════════════════════════════════╗');
	console.log('║     🚀 OpenCode Remote Server 已启动          ║');
	console.log('╠════════════════════════════════════════════════╣');
	console.log(`║  📡 地址: http://0.0.0.0:${PORT}                ║`);
	console.log(`║  💻 本地: http://localhost:${PORT}              ║`);
	console.log('╠════════════════════════════════════════════════╣');
	console.log('║  📱 在手机上访问以上地址即可远程控制          ║');
	console.log('║  🔧 支持 OpenCode 和 OpenClaw 集成            ║');
	console.log('╚════════════════════════════════════════════════╝');
	console.log('');
});

module.exports = app;
