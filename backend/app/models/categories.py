from sqlalchemy import *
from sqlalchemy.orm import relationship
from ..database import Base

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)

    # 基础信息
    name = Column(String(200), unique=True, nullable=False)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    description = Column(Text)

    # 层级分类
    parent_id = Column(Integer, ForeignKey("categories.id"))
    level = Column(Integer, default=0) #层级深度
    order = Column(Integer, default=0) #排序权重

    # 关系定义
    parent = relationship("Category", back_populates="children")
    posts = relationship("Post", back_populates="category")

    __table_args__ = (
        Index('idx_categories_slug', slug, unique=True),
        Index('idx_categories_parent', parent_id),
    )
