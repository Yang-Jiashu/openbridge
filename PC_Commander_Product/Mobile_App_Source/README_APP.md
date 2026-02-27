# PC Commander - 移动端 App 项目

这是一个 **Uni-app** 项目，用于生成 Android App、iOS App 或微信小程序。

## 功能特性
- **纯正 App 体验**：非网页套壳，原生导航栏和交互。
- **灵活连接**：支持配置服务器地址，可连接局域网 IP 或公网 Ngrok 域名。
- **暗黑模式**：默认采用极客风的暗色主题。

## 开发与打包指南

### 1. 准备环境
你需要下载 **HBuilderX** (推荐) 或使用 VS Code + Uni-app 插件。
- 下载地址：[https://www.dcloud.io/hbuilderx.html](https://www.dcloud.io/hbuilderx.html)

### 2. 导入项目
1. 打开 HBuilderX。
2. 点击 `文件` -> `导入` -> `从本地目录导入`。
3. 选择本文件夹 `remote-commander-uniapp`。

### 3. 真机调试 (推荐)
1. 用数据线连接你的安卓手机，并开启“USB 调试”模式。
2. 在 HBuilderX 顶部菜单点击 `运行` -> `运行到手机或模拟器` -> 选择你的设备。
3. 此时手机上会自动安装并打开 `HBuilder` 基座应用，你可以实时看到效果。

### 4. 打包发布 (生成 APK)
如果你想生成一个独立的 APK 安装包发给别人：
1. HBuilderX 顶部菜单点击 `发行` -> `原生App-云打包`。
2. 勾选 `Android` (使用 DCloud 公共证书即可快速打包)。
3. 点击 `打包`，等待几分钟，你会得到一个下载链接。
4. 下载 APK 并安装到手机。

### 5. 配合后端使用
1. 确保电脑上的 `remote-commander-node` 服务已启动（运行 `start.bat`）。
2. 手机 App 打开后，首次会跳转到“服务器设置”页面。
3. **局域网模式**：输入电脑 IP，如 `http://192.168.1.5:8000`。
4. **远程模式**：输入 Ngrok 地址，如 `https://xxxx.ngrok-free.app`。

## 注意事项
- **网络权限**：Android 打包时已在 `manifest.json` 声明了网络权限。
- **跨域问题**：App 端不存在跨域限制（CORS），可以直接请求任意 API。但如果你编译成 H5/小程序，则需要注意服务端的 CORS 设置（我们的 server.js 已配置允许所有跨域）。
