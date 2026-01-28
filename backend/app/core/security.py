from fastapi import APIRouter, Depends, HTTPException, Query, status
from ..database import get_db
from sqlalchemy.orm import Session

def get_current_user(db: Session = Depends(get_db),token: str = Depends(get_db)):
    user = auth_crud.get_user_by_token(db,token=token)
    if not user:
        raise HTTPException(status_code=401,detail="用户不存在")
    return user