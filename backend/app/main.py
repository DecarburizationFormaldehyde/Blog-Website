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

from .api.v1 import posts,categories,tags,auth,users
from .api.deps import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时
    print(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} 启动中...")
    print(f"📊 数据库: {settings.DATABASE_URL}")
    print(f"🔐 调试模式: {settings.DEBUG}")

    # 可以在这里添加初始化逻辑
    # 比如：检查表是否存在，创建默认数据等
    # 创建数据库表
    Base.metadata.create_all(bind=engine)

    print("✅ 数据库表创建成功")
    yield  # 应用运行

    # 关闭时
    print(f"👋 {settings.APP_NAME} 关闭...")


app = FastAPI(
    title=settings.APP_NAME,
    description="基于FastAPI和React的博客系统API",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/",tags=["健康检查"])
def read_root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs" if settings.DEBUG else "disabled in production",
        "health": "/health"
    }

@app.get("/api/health",tags=["健康检查"])
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": settings.APP_VERSION
    }

# 注册路由
app.include_router(posts.router, prefix="/api/v1",tags=["文章"])
app.include_router(categories.router, prefix="/api/v1",tags=["分类"])
app.include_router(tags.router, prefix="/api/v1",tags=["标签"])

app.include_router(auth.router, prefix="/api/v1/auth", tags=["认证"])

app.include_router(users.router, prefix="/api/v1/users", tags=["用户管理"])
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": "服务器内部错误", "error": str(exc)},
    )