from sqlalchemy import *
from sqlalchemy.orm import relationship
from ..database import Base

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)

    # 状态
    status = Column(String(20), default="pending")  # pending/approved/rejected
    is_edited = Column(Boolean, default=False)

    # 层级评论
    parent_id = Column(Integer, ForeignKey("comments.id"))
    depth = Column(Integer, default=0)

    # 外键
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))

    # 访客信息（未登录用户）
    guest_name = Column(String(100))
    guest_email = Column(String(100))

    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关系定义
    post = relationship("Post", back_populates="comments")
    user = relationship("User", back_populates="comments")
    parent = relationship("Comment", remote_side=[id], backref="replies")

    # 索引
    __table_args__ = (
        Index('idx_comments_post_id', post_id),
        Index('idx_comments_user_id', user_id),
        Index('idx_comments_parent_id', parent_id),
    )