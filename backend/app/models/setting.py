from sqlalchemy import *
from sqlalchemy.orm import relationship
from ..database import Base

class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text)
    value_type = Column(String(20), default="json")  # string/int/bool/json
    group = Column(String(50), default="general")  # general/theme/seo/social
    description = Column(String(255))
    is_public = Column(Boolean, default=False)  # 是否公开给前端

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 索引
    __table_args__ = (
        Index('idx_settings_key', key, unique=True),
        Index('idx_settings_group', group),
    )