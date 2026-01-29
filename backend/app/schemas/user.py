from typing import Optional,List
from pydantic import BaseModel, Field, field_validator, EmailStr
from datetime import datetime
from .base import BaseSchema

# Token模型
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: str
# Token信息
class TokenData(BaseModel):
    username:Optional[str] = None
    user_id:Optional[int] = None

# 用户模型基类
class UserBase(BaseModel):
    username:str = Field(...,min_length=3,max_length=50,pattern="^[a-zA-Z0-9_-]+$")
    email:EmailStr
    display_name:str =Field(None,max_length=100)
    bio:Optional[str] = None
    website:Optional[str] = None
    github:Optional[str] = None
    twitter:Optional[str] = None
    Linkedin:Optional[str] = None
# 创建用户
class UserCreate(UserBase):
    password:str = Field(...,min_length=8,max_length=16)

    @field_validator("password")
    def validate_password(cls,v):
        if len(v) < 8:
            raise ValueError("密码长度不能小于8")
        if len(v) > 16:
            raise ValueError("密码长度不能大于16")
        return v
# 更新用户信息
class UserUpdate(BaseModel):
    display_name:Optional[str] = Field(None,max_length=100)
    email:Optional[EmailStr] = None
    bio:Optional[str] = None
    website:Optional[str] = None
    github:Optional[str] = None
    twitter:Optional[str] = None
    Linkedin:Optional[str] = None
    password:Optional[str] = Field(None,min_length=8,max_length=16)
# 用户登录
class UserLogin(BaseModel):
    username:str
    password:str
# 用户信息
class User(UserBase,BaseSchema):
    id:int
    avatar:Optional[str] = None
    is_active:bool = True
    is_admin:bool = False
    post_count:int = 0
    created_at:datetime
    updated_at:Optional[datetime] = None

    class Config:
        from_attributes = True

# 显示文章中作者信息
class UserSimple(BaseSchema):
    id: int
    username: str
    display_name: Optional[str]
    avatar: Optional[str]

# 重置密码
class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str=Field(...,min_length=8,max_length=16)

