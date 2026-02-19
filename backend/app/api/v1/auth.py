from datetime import timedelta
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ...database import get_db
from ...crud import user as user_crud
from ...schemas.user import (
    User, UserCreate, UserLogin, Token,UserUpdate,
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

@router.post("/login",response_model=Token)
def login(
        *,
        db: Session = Depends(get_db),
        form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    OAuth2 兼容的登录接口
    """
    user=user_crud.authenticate_user(
        db,
        username=form_data.username,
        password=form_data.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            headers={"WWW-Authenticate": "Bearer"},
            detail="用户名或密码错误",
        )

    # 创建token
    access_token = create_access_token(
        data = {"sub": user.username,"user_id":user.id}
    )

    refresh_token = create_refresh_token(
        data= {"sub": user.username,"user_id":user.id}
    )

    return {
        "access_token":access_token,
        "refresh_token":refresh_token,
        "token_type":"bearer"
    }

@router.post("/login-json",response_model=Token)
def login_json(
        *,
        db: Session = Depends(get_db),
        login_data: UserLogin
):
    user = user_crud.authenticate_user(
        db,
        username=login_data.username,
        password=login_data.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            headers={"WWW-Authenticate": "Bearer"},
            detail="用户名或密码错误",
        )
    access_token = create_access_token(
        data = {"sub": user.username,"user_id":user.id}
    )
    refresh_token = create_refresh_token(
        data= {"sub": user.username,"user_id":user.id}
    )
    return {
        "access_token":access_token,
        "refresh_token":refresh_token,
        "token_type":"bearer"
    }

@router.get("/me",response_model=User)
def read_users_me(
        current_user: UserModel = Depends(get_current_active_user)
):
    """获取当前用户信息"""
    return current_user

@router.put("/me",response_model=User)
def update_user_me(
        *,
        user_update: UserUpdate,
        current_user: UserModel = Depends(get_current_active_user),
        db: Session = Depends(get_db)
):
    """更新当前用户信息"""
    if user_update.email and user_update.email != current_user.email:
        existing  = user_crud.get_user_by_email(db,email=user_update.email)
        if existing and existing.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已存在"
            )
    update_user = user_crud.update_user(
        db,user_id=current_user.id,user_update=user_update
    )

    if not update_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户不存在"
        )

    return update_user

@router.post("/change-password")
def change_password(
        *,
        db: Session = Depends(get_db),
        current_user: UserModel = Depends(get_current_active_user),
        old_password: str,
        new_password: str
):
    success = user_crud.change_user_password(
        db,
        user_id=current_user.id,
        old_password=old_password,
        new_password=new_password
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="密码错误"
        )

    return {"message":"密码修改成功"}

@router.post("/refresh", response_model=Token)
def refresh_token(
        *,
        refresh_token: str,
        db: Session = Depends(get_db)
):
    """
    刷新访问令牌
    """
    payload = verify_token(refresh_token)
    
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的刷新令牌"
        )
    
    user_id = payload.get("user_id")
    username = payload.get("sub")
    
    if not user_id or not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="令牌信息不完整"
        )
    
    # 验证用户是否存在且活跃
    user = user_crud.get_user(db, user_id=user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在或已被禁用"
        )
    
    # 创建新的访问令牌
    new_access_token = create_access_token(
        data={"sub": username, "user_id": user_id}
    )
    
    # 创建新的刷新令牌（可选，根据安全策略决定是否更新）
    new_refresh_token = create_refresh_token(
        data={"sub": username, "user_id": user_id}
    )
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@router.post("/logout")
def logout(
        current_user: UserModel = Depends(get_current_active_user)
):
    """
    用户登出
    注意：JWT是无状态的，客户端需要自行删除令牌
    """
    return {"message":"登出成功"}

@router.post("/request-password-reset")
def request_password_reset(
        *,
        db: Session = Depends(get_db),
        reset_request: PasswordResetRequest
):
    """
    请求重置密码（发送重置邮件）
    :todo 这里只是模拟，实际需要集成邮件服务
    :param db:
    :param reset_request:
    :return:
    """
    user = user_crud.get_user_by_email(db,email=reset_request.email)

    if user:
        # 在实际应用中，这里应该生成重置令牌并发送邮件
        # 现在只是模拟返回成功
        print(f"密码重置请求: {user.email}")

        # 无论用户是否存在，都返回成功（避免信息泄露）
    return {
        "message": "如果邮箱存在，重置链接已发送",
        "detail": "在实际应用中，这里会发送包含重置链接的邮件"
    }

@router.post("/reset-password")
def reset_password(
        *,
        db: Session = Depends(get_db),
        reset_confirm: PasswordResetConfirm
):
    """
    重置密码
    :param db:
    :param reset_data:
    :return:
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="密码重置功能未实现"
    )

@router.get("/check-auth")
def check_auth(
        current_user: Optional[UserModel] = Depends(get_current_user)
):
    """
    检查令牌是否有效
    :param db:依赖获取
    :return:认证结果，如成功则返回用户id、username、admin信息
    """
    if current_user:
        return {
            "authenticated":True,
            "user":{
                "id":current_user.id,
                "username":current_user.username,
                "is_admin":current_user.is_admin
            }
        }
    else:
        return {"authenticated":False}
