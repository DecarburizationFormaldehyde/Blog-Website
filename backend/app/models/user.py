from sqlalchemy import *
from ..database import Base
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # 身份信息
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    display_name = Column(String(100))
    avatar = Column(String(500))
    bio = Column(Text)

    # 认证信息
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    # 社交链接
    website = Column(String(500))
    github = Column(String(100))
    twitter = Column(String(100))
    linkedin = Column(String(100))

    # 统计信息
    post_count = Column(Integer, default=0)

    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login_at = Column(DateTime(timezone=True))

    # 关系定义
    posts = relationship("Post", back_populates="author")
    comments = relationship("Comment", back_populates="user", lazy="dynamic")

    # 索引
    __table_args__ = (
        Index('idx_users_username', username, unique=True),
        Index('idx_users_email', email, unique=True),
    )