from typing import Any, Dict, Optional
from jose import jwt, JWTError


from fastapi import APIRouter, Depends, HTTPException, Query, status
from ..database import get_db
from sqlalchemy.orm import Session
from datetime import datetime,timedelta
import bcrypt

from .config import settings

# 密码相关
def hash_password(password:str) -> str:
    """哈希密码"""
    salt = bcrypt.gensalt(rounds=settings.BCRYPT_ROUNDS)
    hashed = bcrypt.hashpw(password.encode('utf-8'),salt)
    return hashed.decode('utf-8')

def verify_password(plain_password:str,hashed_password:str)-> bool:
    """验证密码"""
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )

# JWT相关
def create_access_token(
        data:Dict[str,Any],
        expires_delta: Optional[timedelta] = None
) -> str :
    """创建访问令牌"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp":expire,"type":"access"})
    encode_jwt=jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return encode_jwt


def create_refresh_token(
        data:Dict[str,Any],
        expires_delta: Optional[timedelta] = None
) -> str :
    """创建刷新令牌"""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode.update({"exp":expire,"type":"refresh"})

    encoded_jwt=jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def verify_token(token:str) -> Optional[Dict[str,Any]]:
    """验证令牌"""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None

def get_token_type(token:str) ->Optional[str]:
    """获取令牌类型"""
    payload = verify_token(token)
    if payload:
        return payload.get("type")
    return None