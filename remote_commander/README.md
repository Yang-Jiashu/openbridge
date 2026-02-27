# Remote PC Controller

这是一个简易的远程 PC 控制工具，允许你通过手机浏览器使用自然语言控制你的电脑。它模仿了 Claude Code 的 Agent 模式，可以自主规划并执行任务。

## 功能
- **自然语言交互**：说出你想做的，AI 帮你执行。
- **文件管理**：查看、读取、修改文件（例如修改实验参数 `config.yaml`）。
- **命令执行**：运行系统命令，查看进程，运行 Python 脚本。
- **实验监控**：询问“我的实验跑得怎么样了？”，AI 会去查看日志并总结给你。

## 快速开始

### 1. 安装依赖
确保安装了 Python 3.8+。
```bash
pip install -r requirements.txt
```

### 2. 配置环境
复制 `.env.example` 为 `.env`，并填入你的 OpenAI API Key (或兼容的 API，如 DeepSeek, Claude)。
```bash
copy .env.example .env
```
用记事本打开 `.env` 并填入 Key。

### 3. 启动服务
```bash
python server.py
```
服务默认运行在 `http://0.0.0.0:8000`。

## 手机访问方法

### 方法一：局域网访问（手机和电脑在同一 WiFi）
1. 在电脑上打开终端，输入 `ipconfig` 查看 IPv4 地址（例如 `192.168.1.5`）。
2. 手机浏览器访问 `http://192.168.1.5:8000`。

### 方法二：外网访问（推荐 ngrok）
如果你想在外面（使用 4G/5G）控制电脑：
1. 下载 [ngrok](https://ngrok.com/) 并注册。
2. 运行命令：
   ```bash
   ngrok http 8000
   ```
3. 复制生成的 `Forwarding` URL（例如 `https://xxxx.ngrok-free.app`），在手机浏览器打开即可。

## 示例指令
- "查看当前目录下有哪些文件"
- "读取 log.txt 的最后 20 行并告诉我有没有报错"
- "把 config.json 里的 learning_rate 改成 0.001"
- "运行 python train.py"
- "检查一下系统负载（tasklist）"

## 安全警告
**注意**：本工具赋予了远程执行命令的权限。
- 请勿将生成的 ngrok 链接分享给他人。
- 建议仅在需要时开启服务。
