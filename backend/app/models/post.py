from sqlalchemy import *
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)

    # 基础信息
    title = Column(String(200), nullable=False, default="Untitled")
    slug = Column(String(200), unique=True, nullable=False, index=True)  # URL友好的标识
    content = Column(Text,nullable=False)
    excerpt = Column(String(500))
    format =  Column(String(20), default="markdown")

    # 状态和可见性
    status=Column(String(20), default="draft") # draft, published, archived
    visibility=Column(String(20), default="public") # public/private

    # 元数据
    word_count = Column(Integer, default=0)
    reading_time = Column(Integer)  # 阅读时长（分钟）
    featured_image = Column(String(500))  # 封面图URL
    pinned = Column(Boolean, default=False)  # 是否置顶
    allow_comments = Column(Boolean, default=True)  # 是否允许评论

    # 外键关联
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"))
    series_id = Column(Integer, ForeignKey("series.id"))  # 所属系列

    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    published_at = Column(DateTime(timezone=True))  # 发布时间

    # 关系定义
    author = relationship("User", back_populates="posts")
    category = relationship("Category", back_populates="posts")
    tags = relationship("Tag", secondary="post_tags", back_populates="posts")
    series = relationship("Series", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")

    # 索引
    __table_args__ = (
        Index('idx_posts_status_published', status, published_at),
        Index('idx_posts_slug', slug, unique=True),
    )