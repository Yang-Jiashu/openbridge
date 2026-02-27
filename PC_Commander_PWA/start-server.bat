@echo off
echo ========================================
echo    📱 PC Commander PWA 服务器
echo ========================================
echo.

cd /d "%~dp0"

echo 正在启动 HTTP 服务器...
echo.
echo 访问地址：
echo   本机: http://localhost:8080
echo   网络: http://%COMPUTERNAME%:8080
echo   手机: http://你的电脑IP:8080
echo.
echo 请在手机上用浏览器打开上面的地址
echo.
echo 按 Ctrl+C 停止服务器
echo.

:: 尝试使用 Python
python -m http.server 8080 >nul 2>&1
if %errorlevel% == 0 goto end

:: 尝试使用 Python3
python3 -m http.server 8080 >nul 2>&1
if %errorlevel% == 0 goto end

:: 尝试使用 Node.js
npx http-server -p 8080 >nul 2>&1
if %errorlevel% == 0 goto end

:: 尝试使用 PHP
php -S localhost:8080 >nul 2>&1
if %errorlevel% == 0 goto end

echo ❌ 无法启动服务器
echo.
echo 请安装以下任意一种：
echo   - Python: https://python.org
echo   - Node.js: https://nodejs.org
echo.
pause

:end
