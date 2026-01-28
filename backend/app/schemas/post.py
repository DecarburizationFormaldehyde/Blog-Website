from typing import Optional,List
from pydantic import BaseModel,Field,field_validator
from datetime import datetime
from .base import BaseSchema

class PostBase(BaseModel):
    title:str = Field(...,min_length=1,max_length=200)
    content:str
    excerpt:Optional[str]=Field(None,max_length=500)
    status:str=Field(default="draft",pattern="^(draft|published|archived)$")
    visibility:str=Field(default="public",pattern="^(public|private)$")
    featured_image:Optional[str]=None
    pinned:bool=False
    allow_comments:bool=True
    category_id:Optional[int]=None
    series_id:Optional[int]=None
    tags:Optional[list[str]]=[]


# 创建文章
class PostCreate(PostBase):
    @field_validator("title")
    def validate_title(cls, value):
        if not value or not value.strip():
            raise ValueError("标题不能为空")

# 更新文章
class PostUpdate(BaseModel):
    title: Optional[str] = Field(..., min_length=1, max_length=200)
    content: Optional[str] = None
    excerpt: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = Field(default="draft", pattern="^(draft|published|archived)$")
    visibility: Optional[str] = Field(default="public", pattern="^(public|private)$")
    featured_image: Optional[str] = None
    pinned: Optional[bool] = None
    allow_comments: bool = None
    category_id: Optional[int] = None
    series_id: Optional[int] = None
    tags: Optional[list[str]] = None

#文章响应模型
class Post(PostBase,BaseSchema):
    id: int
    slug:str
    author_id:int
    word_count:int
    reading_time:Optional[int]=None
    create_at: datetime = Field(alias="created_at")
    update_at:Optional[datetime]=None
    published_at:Optional[datetime]=None

    # 关联字段
    author: Optional["User"]=None
    category: Optional["Category"]=None
    tags: Optional[List["Tag"]]=None


# 文章列表
class PostListItem(BaseSchema):
    id : int
    title: str
    slug: str
    excerpt: Optional[str]
    featured_image: Optional[str]
    status: str
    created_at: datetime
    published_at: Optional[datetime]
    author: Optional["User"]=None
    category: Optional["Category"]=None

from .user import User
from .category import Category
from .tag import Tag