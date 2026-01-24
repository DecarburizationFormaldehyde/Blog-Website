from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .api.v1 import posts

# 创建数据库表
Base.metadata.create_all(bind=engine)

app = FastAPI(title="博客API", version="1.0")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "博客API运行中！", "docs": "/docs"}

# 注册路由
app.include_router(posts.router, prefix="/api/v1")

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "blog-api"}