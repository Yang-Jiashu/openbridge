@echo off
chcp 65001 >nul
title PC Commander - 测试环境启动器

echo ==========================================
echo   🚀 PC Commander - 一键测试启动器
echo ==========================================
echo.

:: 获取当前目录
set "BASE_DIR=%~dp0"
cd /d "%BASE_DIR%"

:: 显示选项
echo 请选择要启动的测试方式：
echo.
echo   [1] 启动 PC 服务器 + 打开 Web Dashboard
echo   [2] 打开 HTML 演示界面（无需服务器）
echo   [3] 仅启动 PC 服务器
echo   [4] 检查系统状态
echo   [5] 退出
echo.

set /p choice="请输入选项 (1-5): "

if "%choice%"=="1" goto start_server_dashboard
if "%choice%"=="2" goto open_html_demo
if "%choice%"=="3" goto start_server_only
if "%choice%"=="4" goto check_status
if "%choice%"=="5" goto exit
echo 无效选项，请重新运行
pause
exit

:start_server_dashboard
cls
echo ==========================================
echo   🚀 启动 PC 服务器 + Web Dashboard
echo ==========================================
echo.

echo [1/3] 检查 Node.js 环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装！请先安装 Node.js
    echo    下载地址: https://nodejs.org/
    pause
    exit
)
echo ✅ Node.js 已安装

echo.
echo [2/3] 启动服务器...
cd "PC_Server"

:: 检查 node_modules
if not exist "node_modules" (
    echo 📦 首次运行，安装依赖...
    npm install
)

echo 🚀 正在启动服务器...
start "PC Commander Server" cmd /k "npm start"

:: 等待服务器启动
timeout /t 3 /nobreak >nul

echo.
echo [3/3] 打开 Web Dashboard...
cd ..
start "" "PC_Web_Dashboard\dashboard.html"

echo.
echo ==========================================
echo   ✅ 启动完成！
echo ==========================================
echo.
echo 📡 服务器地址：
echo    本地: http://localhost:8000
echo    网络: http://%COMPUTERNAME%:8000
echo.
echo 🌐 Dashboard 已在浏览器打开
echo.
echo 💡 提示：
echo    - 服务器窗口可以最小化，不要关闭
echo    - 手机访问时请使用网络地址
echo    - 按任意键退出此窗口（服务器继续运行）
echo.
pause
exit

:open_html_demo
cls
echo ==========================================
echo   📱 打开 HTML 演示界面
echo ==========================================
echo.

echo 请选择演示界面：
echo   [1] 完整预览（支持中英文切换）✨推荐
echo   [2] Manifold 风格预览
echo   [3] 简约风格预览
echo   [4] 返回上级菜单
echo.

set /p demo_choice="请输入选项 (1-4): "

if "%demo_choice%"=="1" start "" "完整预览-可切换语言.html" & exit
if "%demo_choice%"=="2" start "" "Manifold风格预览.html" & exit
if "%demo_choice%"=="3" start "" "简约风格预览.html" & exit
if "%demo_choice%"=="4" goto start
echo 无效选项
pause
goto open_html_demo

:start_server_only
cls
echo ==========================================
echo   🚀 仅启动 PC 服务器
echo ==========================================
echo.

cd "PC_Server"

:: 检查 node_modules
if not exist "node_modules" (
    echo 📦 首次运行，安装依赖...
    npm install
)

echo 🚀 正在启动服务器...
npm start
pause
exit

:check_status
cls
echo ==========================================
echo   🔍 系统状态检查
echo ==========================================
echo.

echo [系统信息]
echo 计算机名: %COMPUTERNAME%
echo 用户名: %USERNAME%
echo.

echo [Node.js 状态]
node --version 2>nul && echo ✅ Node.js 已安装 || echo ❌ Node.js 未安装
echo.

echo [网络状态]
echo 本机 IP 地址：
ipconfig | findstr /i "IPv4"
echo.

echo [端口状态]
echo 检查 8000 端口占用：
netstat -ano | findstr :8000 && (
    echo ⚠️  端口 8000 已被占用
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
        echo 占用进程 PID: %%a
        tasklist /FI "PID eq %%a" 2>nul | findstr /I "PID"
    )
) || echo ✅ 端口 8000 可用
echo.

echo [文件检查]
if exist "PC_Server\server.js" (
    echo ✅ PC 服务器文件存在
) else (
    echo ❌ PC 服务器文件缺失
)

if exist "Mobile_App_Source\pages\index\index.vue" (
    echo ✅ 手机端 App 文件存在
) else (
    echo ❌ 手机端 App 文件缺失
)
echo.

pause
goto start

:exit
exit
