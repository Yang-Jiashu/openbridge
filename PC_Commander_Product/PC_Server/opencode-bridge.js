/**
 * OpenCode + OpenClaw 集成桥接服务
 * 用于将手机 App 与 OpenCode/OpenClaw 连接
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

class OpenCodeBridge {
	constructor() {
		this.opencodePath = this.findOpenCode();
		this.openclawPath = this.findOpenClaw();
		this.activeSessions = new Map();
		console.log('🔧 OpenCode Bridge 初始化完成');
		console.log('📍 OpenCode 路径:', this.opencodePath || '未找到');
		console.log('📍 OpenClaw 路径:', this.openclawPath || '未找到');
	}

	/**
	 * 查找 OpenCode 安装路径
	 */
	findOpenCode() {
		const possiblePaths = [
			'C:\\Users\\33455\\Desktop\\PC\\opencode-dev\\packages\\opencode',
			process.env.LOCALAPPDATA + '\\opencode',
			process.env.USERPROFILE + '\\.opencode\\bin\\opencode',
			'opencode'
		];
		
		for (const p of possiblePaths) {
			if (fs.existsSync(p)) {
				return p;
			}
		}
		return null;
	}

	/**
	 * 查找 OpenClaw 安装路径
	 */
	findOpenClaw() {
		const possiblePaths = [
			'C:\\Users\\33455\\Desktop\\PC\\openclaw',
			process.env.LOCALAPPDATA + '\\openclaw',
			process.env.USERPROFILE + '\\.openclaw\\bin\\openclaw',
			'openclaw'
		];
		
		for (const p of possiblePaths) {
			if (fs.existsSync(p)) {
				return p;
			}
		}
		return null;
	}

	/**
	 * 执行 OpenCode 命令
	 */
	async runOpenCode(command, cwd = process.cwd()) {
		return new Promise((resolve, reject) => {
			const opencodeCmd = this.opencodePath || 'opencode';
			const fullCommand = `"${opencodeCmd}" ${command}`;
			
			console.log('🚀 执行 OpenCode:', fullCommand);
			
			exec(fullCommand, { cwd, encoding: 'utf-8', timeout: 60000 }, (error, stdout, stderr) => {
				if (error) {
					console.error('❌ OpenCode 错误:', error);
					reject({ error: error.message, stderr });
					return;
				}
				
				resolve({
					success: true,
					stdout: stdout.toString(),
					stderr: stderr.toString()
				});
			});
		});
	}

	/**
	 * 执行 OpenClaw 命令
	 */
	async runOpenClaw(command) {
		return new Promise((resolve, reject) => {
			const openclawCmd = this.openclawPath || 'openclaw';
			const fullCommand = `"${openclawCmd}" ${command}`;
			
			console.log('🦞 执行 OpenClaw:', fullCommand);
			
			exec(fullCommand, { encoding: 'utf-8', timeout: 60000 }, (error, stdout, stderr) => {
				if (error) {
					console.error('❌ OpenClaw 错误:', error);
					reject({ error: error.message, stderr });
					return;
				}
				
				resolve({
					success: true,
					stdout: stdout.toString(),
					stderr: stderr.toString()
				});
			});
		});
	}

	/**
	 * 运行代码
	 */
	async runCode(code, language = 'javascript') {
		const tempDir = path.join(process.cwd(), 'temp');
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
		}

		// 根据语言选择文件扩展名
		const extMap = {
			'javascript': 'js',
			'python': 'py',
			'shell': 'sh',
			'powershell': 'ps1',
			'bash': 'sh'
		};
		
		const ext = extMap[language] || 'js';
		const filename = `temp_${Date.now()}.${ext}`;
		const filepath = path.join(tempDir, filename);
		
		// 写入临时文件
		fs.writeFileSync(filepath, code);
		
		try {
			let result;
			
			if (language === 'javascript' || language === 'js') {
				// 使用 Node.js 运行
				result = await this.executeCommand(`node "${filepath}"`);
			} else if (language === 'python' || language === 'py') {
				// 使用 Python 运行
				result = await this.executeCommand(`python "${filepath}"`);
			} else if (language === 'shell' || language === 'bash' || language === 'sh') {
				// 使用 Bash 运行
				result = await this.executeCommand(`bash "${filepath}"`);
			} else if (language === 'powershell' || language === 'ps1') {
				// 使用 PowerShell 运行
				result = await this.executeCommand(`powershell -File "${filepath}"`);
			} else {
				// 使用 OpenCode 运行
				result = await this.runOpenCode(`run "${filepath}"`);
			}
			
			// 清理临时文件
			setTimeout(() => {
				try { fs.unlinkSync(filepath); } catch (e) {}
			}, 5000);
			
			return result;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * 执行系统命令
	 */
	async executeCommand(command, cwd = process.cwd()) {
		return new Promise((resolve, reject) => {
			console.log('⚡ 执行命令:', command);
			
			exec(command, { cwd, encoding: 'utf-8', maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
				if (error) {
					resolve({
						success: false,
						stdout: stdout?.toString() || '',
						stderr: stderr?.toString() || error.message
					});
					return;
				}
				
				resolve({
					success: true,
					stdout: stdout?.toString() || '',
					stderr: stderr?.toString() || ''
				});
			});
		});
	}

	/**
	 * 列出目录文件
	 */
	async listFiles(dirPath = '.') {
		try {
			const fullPath = path.resolve(dirPath);
			const items = fs.readdirSync(fullPath, { withFileTypes: true });
			
			const files = items.map(item => {
				const stat = fs.statSync(path.join(fullPath, item.name));
				return {
					name: item.name,
					type: item.isDirectory() ? 'folder' : 'file',
					size: this.formatSize(stat.size),
					modified: stat.mtime.toLocaleString('zh-CN'),
					isDirectory: item.isDirectory()
				};
			});
			
			// 文件夹排在前面
			files.sort((a, b) => {
				if (a.isDirectory && !b.isDirectory) return -1;
				if (!a.isDirectory && b.isDirectory) return 1;
				return a.name.localeCompare(b.name);
			});
			
			return { success: true, files, path: fullPath };
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	/**
	 * 读取文件内容
	 */
	async readFile(filePath) {
		try {
			const content = fs.readFileSync(filePath, 'utf-8');
			return { success: true, content };
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	/**
	 * 写入文件
	 */
	async writeFile(filePath, content) {
		try {
			fs.writeFileSync(filePath, content, 'utf-8');
			return { success: true, message: '文件保存成功' };
		} catch (error) {
			return { success: false, error: error.message };
		}
	}

	/**
	 * 格式化文件大小
	 */
	formatSize(bytes) {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	}

	/**
	 * 处理 AI 对话
	 */
	async processChat(message, context = {}) {
		console.log('💬 处理消息:', message);
		
		// 检查是否是特殊命令
		if (message.startsWith('/')) {
			return await this.handleCommand(message, context);
		}
		
		// 检查是否需要执行代码
		if (message.includes('```') || message.includes('运行') || message.includes('执行')) {
			// 提取代码并执行
			const codeMatch = message.match(/```(\w+)?\n([\s\S]*?)```/);
			if (codeMatch) {
				const language = codeMatch[1] || 'javascript';
				const code = codeMatch[2];
				const result = await this.runCode(code, language);
				return {
					type: 'code_execution',
					message: `已执行 ${language} 代码：\n\n${result.stdout || '无输出'}`,
					error: result.stderr || null
				};
			}
		}
		
		// 检查是否是文件操作
		if (message.includes('查看') && message.includes('文件')) {
			const result = await this.listFiles();
			if (result.success) {
				const fileList = result.files.map(f => 
					`${f.type === 'folder' ? '📁' : '📄'} ${f.name} (${f.size})`
				).join('\n');
				return {
					type: 'file_list',
					message: `📂 当前目录文件列表：\n\n${fileList}`
				};
			}
		}
		
		// 检查是否需要系统命令
		const systemKeywords = ['系统', '进程', 'CPU', '内存', '磁盘', '网络', '状态'];
		if (systemKeywords.some(kw => message.includes(kw))) {
			const result = await this.executeCommand('tasklist | head -20');
			return {
				type: 'system_info',
				message: `💻 系统信息：\n\n${result.stdout || '获取失败'}`
			};
		}
		
		// 默认：尝试使用 OpenCode 或 OpenClaw
		try {
			if (this.openclawPath) {
				// 使用 OpenClaw 处理
				const result = await this.runOpenClaw(`agent --message "${message}" --thinking high`);
				return {
					type: 'ai_response',
					message: result.stdout || 'OpenClaw 处理完成'
				};
			} else if (this.opencodePath) {
				// 使用 OpenCode 处理
				const result = await this.runOpenCode(`ask "${message}"`);
				return {
					type: 'ai_response',
					message: result.stdout || 'OpenCode 处理完成'
				};
			}
		} catch (error) {
			console.log('AI 处理失败，使用本地处理');
		}
		
		// 默认回复
		return {
			type: 'text',
			message: `📱 收到指令："${message}"\n\n我可以通过 OpenCode 帮你：\n• 📝 编写和修改代码\n• 📂 管理文件和目录\n• 💻 执行系统命令\n• 🔧 运行开发工具\n\n请告诉我具体要做什么？`
		};
	}

	/**
	 * 处理特殊命令
	 */
	async handleCommand(command, context) {
		const parts = command.split(' ');
		const cmd = parts[0].toLowerCase();
		const args = parts.slice(1);
		
		switch (cmd) {
			case '/help':
				return {
					type: 'help',
					message: `📖 可用命令：
					
/help - 显示帮助
/ls [path] - 列出文件
/cat <file> - 查看文件
/run <code> - 运行代码
/cmd <command> - 执行命令
/opencode <args> - OpenCode 命令
/openclaw <args> - OpenClaw 命令
/clear - 清除上下文`
				};
				
			case '/ls':
				const path = args[0] || '.';
				const result = await this.listFiles(path);
				return {
					type: 'file_list',
					message: result.success 
						? `📂 ${result.path}:\n${result.files.map(f => `${f.type === 'folder' ? '📁' : '📄'} ${f.name}`).join('\n')}`
						: `❌ 错误: ${result.error}`
				};
				
			case '/cmd':
				const cmdResult = await this.executeCommand(args.join(' '));
				return {
					type: 'command_result',
					message: cmdResult.success 
						? `⚡ 执行结果：\n${cmdResult.stdout}`
						: `❌ 错误: ${cmdResult.stderr}`
				};
				
			case '/clear':
				return {
					type: 'clear',
					message: '🧹 上下文已清除'
				};
				
			default:
				return {
					type: 'error',
					message: `❌ 未知命令: ${cmd}\n输入 /help 查看可用命令`
				};
		}
	}
}

module.exports = OpenCodeBridge;
