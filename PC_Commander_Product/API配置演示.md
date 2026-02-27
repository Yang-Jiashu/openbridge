# 🎬 API 配置功能完整演示

## ✅ 服务端已启动

```
🚀 OpenCode Remote Server 已启动
📡 地址: http://0.0.0.0:8000
💻 本地: http://localhost:8000
```

---

## 📡 API 接口演示

### 1️⃣ 获取当前配置

**请求：**
```bash
GET http://localhost:8000/api/config
```

**响应：**
```json
{
    "opencode": {
        "enabled": false,
        "baseURL": "http://localhost:12345",
        "apiKey": "",
        "model": "claude-3-opus"
    },
    "openclaw": {
        "enabled": false,
        "gatewayUrl": "ws://localhost:18789",
        "token": "",
        "agentId": "main"
    },
    "openai": {
        "enabled": false,
        "apiKey": "",
        "baseURL": "https://api.openai.com/v1",
        "model": "gpt-4"
    },
    "anthropic": {
        "enabled": false,
        "apiKey": "",
        "baseURL": "https://api.anthropic.com",
        "model": "claude-3-opus-20240229"
    },
    "global": {
        "defaultProvider": "auto",
        "timeout": 60000,
        "streamMode": true
    }
}
```

---

### 2️⃣ 更新配置

**请求：**
```bash
POST http://localhost:8000/api/config/update
Content-Type: application/json

{
    "opencode": {
        "enabled": true,
        "baseURL": "http://localhost:12345",
        "model": "claude-3-opus"
    },
    "global": {
        "defaultProvider": "opencode",
        "timeout": 60000,
        "streamMode": true
    }
}
```

**响应：**
```json
{
    "success": true,
    "message": "配置保存成功"
}
```

**控制台输出：**
```
✅ 配置已更新
```

---

### 3️⃣ 测试连接

**请求：**
```bash
POST http://localhost:8000/api/config/test
Content-Type: application/json

{
    "provider": "opencode",
    "config": {
        "baseURL": "http://localhost:12345",
        "apiKey": ""
    }
}
```

**响应（服务未运行时）：**
```json
{
    "success": false,
    "error": "无法连接到 OpenCode，请检查服务是否运行"
}
```

**响应（服务正常运行时）：**
```json
{
    "success": true,
    "message": "OpenCode 版本: 1.0.0"
}
```

---

### 4️⃣ 获取可用提供商

**请求：**
```bash
GET http://localhost:8000/api/config/providers
```

**响应：**
```json
{
    "providers": ["opencode"],
    "default": "opencode",
    "all": ["opencode", "openclaw", "openai", "anthropic"]
}
```

---

## 📱 移动端使用流程

### 场景 1：配置 OpenCode（本地 AI）

```javascript
// 1. 用户打开 API 配置页面
// 2. 启用 OpenCode
uni.setStorageSync('opencode_config', {
    enabled: true,
    baseURL: 'http://localhost:12345',
    apiKey: '',
    model: 'claude-3-opus'
});

// 3. 点击测试连接
const testResult = await uni.request({
    url: 'http://localhost:8000/api/config/test',
    method: 'POST',
    data: {
        provider: 'opencode',
        config: {
            baseURL: 'http://localhost:12345',
            apiKey: ''
        }
    }
});

// 4. 显示测试结果
if (testResult.data.success) {
    uni.showToast({ title: '连接成功！', icon: 'success' });
    // 状态指示器变为绿色 🟢
} else {
    uni.showModal({ 
        title: '连接失败', 
        content: testResult.data.error 
    });
    // 状态指示器变为红色 🔴
}

// 5. 保存所有配置
await uni.request({
    url: 'http://localhost:8000/api/config/update',
    method: 'POST',
    data: {
        opencode: { enabled: true, ... },
        global: { defaultProvider: 'opencode' }
    }
});

uni.showToast({ title: '配置已保存', icon: 'success' });
```

---

### 场景 2：配置 OpenAI

```javascript
// 1. 用户输入 API Key
const openaiConfig = {
    enabled: true,
    apiKey: 'sk-abc123...', // 用户输入
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4'
};

// 2. 测试连接
const result = await uni.request({
    url: 'http://localhost:8000/api/config/test',
    method: 'POST',
    data: {
        provider: 'openai',
        config: openaiConfig
    }
});

// 3. 如果成功，显示可用模型数量
// 响应: { success: true, message: "连接成功！可用模型: 20 个" }

// 4. 保存配置
uni.setStorageSync('openai_config', openaiConfig);
```

---

## 🎨 UI 交互演示

### 状态指示器变化

```
初始状态:
┌──────┐ ┌──────┐ ┌──────┐
│ 🔧   │ │ 🦞   │ │ 🤖   │
│OpenCode│ OpenClaw│ OpenAI│
│  ⚪   │ │  ⚪   │ │  ⚪   │  ← 全部离线（灰色）
└──────┘ └──────┘ └──────┘

启用并测试成功后:
┌──────┐ ┌──────┐ ┌──────┐
│ 🔧   │ │ 🦞   │ │ 🤖   │
│OpenCode│ OpenClaw│ OpenAI│
│  🟢   │ │  ⚪   │ │  ⚪   │  ← OpenCode 在线（绿色）
└──────┘ └──────┘ └──────┘

测试失败时:
┌──────┐ ┌──────┐ ┌──────┐
│ 🔧   │ │ 🦞   │ │ 🤖   │
│OpenCode│ OpenClaw│ OpenAI│
│  🔴   │ │  ⚪   │ │  ⚪   │  ← 连接错误（红色）
└──────┘ └──────┘ └──────┘
```

### 开关交互动画

```
关闭状态 → 开启状态

┌─────────────────────┐     ┌─────────────────────┐
│  🔧 OpenCode    [○] │  →  │  🔧 OpenCode    [●] │
│     未启用          │     │     已启用 ✅       │
└─────────────────────┘     └─────────────────────┘
       ↓                           ↓
  灰色边框                      蓝色边框发光
  配置表单隐藏                   配置表单展开
```

### 测试按钮状态

```
┌─────────────────┐
│  🧪 测试连接    │  ← 初始状态（可点击）
└─────────────────┘

┌─────────────────┐
│     ⏳          │  ← 测试中（loading 动画）
└─────────────────┘

┌─────────────────┐
│  ✓ 已连接       │  ← 测试成功（绿色）
└─────────────────┘

┌─────────────────┐
│  ✕ 连接失败     │  ← 测试失败（红色）
└─────────────────┘
```

---

## 🔧 配置文件存储

### 手机端（本地存储）

```javascript
// 使用 uni-app 的本地存储
uni.getStorageSync('opencode_config');
uni.getStorageSync('openclaw_config');
uni.getStorageSync('openai_config');
uni.getStorageSync('global_config');
```

### PC 端（文件存储）

```
PC_Server/
└── config/
    └── api-config.json
```

**文件内容：**
```json
{
    "opencode": {
        "enabled": true,
        "baseURL": "http://localhost:12345",
        "apiKey": "",
        "model": "claude-3-opus"
    },
    "openclaw": {
        "enabled": false,
        "gatewayUrl": "ws://localhost:18789",
        "token": "",
        "agentId": "main"
    },
    "openai": {
        "enabled": false,
        "apiKey": "",
        "baseURL": "https://api.openai.com/v1",
        "model": "gpt-4"
    },
    "global": {
        "defaultProvider": "auto",
        "timeout": 60000,
        "streamMode": true
    }
}
```

---

## 📋 完整使用步骤总结

### 第一步：打开配置页面
```
首页 → 点击右上角 🔌 图标
   或
底部 TabBar → 点击 "API"
```

### 第二步：启用服务
```
找到要配置的 AI 提供商（OpenCode/OpenClaw/OpenAI）
→ 滑动开关启用
→ 配置表单自动展开
```

### 第三步：填写配置
```
OpenCode: 通常无需修改，使用默认 localhost:12345
OpenClaw: 填写 Gateway 地址（默认 localhost:18789）
OpenAI: 必须填写 API Key（sk-开头）
```

### 第四步：测试连接
```
点击 "🧪 测试连接" 按钮
→ 等待测试结果
→ 查看状态指示器颜色变化
```

### 第五步：保存配置
```
点击 "💾 保存所有配置"
→ 配置保存到手机和服务端
→ 显示成功提示
```

### 第六步：使用 AI
```
返回首页 → 开始聊天
→ 系统会自动使用已启用的 AI 提供商
```

---

## 🎯 快速验证

你可以用浏览器或 Postman 测试接口：

1. **获取配置：**
   ```
   http://localhost:8000/api/config
   ```

2. **测试 OpenCode：**
   ```bash
   curl -X POST http://localhost:8000/api/config/test \
     -H "Content-Type: application/json" \
     -d '{"provider":"opencode","config":{"baseURL":"http://localhost:12345"}}'
   ```

3. **启用 OpenCode：**
   ```bash
   curl -X POST http://localhost:8000/api/config/update \
     -H "Content-Type: application/json" \
     -d '{"opencode":{"enabled":true,"baseURL":"http://localhost:12345"}}'
   ```

---

**🎉 演示完成！现在你可以在手机上配置 API 了！**
