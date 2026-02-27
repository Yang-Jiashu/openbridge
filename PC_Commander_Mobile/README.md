# 📱 PC Commander Mobile - 独立手机App

这是一个使用 **React Native** 开发的独立手机应用，用于远程控制 PC。

## ✨ 特性

- **完全独立**: 不依赖 Uni-app 或 HBuilderX
- **原生性能**: 真正的 Android/iOS 原生应用
- **现代技术栈**: React Native 0.72 + React Navigation 6
- **精美UI**: Manifold AI 风格设计
- **功能完整**: AI 聊天、终端、文件管理、API 配置

## 🚀 快速开始

### 环境要求

- Node.js >= 16
- JDK >= 11
- Android Studio (用于 Android 开发)
- Xcode (用于 iOS 开发，仅限 Mac)

### 1. 安装依赖

```bash
cd PC_Commander_Mobile
npm install
```

### 2. 启动 Metro 服务器

```bash
npm start
```

### 3. 运行到设备

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

## 📦 打包发布

### Android APK

```bash
cd android
./gradlew assembleRelease
```

APK 文件将生成在: `android/app/build/outputs/apk/release/app-release.apk`

### iOS (需要 Mac + Xcode)

```bash
cd ios
xcodebuild -workspace PCCommander.xcworkspace -scheme PCCommander -configuration Release
```

## 📁 项目结构

```
PC_Commander_Mobile/
├── android/                  # Android 原生代码
│   ├── app/
│   │   ├── src/main/java/    # Java 代码
│   │   └── build.gradle      # Android 构建配置
│   └── build.gradle
├── src/
│   ├── screens/              # 页面组件
│   │   ├── HomeScreen.js     # 首页
│   │   ├── ConfigScreen.js   # API 配置
│   │   ├── ChatScreen.js     # AI 聊天
│   │   └── TerminalScreen.js # 终端
│   ├── components/           # 公共组件
│   ├── utils/                # 工具函数
│   │   └── api.js            # API 调用
│   └── constants/            # 常量
├── App.js                    # 应用入口
├── index.js                  # 注册组件
└── package.json              # 依赖配置
```

## 🎨 界面预览

### 首页
- 服务器状态显示
- 快捷操作按钮
- 最近活动列表

### API 配置
- 服务器地址配置
- OpenCode/OpenClaw 配置
- 语言切换
- API 日志

### AI 聊天
- 消息列表
- 快捷命令
- 实时响应

### 终端
- 命令执行
- 输出显示
- 历史记录

## 🔧 配置说明

在 `src/screens/ConfigScreen.js` 中修改默认配置:

```javascript
const [config, setConfig] = useState({
  serverUrl: 'http://192.168.1.5:8000',  // 你的 PC 服务器地址
  openCodeUrl: 'http://localhost:12345',
  openClawUrl: 'ws://localhost:18789',
  language: 'zh-CN',
});
```

## 🌐 API 接口

应用会调用以下 PC 服务器接口:

- `GET /api/health` - 健康检查
- `GET /api/config` - 获取配置
- `POST /api/chat` - AI 聊天
- `POST /api/execute` - 执行命令

## 📱 系统要求

- **Android**: 5.0+ (API 21+)
- **iOS**: 11.0+
- **网络**: WiFi 或移动数据

## 🔒 权限

应用需要以下权限:
- `INTERNET` - 网络访问
- `ACCESS_NETWORK_STATE` - 网络状态

## 🐛 调试

使用 React Native 开发者菜单:
- Android: 摇晃设备 或 `adb shell input keyevent 82`
- iOS: 在模拟器中按 `Cmd + D`

## 📄 许可证

MIT License

---

**这是一个完全独立的 React Native 项目！**
