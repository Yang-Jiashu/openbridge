# Remote PC Commander (Node.js + OpenCode Edition)

这是一个强大的远程 PC 控制中心，集成了 **OpenCode (opencode-ai)** 的智能 Agent 能力，并通过 **PWA (Progressive Web App)** 提供类原生 App 的手机端体验。

## 特性
- **强力内核**：基于 OpenCode (类似 Claude Code)，支持代码理解、文件操作、LSP 智能提示。
- **手机 App 体验**：通过 PWA 技术，直接添加到手机主屏幕，无需下载安装包，全屏运行。
- **即插即用**：Node.js 驱动，一键启动。

## 快速开始

### 1. 前置要求
- 安装 [Node.js](https://nodejs.org/) (建议 v18+)。
- (可选) 安装 OpenCode CLI: `npm i -g opencode-ai`。

### 2. 安装与启动
双击 `start.bat` 即可自动安装依赖并启动服务。

或者手动运行：
```bash
cd remote-commander-node
npm install
node server.js
```

### 3. 手机端连接与安装 App
1. 确保手机和电脑在同一 WiFi 下。
2. 电脑运行 `ipconfig` 查看 IP (例如 `192.168.1.5`)。
3. 手机浏览器访问 `http://192.168.1.5:8000`。
4. **安装为 App**：
   - **iOS (Safari)**: 点击底部分享按钮 -> "添加到主屏幕"。
   - **Android (Chrome)**: 点击右上角菜单 -> "安装应用" 或 "添加到主屏幕"。
   - 现在你的桌面上会出现一个 "PC Commander" 图标，点开即用！

## OpenCode 集成说明
本项目使用 `@opencode-ai/sdk` 连接 OpenCode Agent。
- 如果你是第一次使用，可能需要配置 OpenCode 的 API Key 或启动本地服务。
- 编辑 `.env` 文件配置连接参数。

## 常见问题
- **依赖安装失败？** 请检查网络，或尝试配置 npm 镜像。
- **SDK 报错？** 确保 `@opencode-ai/sdk` 已正确安装，且 OpenCode 服务可访问。
