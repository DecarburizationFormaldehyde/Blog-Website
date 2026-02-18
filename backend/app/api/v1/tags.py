from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.tags import Tag

router = APIRouter()

@router.get("/tags", response_model=List[dict])
def read_tags(db: Session = Depends(get_db)):
    """获取所有标签"""
    tags = db.query(Tag).order_by(Tag.post_count.desc()).all()
    return [
        {
            "id": tag.id,
            "name": tag.name,
            "slug": tag.slug,
            "description": tag.description,
            "post_count": tag.post_count
        }
        for tag in tags
    ]