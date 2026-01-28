from contextlib import asynccontextmanager
from unicodedata import category

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from sqlalchemy.orm import configure_mappers

# 导入所有模型以确保它们被注册到Base.metadata中
from .models import post, user, categories, tags, post_tag, series, comment, setting

# 配置所有映射器以解决循环依赖
configure_mappers()

from .api.v1 import posts,categories,tags


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时
    print("🚀 博客API启动中...")

    # 可以在这里添加初始化逻辑
    # 比如：检查表是否存在，创建默认数据等
    # 创建数据库表
    Base.metadata.create_all(bind=engine)

    print("✅ 数据库表创建成功")
    yield  # 应用运行

    # 关闭时
    print("👋 博客API关闭...")


app = FastAPI(
    title="博客API",
    description="基于FastAPI和React的博客系统API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/",tags=["健康检查"])
def read_root():
    return {"message": "博客API运行中！", "docs": "/docs"}

@app.get("/api/health",tags=["健康检查"])
def health_check():
    return {"status": "healthy", "service": "blog-api"}

# 注册路由
app.include_router(posts.router, prefix="/api/v1",tags=["文章"])
app.include_router(categories.router, prefix="/api/v1",tags=["分类"])
app.include_router(tags.router, prefix="/api/v1",tags=["标签"])

from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": "服务器内部错误", "error": str(exc)},
    )