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

@router.post("/",response_model=User ,status_code=201)
def create_user(
        *,
        db:Session = Depends(get_db),
        user_in: UserCreate,
        current_user: UserModel = Depends(get_current_admin_user)
):
    try:
        user = user_crud.create_user(db, user=user_in)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{user_id}",response_model=User)
def read_user(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: UserModel = Depends(get_current_admin_user)
):
    """
    获取用户信息（管理员）
    :param user_id:
    :param db:
    :param current_user:
    :return:
    """
    user=user_crud.get_user(db,user_id=user_id)
    if not user:
        raise HTTPException(status_code=404,detail="用户不存在")
    return user

@router.put("/{user_id}",response_model=User)
def update_user(
        *,
        db: Session = Depends(get_db),
        user_id: int,
        user_in: UserUpdate,
        current_user: UserModel = Depends(get_current_admin_user)
):
    """
    更新用户信息（管理员）
    :param db:
    :param user_id:
    :param user_in:
    :param current_user:
    :return:
    """
    user = user_crud.update_user(db, user_id=user_id, user_update=user_in)

    if not user:
        raise HTTPException(status_code=404,detail="用户不存在")
    return user

@router.delete("/{user_id}",status_code=204)
def delete_user(
        *,
        db: Session = Depends(get_db),
        user_id: int,
        current_user: UserModel = Depends(get_current_admin_user)
):
    """
    删除用户（管理员）
    :param db:
    :param user_id:
    :param current_user:
    :return:
    """
    if user_id == current_user.id:
        raise HTTPException(status_code=400,detail="不能删除自己")

    success = user_crud.delete_user(db, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404,detail="用户不存在")

    return None

@router.post("/{user_id}/activate")
def activate_user(
        *,
        db: Session = Depends(get_db),
        user_id: int,
        activate: bool = True,
        current_user: UserModel = Depends(get_current_admin_user)
):
    """
    激活/禁用用户（管理员）
    :param db:
    :param user_id:
    :param activate:
    :param current_user:
    :return:
    """
    user = user_crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")

    if user_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="不能修改自己的激活状态"
        )

    user.is_active = activate
    db.commit()

    action = "激活" if activate else "禁用"
    return {"message": f"用户已{action}"}


def admin_reset_password(
        *,
        db: Session = Depends(get_db),
        user_id: int,
        new_password: str,
        current_user: UserModel = Depends(get_current_admin_user)
):
    """
    重置用户密码（管理员）
    """
    success = user_crud.reset_user_password(
        db, user_id=user_id, new_password=new_password
    )

    if not success:
        raise HTTPException(status_code=404, detail="用户不存在")

    return {"message": "密码重置成功"}
