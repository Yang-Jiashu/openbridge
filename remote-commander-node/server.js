const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// 尝试导入 OpenCode SDK
let Opencode = null;
try {
    const sdk = require('@opencode-ai/sdk');
    Opencode = sdk.default || sdk;
} catch (e) {
    console.warn("Warning: @opencode-ai/sdk not found.");
}

const app = express();
const PORT = process.env.PORT || 8000;
const MOCK_MODE = process.env.MOCK_MODE === 'true';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 初始化 OpenCode Client
let client = null;
if (Opencode && !MOCK_MODE) {
    try {
        client = new Opencode({
            baseURL: process.env.OPENCODE_API_URL || 'http://localhost:12345',
            apiKey: process.env.OPENCODE_API_KEY
        });
        console.log("OpenCode SDK initialized.");
    } catch (e) {
        console.error("Failed to initialize OpenCode SDK:", e);
    }
}

// Session 存储
let currentSessionId = null;

app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;
    console.log(`Received message: ${userMessage}`);

    // Mock 模式或 SDK 未初始化
    if (!client || MOCK_MODE) {
        // 模拟一个智能回复
        const mockReply = mockAIResponse(userMessage);
        return res.json({ response: mockReply });
    }

    try {
        // 1. 确保有会话
        if (!currentSessionId) {
            console.log("Creating new session...");
            const session = await client.session.create();
            currentSessionId = session.id;
        }

        // 2. 发送消息
        // 注意：这里基于 OpenCode SDK 的常见模式。
        // 如果 SDK 版本不同，可能需要调整为 client.messages.create({ session_id: ... })
        console.log("Sending message to OpenCode...");
        
        // 发送用户消息
        // 通常 agent 收到消息后会执行操作，我们需要轮询或等待它的最终回复
        // 这里假设是一个同步或伪同步接口，或者返回的是一个 Job
        // 根据之前的搜索，Opencode 主要是基于 session 的
        
        // 尝试发送
        await client.session.messages.create(currentSessionId, {
            role: 'user',
            content: userMessage
        });

        // 3. 获取回复
        // 因为 OpenCode 可能会执行多个步骤（Thinking/Tool calls），我们需要获取最新的 Assistant 消息
        // 这里做一个简单的轮询或者直接获取历史记录的最后一条
        // 实际生产环境建议使用 SSE 流式接口 (client.session.events.stream)
        
        // 简单策略：等待 2 秒让它思考（演示用），然后获取最后一条消息
        // 真正的集成应该使用 WebSocket 或 SSE
        await new Promise(r => setTimeout(r, 2000));
        
        const messages = await client.session.messages.list(currentSessionId, {
            limit: 5,
            order: 'desc'
        });
        
        // 找到最近的一条 assistant 消息
        const lastMsg = messages.data.find(m => m.role === 'assistant');
        const replyText = lastMsg ? lastMsg.content : "(OpenCode 正在思考或执行任务，请稍后查询...)";

        res.json({ response: replyText });

    } catch (error) {
        console.error("OpenCode API Error:", error);
        
        // 错误恢复：如果是 Session 过期，重置 ID
        if (error.status === 404) {
            currentSessionId = null;
        }

        res.json({ 
            response: `[System Error] 无法连接 OpenCode Agent。\n请检查：\n1. OpenCode 是否在电脑上运行？\n2. 端口是否正确？\n错误信息: ${error.message}` 
        });
    }
});

// Mock 逻辑
function mockAIResponse(msg) {
    if (msg.includes("你好")) return "你好！我是你的 PC 助手。";
    if (msg.includes("文件")) return "检测到当前目录下有 5 个文件：\n- server.js\n- package.json\n...";
    if (msg.includes("进程")) return "正在扫描系统进程...\nCPU 使用率: 15%\n内存使用: 45%";
    return `[Mock Mode] 我收到了你的指令：“${msg}”。\n(要使用真实 AI，请在 .env 中关闭 MOCK_MODE 并启动 OpenCode)`;
}

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
});
