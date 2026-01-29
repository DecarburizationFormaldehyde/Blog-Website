from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ...database import get_db
from ...crud import user as user_crud
from ...schemas.user import (
    User, UserCreate, UserLogin, Token,
    PasswordResetRequest, PasswordResetConfirm
)
from ...core.security import (
    create_access_token, create_refresh_token,
    verify_token, hash_password
)
from ...core.config import settings
from ...api.deps import get_current_user, get_current_active_user
from ...models.user import User as UserModel

router = APIRouter()

@router.post("/register",response_model=User,status_code=status.HTTP_201_CREATED)
def register(
        *,
        user_in: UserCreate,
        db: Session = Depends(get_db)
):
    """注册用户"""
    try:
        user = user_crud.create_user(db,user_in)
        return user
    except Exception as e:
        raise HTTPException(status_code=400,detail=str(e))

