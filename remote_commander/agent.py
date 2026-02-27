import os
import subprocess
import json
import traceback
from typing import List, Dict, Any
from openai import OpenAI
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 初始化 OpenAI 客户端
# 注意：如果用户没有配置 .env，这里可能会报错，但在 server 启动时会处理
api_key = os.getenv("OPENAI_API_KEY")
base_url = os.getenv("OPENAI_BASE_URL")
client = None

if api_key:
    client = OpenAI(api_key=api_key, base_url=base_url)

MODEL = os.getenv("LLM_MODEL", "gpt-4o")

# --- 工具定义 ---

def list_files(path: str = ".") -> str:
    """列出指定目录下的文件和文件夹"""
    try:
        items = os.listdir(path)
        return json.dumps(items, ensure_ascii=False)
    except Exception as e:
        return f"Error listing files: {str(e)}"

def read_file(path: str) -> str:
    """读取文件内容"""
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"Error reading file: {str(e)}"

def write_file(path: str, content: str) -> str:
    """写入文件内容（覆盖）"""
    try:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return f"Successfully wrote to {path}"
    except Exception as e:
        return f"Error writing file: {str(e)}"

def run_cmd(command: str) -> str:
    """在系统 shell 中执行命令"""
    print(f"Executing command: {command}")
    try:
        # 使用 shell=True 允许执行复杂的 shell 命令，但要注意安全
        result = subprocess.run(
            command, 
            shell=True, 
            capture_output=True, 
            text=True, 
            encoding='utf-8', # Windows 下可能需要 gbk，但 Python 3.6+ 通常处理得当
            errors='replace'
        )
        output = result.stdout
        if result.stderr:
            output += f"\nStderr: {result.stderr}"
        return output
    except Exception as e:
        return f"Error executing command: {str(e)}"

# --- 工具 Schema ---

tools = [
    {
        "type": "function",
        "function": {
            "name": "list_files",
            "description": "List files and directories in a given path. Useful for exploring the file system.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "The directory path to list. Defaults to current directory."
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "read_file",
            "description": "Read the contents of a file. Useful for checking logs, config files, or code.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "The absolute or relative path to the file."
                    }
                },
                "required": ["path"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "write_file",
            "description": "Write content to a file. Useful for modifying configuration parameters or saving scripts.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "The path to the file."
                    },
                    "content": {
                        "type": "string",
                        "description": "The content to write."
                    }
                },
                "required": ["path", "content"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "run_cmd",
            "description": "Run a shell command on the PC. This is the most powerful tool. Use it to check processes (tasklist), run python scripts, check system status, etc.",
            "parameters": {
                "type": "object",
                "properties": {
                    "command": {
                        "type": "string",
                        "description": "The shell command to execute (e.g., 'dir', 'type log.txt', 'python script.py')."
                    }
                },
                "required": ["command"]
            }
        }
    }
]

# --- 核心 Agent 逻辑 ---

class PCControllerAgent:
    def __init__(self):
        self.history = [
            {"role": "system", "content": "You are a helpful PC assistant. You can access the user's PC to retrieve information, monitor experiments, and modify files. You are running on Windows. When asked to check something, use the available tools. Always summarize the result in a concise, natural language response suitable for a mobile phone screen."}
        ]
    
    def process_message(self, user_message: str) -> str:
        global client
        if not client:
             # 尝试重新加载，防止用户刚改了 .env
            load_dotenv()
            api_key = os.getenv("OPENAI_API_KEY")
            base_url = os.getenv("OPENAI_BASE_URL")
            if api_key:
                client = OpenAI(api_key=api_key, base_url=base_url)
            else:
                return "Error: OPENAI_API_KEY not found. Please configure the .env file on the PC."

        self.history.append({"role": "user", "content": user_message})
        
        # 最大迭代次数，防止死循环
        max_turns = 5
        current_turn = 0
        
        while current_turn < max_turns:
            try:
                response = client.chat.completions.create(
                    model=MODEL,
                    messages=self.history,
                    tools=tools,
                    tool_choice="auto"
                )
                
                message = response.choices[0].message
                
                # 如果模型决定调用工具
                if message.tool_calls:
                    self.history.append(message) # 将助手的回复（包含 tool_calls）加入历史
                    
                    for tool_call in message.tool_calls:
                        function_name = tool_call.function.name
                        arguments = json.loads(tool_call.function.arguments)
                        
                        tool_output = ""
                        
                        if function_name == "list_files":
                            tool_output = list_files(arguments.get("path", "."))
                        elif function_name == "read_file":
                            tool_output = read_file(arguments.get("path"))
                        elif function_name == "write_file":
                            tool_output = write_file(arguments.get("path"), arguments.get("content"))
                        elif function_name == "run_cmd":
                            tool_output = run_cmd(arguments.get("command"))
                        else:
                            tool_output = f"Unknown function: {function_name}"
                        
                        # 将工具的输出加入历史
                        self.history.append({
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "content": tool_output
                        })
                    
                    current_turn += 1
                else:
                    # 模型没有调用工具，直接返回了回复
                    self.history.append(message)
                    return message.content
                    
            except Exception as e:
                traceback.print_exc()
                return f"System Error: {str(e)}"
        
        return "Task stopped because it took too many steps. Here is what I found so far."

# 单例实例
agent = PCControllerAgent()
