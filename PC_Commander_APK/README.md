# 📱 PC Commander - Android App 项目

**这是一个完整的 Android Studio 项目，可以打包成 APK 安装包！**

---

## ✅ 项目状态

| 组件 | 状态 |
|------|------|
| Android 项目结构 | ✅ 完整 |
| 主 Activity | ✅ 完成 |
| WebView 界面 | ✅ 已集成 |
| 打包脚本 | ✅ 完成 |
| 签名配置 | ✅ 自动创建 |

---

## 🚀 获取 APK 的两种方式

### 方式一：一键打包（最简单）

1. **安装环境**
   - 下载并安装 [JDK 17](https://adoptium.net/temurin/releases/?version=17)
   - 下载并安装 [Android Studio](https://developer.android.com/studio)

2. **运行打包脚本**
   ```bash
   双击运行：一键打包APK.bat
   ```

3. **选择选项**
   ```
   [1] Debug APK - 快速测试
   [2] Release APK - 正式使用
   [3] 直接安装到手机
   ```

4. **获取 APK**
   - 脚本会自动生成 `PC_Commander_v1.0.0.apk`

### 方式二：Android Studio（可视化）

1. **打开项目**
   - 启动 Android Studio
   - File → Open → 选择 `PC_Commander_APK` 文件夹

2. **等待同步**
   - 等待 Gradle 同步完成

3. **构建 APK**
   - 菜单栏：Build → Build Bundle(s) / APK(s) → Build APK(s)

4. **找到 APK**
   - 位置：`app/build/outputs/apk/debug/app-debug.apk`

---

## 📁 项目结构

```
PC_Commander_APK/
├── 📱 app/
│   ├── src/main/
│   │   ├── java/com/pccommander/app/
│   │   │   └── MainActivity.java      # Android 原生代码
│   │   ├── res/                       # 资源文件
│   │   └── assets/
│   │       └── index.html             # App 界面
│   └── build.gradle                   # 构建配置
├── 🔧 build.gradle                    # 项目配置
├── 🚀 一键打包APK.bat                 # 打包脚本
├── 📖 打包说明.md                      # 详细说明
└── 📄 README.md                       # 本文件
```

---

## 📋 环境要求

| 软件 | 最低版本 | 用途 |
|------|----------|------|
| Java JDK | 17 | 编译代码 |
| Android Studio | 最新 | IDE + SDK |
| Android SDK | API 21+ | 支持 Android 5.0+ |

---

## 🎯 App 功能

打包后的 APK 包含：

- ✅ **首页** - 服务器状态、快捷操作
- ✅ **AI 聊天** - 与 PC 服务器对话
- ✅ **终端** - 执行命令
- ✅ **配置** - 服务器地址、中英文切换
- ✅ **原生体验** - 底部导航、流畅动画

---

## 📱 安装到手机

### 方法 1：传输安装
1. 把 `PC_Commander_v1.0.0.apk` 传到手机
2. 在手机上点击安装
3. 允许"未知来源"应用安装

### 方法 2：ADB 安装
```bash
adb install PC_Commander_v1.0.0.apk
```

### 方法 3：USB 直连
1. 手机开启 USB 调试
2. 连接电脑
3. 运行 `一键打包APK.bat` → 选择 `[3]`

---

## 🔑 签名信息

- **Debug**: 自动使用 Android 调试签名
- **Release**: 自动创建签名密钥
  - 文件：`keystore.jks`
  - 密码：`123456`
  - 别名：`pccommander`

---

## 🐛 常见问题

### "JAVA_HOME 未设置"
安装 JDK 并配置环境变量

### "找不到 Android SDK"
安装 Android Studio，配置 ANDROID_HOME

### 构建失败
- 检查网络连接
- 等待 Gradle 下载依赖
- 查看详细错误信息

---

## 📦 输出文件

打包成功后会生成：

| 文件 | 说明 |
|------|------|
| `PC_Commander_v1.0.0.apk` | Release 正式版 |
| `PC_Commander_v1.0.0_debug.apk` | Debug 测试版 |
| `keystore.jks` | 签名密钥 |

---

## 🎉 开始使用

### 最快路径（10分钟）：

1. ⬇️ 安装 JDK + Android Studio
2. 🖱️ 双击 `一键打包APK.bat`
3. 📱 把 APK 传到手机安装
4. ✅ 完成！

---

**现在就开始打包你的 APK！** 🚀

详细说明请查看：`打包说明.md`
