from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...database import get_db
from ...models.categories import Category

router = APIRouter()

@router.get('/categories', response_model=List[dict])
def read_categories(
    db: Session = Depends(get_db)
):
    """
    获取所有分类
    """
    categories = db.query(Category).all()
    return [
        {
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "description": cat.description
        }
        for cat in categories
    ]