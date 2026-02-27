from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import agent
import uvicorn

app = FastAPI(title="Remote PC Controller")

# 允许跨域，方便开发调试
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    接收自然语言指令，通过 Agent 执行并返回结果
    """
    try:
        print(f"Received message: {request.message}")
        response = agent.process_message(request.message)
        return {"response": response}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 挂载静态文件目录，必须放在最后，否则会覆盖 API 路由
# html=True 表示访问 / 时会自动查找 index.html
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    # 监听 0.0.0.0 使得局域网内其他设备（如手机）可以访问
    print("Server starting on http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
