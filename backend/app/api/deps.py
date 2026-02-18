from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError

from ..database import get_db
from ..models.user import User
from ..core.config import settings
from ..core.security import verify_token

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="api/v1/auth/login",
    auto_error=False
)

def get_current_user(
        db:Session=Depends(get_db),
        token:Optional[str]=Depends(oauth2_scheme)
)->Optional[type[User]]:
    """获取当前用户（可选）"""
    if not token:
        return None

    payload = verify_token( token)
    if not payload:
        return None

    username:str = payload.get("sub")
    if username is None:
        return None

    user = db.query(User).filter(User.username==username).first()
    if not user or not user.is_active:
        return None
    return user

def get_current_active_user(
    current_user:Optional[User]=Depends(get_current_user)
)->User:
    """获取当前活跃用户（必需）"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    return current_user

def get_current_admin_user(
    current_user:User=Depends(get_current_active_user)
)->User:
    """获取当前管理员用户（必需）"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


