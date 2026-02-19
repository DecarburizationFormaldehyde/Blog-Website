from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 数据库连接URL配置
import os
from .core.config import settings

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# 根据数据库类型选择不同的连接参数
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL 连接
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
# 创建本地会话工厂，配置了事务处理参数
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# 声明性基类，用于ORM模型继承
Base = declarative_base()


def get_db():
    """
    获取数据库会话的生成器函数
    
    该函数创建一个数据库会话实例，并使用try-finally结构确保
    在使用完毕后正确关闭数据库连接。
    
    Yields:
        Session: SQLAlchemy数据库会话对象
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()