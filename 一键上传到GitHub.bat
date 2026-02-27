@echo off
chcp 65001 >nul
title 上传项目到 GitHub
echo.
echo ========================================
echo    🚀 一键上传到 GitHub
echo ========================================
echo.

cd /d "%~dp0"

:: 检查 Git
where git >nul 2>nul
if errorlevel 1 (
    echo ❌ Git 未安装！
    echo.
    echo 正在下载 Git...
    start https://git-scm.com/download/win
    echo.
    echo 请安装 Git 后重新运行此脚本
    pause
    exit
)

echo ✅ Git 已安装

:: 输入 GitHub 用户名
echo.
set /p username="请输入你的 GitHub 用户名: "
set /p repo="请输入仓库名 (默认: pc-commander): "
if "%repo%"=="" set repo=pc-commander

echo.
echo ========================================
echo 准备上传到: %username%/%repo%
echo ========================================
echo.

:: 初始化 Git
if not exist ".git" (
    echo [1/5] 初始化 Git 仓库...
    git init
) else (
    echo [1/5] Git 仓库已存在
)

:: 配置 Git
echo [2/5] 配置 Git...
git config user.email "user@example.com" >nul 2>nul
git config user.name "%username%" >nul 2>nul

:: 添加文件
echo [3/5] 添加文件...
git add .

:: 提交
echo [4/5] 提交更改...
git commit -m "Initial commit - PC Commander App" >nul 2>nul
if errorlevel 1 (
    echo 没有新文件需要提交，继续...
)

:: 关联远程仓库
echo [5/5] 推送到 GitHub...
git remote remove origin >nul 2>nul
git remote add origin https://github.com/%username%/%repo%.git

:: 推送
git push -u origin main 2>nul || git push -u origin master

if errorlevel 1 (
    echo.
    echo ❌ 推送失败！
    echo.
    echo 可能原因：
    echo 1. 仓库不存在，请先创建仓库
    echo    访问: https://github.com/new
    echo 2. 需要登录 GitHub
    echo.
    echo 创建仓库步骤：
    echo 1. 打开 https://github.com/new
    echo 2. 仓库名填写: %repo%
    echo 3. 点击 Create repository
    echo 4. 重新运行此脚本
    echo.
    start https://github.com/new
    pause
    exit
)

echo.
echo ========================================
echo    ✅ 上传成功！
echo ========================================
echo.
echo 仓库地址:
echo https://github.com/%username%/%repo%
echo.
echo APK 下载地址:
echo https://github.com/%username%/%repo%/releases
echo.
echo 提示：
echo 1. 访问上面的链接查看代码
echo 2. 点击 Actions 标签查看构建状态
echo 3. 等待 3-5 分钟后访问 releases 下载 APK
echo.
pause
