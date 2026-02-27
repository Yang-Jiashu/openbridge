# 🔌 API 配置指南

本指南介绍如何在 OpenCode Remote 应用中配置各种 AI 提供商的 API。

## 📱 打开 API 配置页面

### 方法一：通过首页入口
1. 打开应用进入首页
2. 点击右上角的 🔌 图标
3. 进入 API 配置页面

### 方法二：通过底部导航
1. 点击底部导航栏的 **API** 标签
2. 直接进入 API 配置页面

## 🔧 支持的 AI 提供商

### 1. OpenCode（推荐）
本地 AI 编程助手，无需 API Key，直接在本地运行。

**默认配置：**
- API 地址: `http://localhost:12345`
- 模型: `claude-3-opus`

**配置步骤：**
1. 启用 OpenCode 开关
2. 确认 API 地址（如果修改了端口请更新）
3. 点击 **测试连接** 验证

---

### 2. OpenClaw（推荐）
个人 AI 助手，用于控制电脑执行任务。

**默认配置：**
- Gateway 地址: `ws://localhost:18789`
- Agent ID: `main`

**配置步骤：**
1. 启用 OpenClaw 开关
2. 确认 Gateway 地址
3. 如有需要，输入 Token
4. 点击 **测试连接** 验证

---

### 3. OpenAI
支持 GPT-4、GPT-3.5 等模型。

**需要：**
- API Key（必需）
- Base URL（可选，默认使用官方 API）

**配置步骤：**
1. 启用 OpenAI 开关
2. 输入你的 OpenAI API Key（格式: `sk-...`）
3. 选择模型（GPT-4 / GPT-3.5）
4. 点击 **测试连接** 验证

**获取 API Key：**
访问 https://platform.openai.com/api-keys

---

### 4. Anthropic（计划中）
Claude 系列模型（暂未完整支持）。

## ⚙️ 高级设置

### 默认 AI 提供商
- **Auto**: 自动选择第一个可用的提供商
- **OpenCode**: 优先使用 OpenCode
- **OpenClaw**: 优先使用 OpenClaw
- **OpenAI**: 优先使用 OpenAI

### 请求超时
- 范围: 10-120 秒
- 默认: 60 秒
- 网络较慢时建议增加

### 流式响应
- 启用时: 实时显示 AI 回复
- 关闭时: 等待完整响应后显示

## 🧪 测试连接

配置完成后，点击 **测试连接** 按钮验证：

| 状态 | 含义 |
|------|------|
| 🟢 在线 | 连接成功，可以正常使用 |
| 🔴 错误 | 配置有误或服务未运行 |
| ⚪ 离线 | 未启用或尚未测试 |

## 💾 保存配置

1. 配置完成后，点击 **保存所有配置** 按钮
2. 配置会同步保存到：
   - 手机本地存储
   - PC 服务端配置文件

## 🔄 重置默认

如果需要恢复默认设置：
1. 点击 **重置默认** 按钮
2. 确认重置操作
3. 所有配置将恢复为默认值

## 🔐 安全提示

1. **API Key 安全**
   - 不要与他人分享你的 API Key
   - 定期更换 API Key
   - 仅使用具有必要权限的 Key

2. **本地服务**
   - OpenCode 和 OpenClaw 在本地运行，无需联网
   - 确保防火墙允许本地端口访问

3. **HTTPS**
   - 生产环境建议使用 HTTPS
   - 内网使用 HTTP 即可

## 🛠️ 故障排除

### OpenCode 连接失败
```
解决方案：
1. 检查 OpenCode 是否已启动
2. 确认端口 12345 未被占用
3. 检查防火墙设置
4. 尝试重启 OpenCode 服务
```

### OpenClaw 连接失败
```
解决方案：
1. 检查 OpenClaw 是否已启动
2. 确认 Gateway 地址正确
3. 检查端口 18789 是否开放
4. 如有 Token，确认 Token 正确
```

### OpenAI 连接失败
```
解决方案：
1. 确认 API Key 格式正确（sk-开头）
2. 检查账户余额是否充足
3. 确认网络可以访问 OpenAI API
4. 尝试使用代理（如有需要）
```

## 📡 服务端 API 接口

服务端提供以下配置管理接口：

### 获取配置
```
GET /api/config
```

### 更新配置
```
POST /api/config/update
Content-Type: application/json

{
  "opencode": { "enabled": true, "baseURL": "..." },
  "openclaw": { "enabled": true, "gatewayUrl": "..." },
  "openai": { "enabled": true, "apiKey": "..." }
}
```

### 测试连接
```
POST /api/config/test
Content-Type: application/json

{
  "provider": "openai",
  "config": { "apiKey": "sk-..." }
}
```

### 获取可用提供商
```
GET /api/config/providers
```

## 🎨 状态指示器

页面顶部的状态卡片显示各提供商的连接状态：

- **绿色圆点**: 连接正常
- **红色圆点**: 连接错误
- **灰色圆点**: 未启用或离线

点击状态卡片可以快速跳转到对应配置项。
