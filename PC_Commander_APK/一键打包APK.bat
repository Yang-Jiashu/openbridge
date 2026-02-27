@echo off
chcp 65001 >nul
title PC Commander - APK 打包工具
echo.
echo ========================================
echo    📱 PC Commander APK 打包工具
echo ========================================
echo.

cd /d "%~dp0"

echo 检查环境...
echo.

:: 检查 Java
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java JDK 未安装！
    echo.
    echo 请先安装 JDK 17：
    echo https://adoptium.net/temurin/releases/?version=17
    echo.
    pause
    exit
)
echo ✅ Java 已安装

:: 检查 Android SDK
if "%ANDROID_HOME%"=="" (
    echo ❌ ANDROID_HOME 环境变量未设置！
    echo.
    echo 请安装 Android Studio 并配置 SDK
    echo https://developer.android.com/studio
    echo.
    pause
    exit
)
echo ✅ Android SDK 已配置

:: 检查 gradle
if not exist "gradlew.bat" (
    echo 📦 创建 Gradle Wrapper...
    call gradle wrapper
)

echo.
echo ========================================
echo    选择打包方式
echo ========================================
echo.
echo [1] 调试版 APK (Debug) - 快速测试
echo [2] 发布版 APK (Release) - 正式使用
echo [3] 安装到手机 (需要USB调试)
echo [4] 退出
echo.

set /p choice="请输入选项 (1-4): "

if "%choice%"=="1" goto build_debug
if "%choice%"=="2" goto build_release
if "%choice%"=="3" goto install_device
if "%choice%"=="4" exit
echo 无效选项
pause
exit

:build_debug
echo.
echo ========================================
echo    构建 Debug APK
echo ========================================
echo.

echo 开始构建，请稍候...
call gradlew.bat assembleDebug

if errorlevel 1 (
    echo ❌ 构建失败！
    pause
    exit
)

echo ✅ 构建成功！
echo.

:: 复制到根目录
set APK_SOURCE=app\build\outputs\apk\debug\app-debug.apk
set APK_NAME=PC_Commander_v1.0.0_debug.apk

copy /Y "%APK_SOURCE%" "%APK_NAME%" >nul

echo 📱 APK 文件：
echo %CD%\%APK_NAME%
echo.
echo 安装方式：
echo 1. 把 APK 传到手机
echo 2. 在手机上点击安装
echo 3. 允许"未知来源"安装
echo.
pause
exit

:build_release
echo.
echo ========================================
echo    构建 Release APK
echo ========================================
echo.

:: 检查签名配置
if not exist "keystore.jks" (
    echo ⚠️  未找到签名密钥，创建新密钥...
    echo.
    
    keytool -genkeypair -v -storetype PKCS12 -keystore keystore.jks -alias pccommander -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=PC Commander, OU=Dev, O=Dev, L=City, ST=State, C=US" -storepass 123456 -keypass 123456
    
    if errorlevel 1 (
        echo ❌ 创建密钥失败！
        pause
        exit
    )
    
    echo ✅ 密钥已创建
    echo.
    echo 密钥信息：
    echo   文件：keystore.jks
    echo   密码：123456
    echo   别名：pccommander
    echo.
)

:: 创建 signing.properties
echo STORE_FILE=../keystore.jks > app\signing.properties
echo STORE_PASSWORD=123456 >> app\signing.properties
echo KEY_ALIAS=pccommander >> app\signing.properties
echo KEY_PASSWORD=123456 >> app\signing.properties

echo 开始构建 Release APK，请稍候...
call gradlew.bat assembleRelease

if errorlevel 1 (
    echo ❌ 构建失败！
    pause
    exit
)

echo ✅ 构建成功！
echo.

:: 复制到根目录
set APK_SOURCE=app\build\outputs\apk\release\app-release.apk
set APK_NAME=PC_Commander_v1.0.0.apk

copy /Y "%APK_SOURCE%" "%APK_NAME%" >nul

echo ========================================
echo    ✅ APK 生成成功！
echo ========================================
echo.
echo 📱 APK 文件：
echo %CD%\%APK_NAME%
echo.
echo 文件大小：
for %%I in ("%APK_NAME%") do echo   %%~zI bytes
echo.
echo 安装方式：
echo 1. 把 APK 传到手机
echo 2. 在手机上点击安装
echo 3. 允许"未知来源"安装
echo.
echo 或者使用 ADB 安装：
echo   adb install %APK_NAME%
echo.
pause
exit

:install_device
echo.
echo ========================================
echo    安装到手机
echo ========================================
echo.

echo 检查设备连接...
adb devices | findstr "device" | findstr /V "List" >nul
if errorlevel 1 (
    echo ❌ 未检测到手机！
    echo.
    echo 请检查：
    echo 1. 手机是否通过USB连接
echo 2. 是否开启USB调试
echo    设置→关于手机→点击版本号7次
echo    设置→开发者选项→开启USB调试
echo.
    pause
    exit
)

echo ✅ 设备已连接
echo.

:: 先构建 debug 版本
if not exist "app\build\outputs\apk\debug\app-debug.apk" (
    echo 构建 Debug APK...
    call gradlew.bat assembleDebug
)

echo 安装到手机...
adb install -r "app\build\outputs\apk\debug\app-debug.apk"

if errorlevel 1 (
    echo ❌ 安装失败！
    pause
    exit
)

echo ✅ 安装成功！
echo.
echo 请在手机上查看应用
echo.
pause
exit
