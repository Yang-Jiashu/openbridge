@echo off
chcp 65001 >nul
title PC Commander - 手机安装环境准备
echo.
echo ========================================
echo    📱 PC Commander - 手机安装准备
echo ========================================
echo.
echo 本工具将帮助你准备手机安装环境
echo.

:: 显示电脑 IP
echo [步骤 1/4] 获取电脑网络信息...
echo ----------------------------------------
echo 你的电脑 IP 地址（用于手机连接）：
ipconfig | findstr "IPv4" | findstr /V "192.168.137.1"
echo.
echo 💡 请记下上面的 IP 地址，手机配置时需要用到
echo.

:: 检查端口
echo [步骤 2/4] 检查服务器端口状态...
echo ----------------------------------------
netstat -ano | findstr :8000 >nul
if %errorlevel% == 0 (
    echo ✅ 端口 8000 已被占用（服务器可能已在运行）
) else (
    echo ⚠️  端口 8000 空闲（服务器未启动）
    echo    请先运行：启动测试环境.bat
echo.
)

:: 显示项目路径
echo [步骤 3/4] 项目路径信息...
echo ----------------------------------------
echo 手机端项目路径：
echo %CD%\Mobile_App_Source
echo.
echo 在 HBuilderX 中导入时选择上面的路径
echo.

:: 创建配置说明
echo [步骤 4/4] 生成配置说明...
echo ----------------------------------------
(
echo PC Commander - 手机配置信息
echo ==============================
echo.
echo 服务器地址：http://[你的电脑IP]:8000
echo 例如：http://192.168.1.5:8000
echo.
echo 配置步骤：
echo 1. 打开 HBuilderX
echo 2. 导入项目：%CD%\Mobile_App_Source
echo 3. 打开文件：pages/config/api.vue
echo 4. 修改第 85 行的 serverUrl
echo 5. 运行到手机
echo.
echo 遇到问题请参考：手机App安装指南.md
) > "手机配置说明.txt"

echo ✅ 已生成配置文件：手机配置说明.txt
echo.

:: 显示下一步
echo ========================================
echo    📋 下一步操作
echo ========================================
echo.
echo 1. 下载 HBuilderX
echo    https://www.dcloud.io/hbuilderx.html
echo.
echo 2. 开启手机 USB 调试
echo    设置 → 关于手机 → 连续点击"版本号"7次
echo    设置 → 开发者选项 → 开启"USB调试"
echo.
echo 3. 连接手机到电脑
echo    使用 USB 数据线连接
echo.
echo 4. 打开 HBuilderX 导入项目
echo    路径：%CD%\Mobile_App_Source
echo.
echo 5. 运行到手机
echo    HBuilderX → 运行 → 运行到手机或模拟器
echo.
echo 详细说明请查看：手机App安装指南.md
echo.

pause
