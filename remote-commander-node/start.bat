@echo off
echo ===========================================
echo       Remote PC Commander (Node.js)
echo ===========================================

:: 检查 Node.js 是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js 未安装！
    echo 请先下载并安装 Node.js: https://nodejs.org/
    pause
    exit
)

:: 检查依赖是否安装
if not exist "node_modules" (
    echo [INFO] 正在安装依赖...
    call npm install
)

:: 启动服务
echo [INFO] 正在启动服务...
echo 请在手机浏览器访问 http://[你的电脑IP]:8000
echo.
node server.js
pause
