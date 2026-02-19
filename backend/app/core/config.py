from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # 应用配置
    APP_NAME: str = "博客系统"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # 安全配置
    SECRET_KEY:str ="your-secret-key-here-change-in-production"
    ALGORITHM:str ="HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES:int = 30
    REFRESH_TOKEN_EXPIRE_DAYS:int = 7

    DATABASE_URL: str = "sqlite:///./data/blog.db"

    # CORS配置
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000","http://localhost:5173"]

    # 密码加密配置
    BCRYPT_ROUNDS:int = 12

    model_config = {
        "env_file": ".env",
        "case_sensitive":True
    }


settings = Settings()


