# 🚀 PC Commander

[![Build Android](https://github.com/yourusername/pc-commander/actions/workflows/build-android.yml/badge.svg)](https://github.com/yourusername/pc-commander/actions)
[![Build Flutter](https://github.com/yourusername/pc-commander/actions/workflows/build-flutter.yml/badge.svg)](https://github.com/yourusername/pc-commander/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🌍 **全球首款开源 AI 增强型跨平台远程控制解决方案**

[English](#english) | [中文](#中文)

---

## 📱 下载安装

### 最新版本

📥 **[点击下载最新 APK](https://github.com/yourusername/pc-commander/releases/latest)**

或者扫描下方二维码：

```
[二维码占位符]
```

### 系统要求

- **Android**: 5.0+ (API 21+)
- **iOS**: 11.0+
- **网络**: 与 PC 在同一局域网

### 安装步骤

1. 下载 APK 文件
2. 在手机上点击安装
3. 允许"未知来源"应用（设置 → 安全 → 未知来源）
4. 打开应用，配置服务器地址

---

## ✨ 功能特性

### 🎯 核心功能
- 🤖 **AI 智能助手** - 自然语言控制电脑
- 💻 **远程终端** - 执行任意命令
- 📂 **文件管理** - 上传下载文件
- 🖥️ **屏幕共享** - 实时查看和控制
- 🔒 **安全加密** - 端到端加密传输

### 🌍 国际化
- 🇨🇳 简体中文
- 🇨🇳 繁体中文
- 🇺🇸 English
- 🇯🇵 日本語
- 🇰🇷 한국어

### 📱 跨平台支持
| 平台 | 状态 |
|------|------|
| Android | ✅ 可用 |
| iOS | ✅ 可用 |
| Windows | 🚧 开发中 |
| macOS | 🚧 开发中 |
| Linux | 🚧 开发中 |
| Web | ✅ 可用 |

---

## 🚀 快速开始

### 1. 安装手机 App

从 [Releases](https://github.com/yourusername/pc-commander/releases) 页面下载最新 APK。

### 2. 启动 PC 服务器

```bash
# 克隆仓库
git clone https://github.com/yourusername/pc-commander.git
cd pc-commander

# 安装依赖
npm install

# 启动服务器
npm start
```

### 3. 配置连接

1. 打开手机 App
2. 进入"配置"页面
3. 输入 PC 的 IP 地址：`http://192.168.x.x:8000`
4. 点击"测试连接"
5. 开始使用！

---

## 🛠️ 开发构建

### 自动构建（GitHub Actions）

本项目配置了 GitHub Actions，每次推送代码会自动构建 APK：

```yaml
# .github/workflows/build-android.yml
name: Build Android APK
on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]
```

构建完成的 APK 会自动发布到 [Releases](https://github.com/yourusername/pc-commander/releases) 页面。

### 手动构建

#### Android (原生)

```bash
cd PC_Commander_APK

# 构建 Debug 版本
./gradlew assembleDebug

# 构建 Release 版本
./gradlew assembleRelease

# APK 输出位置
# app/build/outputs/apk/debug/app-debug.apk
# app/build/outputs/apk/release/app-release.apk
```

#### Flutter (跨平台)

```bash
cd flutter_app

# 获取依赖
flutter pub get

# 构建 Android
flutter build apk --release

# 构建 iOS
flutter build ios --release

# 构建 Web
flutter build web
```

---

## 🏗️ 项目结构

```
pc-commander/
├── 📱 PC_Commander_APK/          # Android 原生项目
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/             # Java 源代码
│   │   │   └── assets/           # Web 资源
│   │   └── build.gradle
│   └── build.gradle
│
├── 📱 flutter_app/               # Flutter 跨平台项目
│   ├── lib/
│   │   ├── main.dart
│   │   ├── screens/              # 页面
│   │   ├── services/             # API 服务
│   │   └── l10n/                 # 国际化
│   └── pubspec.yaml
│
├── 💻 server/                    # 服务器端
│   ├── src/
│   └── package.json
│
├── 🌐 web/                       # Web 版本
│   └── index.html
│
├── 📚 docs/                      # 文档
│   ├── en/
│   ├── zh/
│   └── ja/
│
├── .github/
│   └── workflows/                # GitHub Actions
│       ├── build-android.yml
│       └── build-flutter.yml
│
└── README.md
```

---

## 🤝 参与贡献

我们欢迎所有形式的贡献！

### 提交代码

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 报告问题

- 使用 [GitHub Issues](https://github.com/yourusername/pc-commander/issues)
- 描述问题时请提供：
  - 设备型号和系统版本
  - 复现步骤
  - 期望行为和实际行为
  - 截图（如有）

---

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

```
MIT License

Copyright (c) 2024 PC Commander Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 致谢

感谢所有贡献者和支持本项目的用户！

特别感谢：
- [Flutter](https://flutter.dev/) - 跨平台框架
- [React](https://react.dev/) - UI 库
- [OpenCode](https://opencode.ai/) - AI 编程助手
- [OpenClaw](https://openclaw.ai/) - AI 助手

---

## 📞 联系我们

- 📧 Email: contact@pc-commander.com
- 💬 Discord: [加入社区](https://discord.gg/pc-commander)
- 🐦 Twitter: [@PCCommander](https://twitter.com/PCCommander)
- 📱 微信: PCCommander

---

## ⭐ Star 历史

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/pc-commander&type=Date)](https://star-history.com/#yourusername/pc-commander&Date)

---

**Made with ❤️ by the PC Commander Team**

---

## English

### Introduction

PC Commander is the world's first open-source AI-enhanced cross-platform remote control solution.

### Features

- 🤖 AI Smart Assistant
- 💻 Remote Terminal
- 📂 File Management
- 🖥️ Screen Sharing
- 🔒 End-to-end Encryption
- 🌍 Multi-language Support

### Installation

Download the latest APK from [Releases](https://github.com/yourusername/pc-commander/releases).

### Quick Start

1. Install the mobile app
2. Start the PC server
3. Configure connection
4. Enjoy!

### Contributing

Pull requests are welcome. For major changes, please open an issue first.

### License

[MIT](LICENSE)
