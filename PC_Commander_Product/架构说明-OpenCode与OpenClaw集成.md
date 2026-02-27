# 🔧 OpenCode + OpenClaw 集成架构详解

## 📋 概述

这是一个 **桥接架构（Bridge Pattern）**，将两个不同的 AI 框架统一到一个接口中：

| 组件 | 用途 | 特点 |
|------|------|------|
| **OpenCode** | AI 编程助手 | 写代码、改代码、分析代码 |
| **OpenClaw** | AI 系统助手 | 操作电脑、执行命令、控制硬件 |
| **Bridge Server** | 统一接口 | 路由请求、管理配置、暴露 API |

---

## 🏗️ 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户层 (User Layer)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   手机 App    │    │  PC Web 控制台 │    │   命令行 CLI   │      │
│  │  (uni-app)   │    │  (Vue/React) │    │  (Node.js)   │      │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘      │
│         │                   │                   │               │
│         └───────────────────┼───────────────────┘               │
│                             │ HTTP/WebSocket                    │
└─────────────────────────────┼───────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────┐
│                      Bridge Server 层                           │
│                     (Node.js + Express)                         │
├─────────────────────────────┼───────────────────────────────────┤
│                             │                                   │
│  ┌──────────────────────────┴──────────────────────────┐       │
│  │              API Gateway (Port 8000)                 │       │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │       │
│  │  │  /api/chat  │  │ /api/execute│  │ /api/files  │  │       │
│  │  │   聊天接口   │  │  执行接口   │  │  文件接口   │  │       │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │       │
│  │         │                │                │         │       │
│  │         └────────────────┼────────────────┘         │       │
│  │                          │                          │       │
│  │              ┌───────────┴───────────┐              │       │
│  │              │   Request Router      │              │       │
│  │              │   (请求路由分发器)      │              │       │
│  │              └───────────┬───────────┘              │       │
│  └──────────────────────────┼──────────────────────────┘       │
│                             │                                   │
│              ┌──────────────┼──────────────┐                   │
│              │              │              │                    │
│              ▼              ▼              ▼                    │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐  │
│  │   OpenCode      │ │   OpenClaw      │ │   OpenAI        │  │
│  │   Adapter       │ │   Adapter       │ │   Adapter       │  │
│  │  (代码任务)      │ │  (系统任务)      │ │  (备用方案)      │  │
│  └────────┬────────┘ └────────┬────────┘ └────────┬────────┘  │
│           │                   │                   │            │
└───────────┼───────────────────┼───────────────────┼────────────┘
            │                   │                   │
            ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   OpenCode CLI  │ │  OpenClaw CLI   │ │  OpenAI API     │
│  (Port 12345)   │ │ (Port 18789 WS) │ │  (api.openai)   │
│                 │ │                 │ │                 │
│ • 代码生成       │ │ • 系统命令       │ │ • GPT-4         │
│ • 代码分析       │ │ • 文件操作       │ │ • GPT-3.5       │
│ • Bug 修复       │ │ • 程序控制       │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## 🔄 工作流程

### 场景 1：用户说 "帮我写个 Python 爬虫"

```
1. 用户输入 → 手机 App
   "帮我写个 Python 爬虫抓取豆瓣电影"

2. Bridge Server 分析意图
   ├─ 包含关键词："写"、"Python"、"爬虫"
   ├─ 判断类型：编程任务
   └─ 路由到：OpenCode Adapter

3. OpenCode Adapter 调用 CLI
   $ opencode "帮我写个 Python 爬虫抓取豆瓣电影"

4. OpenCode 返回代码
   ```python
   import requests
   from bs4 import BeautifulSoup
   # ... 爬虫代码
   ```

5. Bridge Server 返回给 App
   { "type": "code", "content": "...", "language": "python" }
```

### 场景 2：用户说 "打开 Chrome 浏览器"

```
1. 用户输入 → 手机 App
   "打开 Chrome 浏览器"

2. Bridge Server 分析意图
   ├─ 包含关键词："打开"、"浏览器"
   ├─ 判断类型：系统操作任务
   └─ 路由到：OpenClaw Adapter

3. OpenClaw Adapter 发送 WebSocket 命令
   ws://localhost:18789
   { "action": "launch", "target": "chrome.exe" }

4. OpenClaw 执行系统命令
   $ start chrome.exe

5. 电脑上的 Chrome 被打开

6. Bridge Server 返回结果
   { "type": "action", "status": "success", "message": "Chrome 已启动" }
```

### 场景 3：用户说 "把刚才的代码保存到桌面"

```
1. 用户输入 → 手机 App
   "把刚才的代码保存到桌面"

2. Bridge Server 分析
   ├─ 上下文：之前有代码生成
   ├─ 意图：文件操作
   └─ 路由到：OpenClaw Adapter

3. OpenClaw 执行
   读取之前的代码 → 写入 C:\Users\XXX\Desktop\spider.py

4. 返回结果
   { "type": "file", "path": "C:\\Users\\XXX\\Desktop\\spider.py" }
```

---

## 🧠 智能路由算法

```javascript
function routeRequest(userInput, context) {
    // 1. 关键词匹配
    const codeKeywords = ['写', '代码', '编程', 'bug', '修复', 'python', 'javascript'];
    const systemKeywords = ['打开', '关闭', '点击', '输入', '保存', '删除', '运行'];
    
    const isCodeTask = codeKeywords.some(kw => userInput.includes(kw));
    const isSystemTask = systemKeywords.some(kw => userInput.includes(kw));
    
    // 2. 决策树
    if (isCodeTask && !isSystemTask) {
        return { provider: 'opencode', priority: 1 };
    } else if (isSystemTask && !isCodeTask) {
        return { provider: 'openclaw', priority: 1 };
    } else if (isCodeTask && isSystemTask) {
        // 混合任务，优先 OpenClaw 协调
        return { provider: 'openclaw', fallback: 'opencode', priority: 1 };
    } else {
        // 默认使用 OpenAI 或用户设置
        return { provider: getDefaultProvider(), priority: 1 };
    }
}
```

---

## 📦 核心代码结构

### Bridge Server (`server.js`)

```javascript
const express = require('express');
const OpenCodeBridge = require('./opencode-bridge');
const OpenClawBridge = require('./openclaw-bridge');

const opencode = new OpenCodeBridge();
const openclaw = new OpenClawBridge();

// 统一聊天接口
app.post('/api/chat', async (req, res) => {
    const { message, context } = req.body;
    
    // 智能路由
    const route = router.analyze(message);
    
    let result;
    if (route.provider === 'opencode') {
        result = await opencode.process(message, context);
    } else if (route.provider === 'openclaw') {
        result = await openclaw.process(message, context);
    }
    
    res.json(result);
});

// 代码执行接口
app.post('/api/execute', async (req, res) => {
    const { code, language } = req.body;
    // 使用 OpenClaw 执行代码（沙箱环境）
    const result = await openclaw.execute(code, language);
    res.json(result);
});

// 系统操作接口
app.post('/api/system', async (req, res) => {
    const { action, params } = req.body;
    // 使用 OpenClaw 执行系统操作
    const result = await openclaw.system(action, params);
    res.json(result);
});
```

### OpenCode Adapter (`adapters/opencode.js`)

```javascript
class OpenCodeAdapter {
    constructor() {
        this.baseURL = 'http://localhost:12345';
    }
    
    async generateCode(prompt, language = 'python') {
        const command = `opencode "${prompt}" --lang ${language}`;
        const result = await exec(command);
        return this.parseOutput(result);
    }
    
    async analyzeCode(code) {
        const command = `opencode analyze "${code}"`;
        return await exec(command);
    }
    
    async fixBugs(code, error) {
        const command = `opencode fix "${code}" --error "${error}"`;
        return await exec(command);
    }
}
```

### OpenClaw Adapter (`adapters/openclaw.js`)

```javascript
class OpenClawAdapter {
    constructor() {
        this.wsUrl = 'ws://localhost:18789';
        this.ws = null;
        this.connect();
    }
    
    connect() {
        this.ws = new WebSocket(this.wsUrl);
        this.ws.on('message', this.handleMessage);
    }
    
    async executeCommand(command) {
        return new Promise((resolve, reject) => {
            const msg = {
                type: 'execute',
                command: command,
                timestamp: Date.now()
            };
            this.ws.send(JSON.stringify(msg));
            this.ws.once('message', (data) => {
                resolve(JSON.parse(data));
            });
        });
    }
    
    async launchApplication(appName) {
        return this.executeCommand(`start ${appName}`);
    }
    
    async fileOperation(action, path, content) {
        return this.executeCommand({
            type: 'file',
            action, path, content
        });
    }
}
```

---

## 🎯 数据流向图

```
用户输入
    │
    ▼
┌─────────────┐
│  意图识别    │ ← 关键词匹配 + 上下文分析
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
代码相关？ 系统操作？
   │       │
   ▼       ▼
OpenCode  OpenClaw
   │       │
   │   ┌───┘
   │   │
   ▼   ▼
┌─────────────┐
│  结果合并    │ ← 格式化输出
└──────┬──────┘
       │
       ▼
    用户界面
```

---

## 💡 关键设计模式

### 1. 适配器模式 (Adapter Pattern)
```javascript
// 统一接口，隐藏底层差异
interface AIProvider {
    process(input: string): Promise<Result>;
}

class OpenCodeAdapter implements AIProvider { }
class OpenClawAdapter implements AIProvider { }
class OpenAIAdapter implements AIProvider { }
```

### 2. 策略模式 (Strategy Pattern)
```javascript
// 根据任务类型选择不同策略
const strategies = {
    code: new CodeStrategy(opencode),
    system: new SystemStrategy(openclaw),
    mixed: new MixedStrategy(opencode, openclaw)
};
```

### 3. 观察者模式 (Observer Pattern)
```javascript
// 状态变更通知
bridge.on('statusChange', (provider, status) => {
    broadcastToClients({ provider, status });
});
```

---

## 🔒 安全考虑

1. **命令过滤**：OpenClaw 执行前检查危险命令
2. **沙箱执行**：代码在隔离环境运行
3. **权限控制**：系统操作需要二次确认
4. **日志审计**：所有操作记录可追溯

---

## 📊 性能优化

| 优化点 | 方案 |
|--------|------|
| 连接池 | WebSocket 长连接复用 |
| 缓存 | 常用代码片段缓存 |
| 并发 | 并行执行独立任务 |
| 降级 | OpenClaw 失败时转 OpenAI |

---

**总结：Bridge Server 就像一个智能交通指挥员，根据你的需求（写代码还是操作电脑）把任务分配给最合适的 AI 助手！**
