from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session
from typing import List, Optional

from ...database import get_db
from ...models.post import Post
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class PostCreate(BaseModel):
    title: str
    content: str

class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

@router.get("/posts", response_model=List[PostResponse])
def read_posts(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """
    获取所有文章
    """
    colum = getattr(Post, "created_at",None)
    if colum is None:
        colum = Post.id
    posts = db.query(Post).order_by(desc(colum)).offset(skip).limit(limit).all()
    return posts

@router.post("/posts", response_model=PostResponse)
def create_post(post: PostCreate, db: Session = Depends(get_db)):
    db_post = Post(title=post.title, content=post.content)
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@router.get("/posts/{post_id}", response_model=PostResponse)
def read_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="文章不存在")
    return post