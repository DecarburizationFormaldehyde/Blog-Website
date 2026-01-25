from sqlalchemy import *
from sqlalchemy.orm import relationship
from ..database import Base

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer,primary_key=True,index=True,unique= True)
    name = Column(String(20),unique=True,nullable=False,index=True)
    slug = Column(String(20),unique=True,nullable=False,index=True)
    description = Column(String(255))

    # 统计信息
    post_count = Column(Integer,default=0)

    # 关系定义
    posts = relationship("Post",secondary="post_tags",back_populates="tags")

    __table_args__ =(
        Index('idx_tags_slug', slug, unique=True),
    )