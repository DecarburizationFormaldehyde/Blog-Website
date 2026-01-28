from unicodedata import category

from sqlalchemy import asc, desc
from ...models.post import Post

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...database import get_db
from ...schemas.post import Post, PostCreate, PostUpdate, PostListItem
from ...crud import post as post_crud
from ...core.security import get_current_user  # 稍后实现
from ...models.user import User  # 用户模型
router = APIRouter()


@router.get('/posts',response_model=List[PostListItem])
def read_posts(
        db:Session = Depends(get_db),
        skip:int=Query(0,ge=0),
        limit:int=Query(10,ge=1,le=100),
        status:Optional[str]=Query(None,pattern="^(draft|published|archived)$"),
        category_id:Optional[int]=None,
        tag_id:Optional[int]=None,
        author_id:Optional[int]=None,
        search:Optional[str]=None,
        order_by:str=Query("published_at",pattern="^(created_at|updated_at|published_at)$"),
        order_desc:bool=Query(True)
):
    """
    获取文章列表
    
    参数:
        db (Session): 数据库会话对象
        skip (int): 跳过的记录数，默认为0
        limit (int): 返回的最大记录数，默认为10，最大100
        status (Optional[str]): 文章状态过滤条件
        category_id (Optional[int]): 分类ID过滤条件
        tag_id (Optional[int]): 标签ID过滤条件
        author_id (Optional[int]): 作者ID过滤条件
        search (Optional[str]): 搜索关键词
        order_by (str): 排序字段
        order_desc (bool): 是否降序排列
    
    返回:
        List[PostListItem]: 文章列表
    """
    posts = post_crud.get_posts(
        db=db,
        skip=skip,
        limit=limit,
        status=status,
        category_id=category_id,
        tag_id=tag_id,
        author_id=author_id,
        search=search,
        order_by=order_by,
        order_desc=order_desc
    )
    return posts


@router.get("posts/{post_id}",response_model=Post)
def read_post(
        post_id:int,
        db:Session = Depends(get_db)
):
    """
    获取单个文章
    
    参数:
        post_id (int): 文章ID
        db (Session): 数据库会话对象
    
    返回:
        Post: 文章对象
    """
    db_post = post_crud.get_post(db,post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404,detail="文章不存在")
    # 增加浏览次数
    post_crud.increment_post_views(db,post_id)
    return db_post


@router.get("posts/slug/{slug}",response_model=Post)
def read_post_by_slug(
        slug: str,
        db:Session = Depends(get_db)
):
    """
    通过slug获取文章
    
    参数:
        slug (str): 文章slug
        db (Session): 数据库会话对象
    
    返回:
        Post: 文章对象
    """
    db_post = post_crud.get_post_by_slug(db,slug=slug)
    if db_post is None:
        raise HTTPException(status_code=404,detail="文章不存在")

    post_crud.increment_post_views(db,db_post.id)

    return db_post

@router.post("posts",response_model=Post,status_code=status.HTTP_201_CREATED)
def create_post(
        *,
        db:Session = Depends(get_db),
        post_in: PostCreate,
        current_user: User = Depends(get_current_user)
):
    """
    创建新文章
    
    参数:
        db (Session): 数据库会话对象
        post_in (PostCreate): 文章创建数据
        current_user (User): 当前登录用户
    
    返回:
        Post: 创建的文章对象
    """
    if post_in.category_id:
        from app.models.category import Category
        category = db.query(Category).first(Category.id==post_in.category_id).first()
        if not category:
            raise HTTPException(status_code=400,detail="分类不存在")

    if post_in.series_id:
        from app.models.series import Series
        series = db.query(Series).first(Series.id==post_in.series_id).first()
        if not series:
            raise HTTPException(status_code=400,detail="系列不存在")

    post = post_crud.create_post(
        db=db,
        post=post_in,
        author_id=current_user.id
    )
    return post

@router.put("/posts/{post_id}", response_model=Post)
def update_post(
        *,
        db: Session = Depends(get_db),
        post_id: int,
        post_in: PostUpdate,
        current_user: User = Depends(get_current_user)
):
    """
    更新文章
    
    参数:
        db (Session): 数据库会话对象
        post_id (int): 要更新的文章ID
        post_in (PostUpdate): 文章更新数据
        current_user (User): 当前登录用户
    
    返回:
        Post: 更新后的文章对象
    """
    db_post = post_crud.get_post(db,post_id=post_id)
    if not db_post:
        raise HTTPException(status_code=404,detail="文章不存在")

    if db_post.author_id !=current_user.id and current_user.is_admin:
        raise HTTPException(status_code=403,detail="无权限")

    if post_in.category_id:
        from ....app.models.category import Category
        category = db.query(Category).first(Category.id==post_in.category_id).first()
        if not category:
            raise HTTPException(status_code=400,detail="分类不存在")

    if post_in.series_id:
        from ....app.models.series import Series
        series = db.query(Series).first(Series.id==post_in.series_id).first()
        if not series:
            raise HTTPException(status_code=400,detail="系列不存在")

    post = post_crud.update_post(
        db=db,
        post_id=post_id,
        post_update=post_in
    )

    if post is None:
        raise HTTPException(status_code=400,detail="文章不存在")
    return post

@router.delete("/posts/{post_id}", response_model=Post)
def delete_post(
        *,
        db: Session = Depends(get_db),
        post_id: int,
        current_user: User = Depends(get_current_user)
):
    """
    删除文章
    
    参数:
        db (Session): 数据库会话对象
        post_id (int): 要删除的文章ID
        current_user (User): 当前登录用户
    
    返回:
        Post: 删除的文章对象
    """
    db_post = post_crud.get_post(db,post_id=post_id)
    if not db_post:
        raise HTTPException(status_code=404,detail="文章不存在")
    if db_post.author_id !=current_user.id and current_user.is_admin:
        raise HTTPException(status_code=403,detail="无权限")

    success = post_crud.delete_post(db=db,post_id=post_id)

    if not success:
        raise HTTPException(status_code=400,detail="文章不存在")
    return None

@router.get("/stats/posts",response_model=dict)
def get_post_stats(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    """
    获取文章统计信息
    
    参数:
        db (Session): 数据库会话对象
        current_user (User): 当前登录用户
    
    返回:
        dict: 文章统计信息，包含总数、已发布、草稿和归档文章数量
    """
    if not current_user.is_admin:
        raise HTTPException(status_code=403,detail="无权限")

    total = post_crud.get_post_count(db)
    published = post_crud.get_post_count(db,status="published")
    draft = post_crud.get_post_count(db,status="draft")

    return {
        "total":total,
        "published":published,
        "draft":draft,
        "archived":total-published-draft
    }