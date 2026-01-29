from typing import List,Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ...database import get_db
from ...crud import user as user_crud
from ...schemas.user import User, UserCreate, UserUpdate
from ...api.deps import get_current_admin_user
from ...models.user import User as UserModel

router = APIRouter()

@router.get("/", response_model=List[User])
def read_users(
        db: Session = Depends(get_db),
        skip: int = 0,
        limit: int = 100,
        is_active: Optional[bool] = None,
        current_user: UserModel = Depends(get_current_admin_user)
) -> List[type[User]]:
    """
    获取所有用户（管理员）
    """
    users = user_crud.get_users(db, skip=skip, limit=limit,is_active=is_active)
    return users

