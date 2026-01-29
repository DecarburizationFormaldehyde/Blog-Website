from pydantic import EmailStr
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from ..models.user import User
from ..schemas.user import UserCreate,UserUpdate
from ..core.security import hash_password,verify_password

def get_user(db: Session, user_id: int) -> Optional[User]:
    """获取用户"""
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_username(db: Session, username: str)-> Optional[User]:
    """通过用户名获取用户"""
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: EmailStr)-> Optional[User]:
    """通过邮箱获取用户"""
    return db.query(User).filter(User.email == email).first()

def get_users(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        is_active: Optional[bool] = None,
        is_admin: Optional[bool] = None
) -> List[type[User]]:
    """获取所有用户"""
    query = db.query(User)

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    if is_admin is not None:
        query = query.filter(User.is_admin == is_admin)

    return query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate) -> User:
    """创建用户"""
    if get_user_by_username(db, user.username):
        raise ValueError("用户名已存在")

    if get_user_by_email(db, user.email):
        raise ValueError("邮箱已存在")

    db_user = User(
        username=user.username,
        email=user.email,
        display_name=user.display_name or user.username,
        hashed_password=hash_password(user.password),
        bio=user.bio,
        website=user.website,
        github=user.github,
        twitter=user.twitter,
        linkedin=user.linkedina
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[ User]:
    """更新用户"""
    db_user = get_user(db, user_id)
    if not db_user:
        raise ValueError("用户不存在")

    update_data = user_update.model_dump(exclude_unset=True)

    # 特殊处理密码
    if "password" in update_data:
        update_data["hashed_password"] = hash_password(update_data.pop["password"])

    for field, value in update_data.items():
        if value is not None:
            setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int) -> bool:
    """删除用户"""
    db_user = get_user(db, user_id)
    if not db_user:
        return False
    db_user.is_active= False
    db.commit()
    return True

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    """验证用户"""
    user = get_user_by_username(db, username)
    if not user:
        user = get_user_by_email(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        return None

    user.last_login_at=datetime.now()
    db.commit()

    return user

def update_user_last_login(db: Session, user: User):
    """更新用户最后登录时间"""
    user.last_login_at=datetime.now()
    db.commit()
    db.refresh(db_user)

def change_user_password(
        db: Session,
        user_id: int,
        old_password: str,
        new_password: str
)-> bool:
    """修改用户密码"""
    user = get_users(db, user_id)
    if not user:
        return False

    if not verify_password(old_password, user.hashed_password):
        return False

    user.hashed_password=hash_password(new_password)
    db.commit()
    return True

def reset_user_password(db: Session, user_id: int, new_password: str)-> bool:
    """重置用户密码"""
    user = get_users(db, user_id)
    if not user:
        return False

    user.hashed_password=hash_password(new_password)
    db.commit()
    return True
