const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

// 尝试导入 OpenCode SDK
let Opencode = null;
try {
    const sdk = require('@opencode-ai/sdk');
    Opencode = sdk.default || sdk;
} catch (e) {
    console.warn("Warning: @opencode-ai/sdk not found. Running in mock mode.");
}

const app = express();
const PORT = process.env.PORT || 8000;
const MOCK_MODE = process.env.MOCK_MODE === 'true' || !Opencode;

// 安全配置
const API_KEY = process.env.API_KEY || 'openbridge-default-key-change-me';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];

// CORS配置
app.use(cors({
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API密钥认证中间件
const authenticateApiKey = (req, res, next) => {
    const clientKey = req.headers['x-api-key'] || req.query.apiKey;
    
    if (clientKey !== API_KEY) {
        console.warn(`[Security] Unauthorized access attempt from ${req.ip}`);
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'Invalid or missing API Key. Please provide X-API-Key header.' 
        });
    }
    next();
};

// 访问日志
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// 初始化 OpenCode Client
let client = null;
if (Opencode && !MOCK_MODE) {
    try {
        client = new Opencode({
            baseURL: process.env.OPENCODE_API_URL || 'http://localhost:12345',
            apiKey: process.env.OPENCODE_API_KEY
        });
        console.log("✓ OpenCode SDK initialized.");
    } catch (e) {
        console.error("✗ Failed to initialize OpenCode SDK:", e);
    }
} else {
    console.log("✓ Running in MOCK MODE (OpenCode SDK not available).");
}

// Session 存储
let currentSessionId = null;

// 健康检查（无需认证）
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        mode: MOCK_MODE ? 'mock' : 'live',
        version: '1.0.0'
    });
});

// 配置信息（需要认证）
app.get('/api/config', authenticateApiKey, (req, res) => {
    res.json({
        mode: MOCK_MODE ? 'mock' : 'live',
        opencodeConnected: !!client,
        serverTime: new Date().toISOString()
    });
});

// 聊天接口（需要认证）
app.post('/api/chat', authenticateApiKey, async (req, res) => {
    const userMessage = req.body.message;
    console.log(`[Chat] Received: ${userMessage}`);

    // Mock 模式
    if (!client || MOCK_MODE) {
        const mockReply = mockAIResponse(userMessage);
        return res.json({ response: mockReply });
    }

    try {
        // 确保有会话
        if (!currentSessionId) {
            console.log("[OpenCode] Creating new session...");
            const session = await client.session.create();
            currentSessionId = session.id;
        }

        // 发送消息
        await client.session.messages.create(currentSessionId, {
            role: 'user',
            content: userMessage
        });

        // 等待回复
        await new Promise(r => setTimeout(r, 2000));
        
        const messages = await client.session.messages.list(currentSessionId, {
            limit: 5,
            order: 'desc'
        });
        
        const lastMsg = messages.data.find(m => m.role === 'assistant');
        const replyText = lastMsg ? lastMsg.content : "(OpenCode is thinking...)";

        res.json({ response: replyText });

    } catch (error) {
        console.error("[Error] OpenCode API:", error);
        
        if (error.status === 404) {
            currentSessionId = null;
        }

        res.status(500).json({ 
            error: 'OpenCode Error',
            message: `Failed to connect to OpenCode Agent. Error: ${error.message}` 
        });
    }
});

// 执行命令接口（需要认证）
app.post('/api/execute', authenticateApiKey, async (req, res) => {
    const { command } = req.body;
    console.log(`[Execute] Command: ${command}`);
    
    // 安全：只允许白名单命令
    const allowedCommands = ['ls', 'pwd', 'echo', 'cat', 'ps', 'top', 'df', 'free', 'whoami', 'date', 'uname'];
    const cmdBase = command.split(' ')[0];
    
    if (!allowedCommands.includes(cmdBase)) {
        return res.status(403).json({
            error: 'Command not allowed',
            message: `Command '${cmdBase}' is not in the whitelist.`
        });
    }
    
    // Mock 执行
    res.json({
        success: true,
        output: `[Mock] Command executed: ${command}\nOutput: (This would execute on the server in production)`
    });
});

// Mock 响应逻辑
function mockAIResponse(msg) {
    const responses = {
        '你好': '你好！我是 OpenBridge，你的远程PC助手。',
        'hello': 'Hello! I am OpenBridge, your remote PC assistant.',
        'help': '可用命令：\n- 文件操作\n- 系统信息\n- 执行命令',
        'ip': () => `Server IP: ${require('os').hostname()}`,
        'time': () => `Current time: ${new Date().toLocaleString()}`,
    };
    
    for (const [key, response] of Object.entries(responses)) {
        if (msg.toLowerCase().includes(key)) {
            return typeof response === 'function' ? response() : response;
        }
    }
    
    return `[Mock Mode] Received: "${msg}"\n\n(To use real AI, configure OpenCode in .env file)`;
}

// SPA路由
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 OpenBridge Server Started!`);
    console.log(`📡 Listening on: http://0.0.0.0:${PORT}`);
    console.log(`🔑 API Key: ${API_KEY.substring(0, 8)}...`);
    console.log(`🌐 CORS Origins: ${ALLOWED_ORIGINS.join(', ')}`);
    console.log(`\n📖 Usage:`);
    console.log(`   Health:  GET  http://YOUR_IP:${PORT}/api/health`);
    console.log(`   Chat:    POST http://YOUR_IP:${PORT}/api/chat`);
    console.log(`   Headers: X-API-Key: ${API_KEY}`);
    console.log(`\n⚠️  Security: Change default API_KEY in .env file!\n`);
});
