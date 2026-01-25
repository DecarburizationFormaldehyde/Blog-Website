from sqlalchemy import *
from sqlalchemy.orm import relationship
from ..database import Base

class PostTag( Base):
    __tablename__ = "post_tags"

    post_id=Column(Integer, ForeignKey("posts.id"), primary_key=True)
    tag_id=Column(Integer, ForeignKey("tags.id"), primary_key=True)
    create_by=Column(DateTime(timezone=True), server_default=func.now())

    # 索引
    __table_args__ = (
        Index('idx_post_tags_post_id', post_id),
    )