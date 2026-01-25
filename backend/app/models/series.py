from sqlalchemy import *
from ..database import Base
from sqlalchemy.orm import relationship


class Series(Base):
    __tablename__ = "series"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    description = Column(Text)
    cover_image = Column(String(500))

    # 系列信息
    order_type = Column(String(20), default="chronological")  # chronological/自定义排序
    is_completed = Column(Boolean, default=False)

    # 统计信息
    post_count = Column(Integer, default=0)

    # 关系定义
    posts = relationship("Post", back_populates="series")

    # 索引
    __table_args__ = (
        Index('idx_series_slug', slug, unique=True),
    )