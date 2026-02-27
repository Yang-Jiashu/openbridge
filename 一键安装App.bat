@echo off
chcp 65001 >nul
title PC Commander - 手机App安装工具
echo.
echo ========================================
echo    📱 PC Commander - App安装工具
echo ========================================
echo.

cd /d "%~dp0\PC_Commander_Mobile"

echo 检查环境...
echo.

:: 检查 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装！
    echo.
    echo 请先安装 Node.js:
    echo https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
    echo.
    pause
    exit
)
echo ✅ Node.js 已安装

:: 检查 Java
java --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java JDK 未安装！
    echo.
    echo 请先安装 JDK:
    echo https://adoptium.net/temurin/releases/?version=17
    echo.
    pause
    exit
)
echo ✅ Java 已安装

echo.
echo ========================================
echo 请选择安装方式：
echo ========================================
echo.
echo [1] 直接安装到手机（需要USB调试）
echo [2] 生成 APK 文件（可手动安装）
echo [3] 检查手机连接状态
echo [4] 退出
echo.

set /p choice="请输入选项 (1-4): "

if "%choice%"=="1" goto install_to_phone
if "%choice%"=="2" goto build_apk
if "%choice%"=="3" goto check_device
if "%choice%"=="4" exit
echo 无效选项
pause
exit

:install_to_phone
echo.
echo ========================================
echo    安装到手机
echo ========================================
echo.

echo [1/4] 检查手机连接...
adb devices | findstr "device" | findstr /V "List" >nul
if errorlevel 1 (
    echo ❌ 未检测到手机！
    echo.
    echo 请检查：
    echo 1. 手机是否通过USB连接到电脑
    echo 2. 手机是否开启USB调试模式
    echo    设置→关于手机→连续点击版本号7次
    echo    设置→开发者选项→开启USB调试
    echo 3. 是否允许此电脑调试（手机上会弹出提示）
    echo.
    pause
    exit
)
echo ✅ 手机已连接
echo.

echo [2/4] 安装依赖...
call npm install
if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    exit
)
echo ✅ 依赖安装完成
echo.

echo [3/4] 启动 Metro 服务器...
start "Metro Server" cmd /k "npm start"
echo ✅ Metro 服务器已启动
echo.

echo [4/4] 编译并安装App...
echo 正在编译，请稍候（可能需要几分钟）...
call npx react-native run-android
if errorlevel 1 (
    echo ❌ 安装失败
    echo 请检查错误信息
    pause
    exit
)

echo.
echo ========================================
echo    ✅ 安装成功！
echo ========================================
echo.
echo App已安装到手机，请在手机上查看
echo.
pause
exit

:build_apk
echo.
echo ========================================
echo    生成 APK 文件
echo ========================================
echo.

echo [1/3] 安装依赖...
call npm install
if errorlevel 1 (
    echo ❌ 依赖安装失败
    pause
    exit
)
echo ✅ 依赖安装完成
echo.

echo [2/3] 清理旧构建...
cd android
call gradlew clean
cd ..
echo ✅ 清理完成
echo.

echo [3/3] 构建 Release APK...
echo 正在编译，这可能需要5-10分钟...
cd android
call gradlew assembleRelease
if errorlevel 1 (
    echo ❌ 构建失败
    cd ..
    pause
    exit
)
cd ..

echo ✅ 构建完成！
echo.

:: 复制 APK 到根目录
set APK_SOURCE=android\app\build\outputs\apk\release\app-release.apk
set APK_NAME=PC_Commander_v1.0.0.apk
set APK_DEST=%~dp0\%APK_NAME%

copy /Y "%APK_SOURCE%" "%APK_DEST%" >nul

echo ========================================
echo    ✅ APK 生成成功！
echo ========================================
echo.
echo 📱 APK位置：
echo %APK_DEST%
echo.
echo 安装方式：
echo 1. 将APK文件传到手机
echo 2. 在手机上点击安装
echo 3. 如提示"未知来源"，请允许安装
echo.
echo 或者使用ADB安装：
echo adb install "%APK_DEST%"
echo.
pause
exit

:check_device
echo.
echo ========================================
echo    检查设备连接
echo ========================================
echo.
echo 已连接的设备：
echo ----------------------------------------
adb devices
echo ----------------------------------------
echo.
if errorlevel 1 (
    echo ❌ ADB 未找到，请安装 Android Studio
) else (
    echo 如果看到设备列表，说明连接正常
    echo 如果列表为空，请检查USB调试是否开启
)
echo.
pause
exit
