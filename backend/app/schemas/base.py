from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class BaseSchema(BaseModel):
    """基础 Pydantic 模型"""
    model_config = ConfigDict(from_attributes=True)

class TimestampSchema(BaseSchema):
    """包含时间戳的模型"""
    created_at: datetime
    updated_at: Optional[datetime] = None