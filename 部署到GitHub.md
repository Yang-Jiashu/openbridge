# 🚀 部署到 GitHub - 自动生成 APK

## 📋 操作步骤（5分钟搞定）

### 步骤 1：创建 GitHub 仓库

1. 打开 https://github.com/new
2. 填写仓库信息：
   - Repository name: `pc-commander`
   - Description: `开源远程控制解决方案`
   - 选择 **Public**（公开）
   - ✅ 勾选 "Add a README file"
3. 点击 **Create repository**

### 步骤 2：上传代码

**方式一：GitHub 网页上传（最简单）**

1. 在你的仓库页面，点击 **"Add file"** → **"Upload files"**
2. 拖拽整个项目文件夹到上传区域
3. 等待上传完成
4. 点击 **"Commit changes"**

**方式二：Git 命令行**

```bash
# 进入项目目录
cd PC

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 关联远程仓库（替换为你的用户名）
git remote add origin https://github.com/你的用户名/pc-commander.git

# 推送
git push -u origin main
```

### 步骤 3：触发自动构建

上传完成后，GitHub Actions 会自动开始构建！

1. 在你的仓库页面，点击 **"Actions"** 标签
2. 你会看到构建任务正在运行
3. 等待 3-5 分钟，构建完成

### 步骤 4：下载 APK

构建完成后：

1. 点击仓库页面的 **"Releases"** 标签
2. 或者直接访问：`https://github.com/你的用户名/pc-commander/releases`
3. 下载最新的 APK 文件！

---

## 🎯 工作原理

```
你推送代码
    ↓
GitHub Actions 检测到推送
    ↓
自动运行构建脚本
    ↓
编译生成 APK
    ↓
自动发布到 Releases
    ↓
你可以下载安装！
```

---

## 📱 获取 APK 的 3 种方式

### 方式 1：Releases 页面

```
https://github.com/你的用户名/pc-commander/releases
```

### 方式 2：直接链接（最新版）

```
https://github.com/你的用户名/pc-commander/releases/latest
```

### 方式 3：GitHub Actions 产物

1. 进入 Actions 页面
2. 点击最新的工作流运行
3. 在 Artifacts 部分下载 APK

---

## 🔄 更新 App

每次更新代码：

```bash
# 修改代码后
git add .
git commit -m "更新说明"
git push
```

GitHub 会自动：
1. 重新构建 APK
2. 发布新版本
3. 你可以在 Releases 下载最新版

---

## 🏷️ 发布正式版本

### 创建版本标签

```bash
# 创建标签（版本号）
git tag -a v1.0.0 -m "第一个正式版本"

# 推送标签
git push origin v1.0.0
```

推送标签后，GitHub 会自动：
- 创建 Release
- 构建 APK
- 发布到 Releases 页面

---

## ⚙️ 配置文件说明

### `.github/workflows/build-android.yml`

这个文件配置 GitHub Actions 自动构建 Android APK：

```yaml
on:
  push:
    branches: [ main ]      # 推送到 main 分支时触发
    tags: [ 'v*' ]          # 推送标签时触发
```

### 构建步骤

1. **检出代码** - 获取最新代码
2. **设置 JDK** - 安装 Java 17
3. **缓存 Gradle** - 加速构建
4. **构建 APK** - 编译生成 APK
5. **上传产物** - 保存构建结果
6. **发布 Release** - 自动创建发布页面

---

## 🐛 常见问题

### Q: 构建失败了怎么办？

**A:** 
1. 点击 Actions 标签查看详细日志
2. 检查错误信息
3. 修复代码后重新推送

### Q: 在哪里下载 APK？

**A:** 
- Releases 页面：`github.com/用户名/仓库/releases`
- 或者 Actions 页面的 Artifacts

### Q: 可以自定义版本号吗？

**A:** 
可以！创建 tag 时指定版本号：
```bash
git tag v1.2.3
git push origin v1.2.3
```

### Q: 支持 iOS 吗？

**A:** 
- 原生 Android 项目：只生成 APK
- Flutter 项目：同时生成 APK 和 IPA（需要配置苹果证书）

---

## 📱 安装到手机

### Android

1. 下载 APK 文件
2. 点击安装
3. 允许"未知来源"（设置 → 安全 → 未知来源）
4. 完成！

### iOS

iOS 需要额外配置：
1. 需要 Apple 开发者账号
2. 或使用 TestFlight 分发
3. 或使用企业签名

---

## 🎉 完成！

现在你已经：
- ✅ 创建了 GitHub 仓库
- ✅ 配置了自动构建
- ✅ 可以下载 APK 安装包

**每次推送代码，GitHub 都会自动构建新的 APK！**

就像应用商店一样方便！🚀
