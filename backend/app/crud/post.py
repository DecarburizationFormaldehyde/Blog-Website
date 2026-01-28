from sqlalchemy.orm import Session
from sqlalchemy import desc,asc,or_,and_
from typing import Optional,List,Dict,Any
from datetime import datetime


from ..models.post import Post
from ..models.tags import Tag
from ..models.user import User
from ..models.categories import Category
from ..schemas.post import PostBase,PostUpdate

def get_post(db:Session,post_id:int) -> Optional[Post]:
    """获取单个文章"""
    return db.query(Post).filter(Post.id==post_id).first()

def get_post_by_slug(db:Session,slug:str) -> Optional[Post]:
    """通过slug获取文章"""
    return db.query(Post).filter(Post.slug==slug).first()
def get_posts(
        db:Session,
        skip:int=0,
        limit:int=10,
        status:Optional[str]="published",
        category_id:Optional[int]=None,
        tag_id:Optional[int]=None,
        author_id:Optional[int]=None,
        search:Optional[str]=None,
        order_by:str="published_at",
        order_desc:bool=True
)-> list[type[Post]]:
    """
    获取文章列表
    
    参数:
        db (Session): 数据库会话对象
        skip (int): 跳过的记录数，默认为0
        limit (int): 返回的最大记录数，默认为10
        status (Optional[str]): 文章状态过滤条件，默认为"published"
        category_id (Optional[int]): 分类ID过滤条件
        tag_id (Optional[int]): 标签ID过滤条件
        author_id (Optional[int]): 作者ID过滤条件
        search (Optional[str]): 搜索关键词，用于在标题、内容和摘要中搜索
        order_by (str): 排序字段，默认按发布日期排序
        order_desc (bool): 是否降序排列，默认为True
    
    返回:
        list[type[Post]]: 符合条件的文章列表
    """
    query = db.query(Post)

    # 根据状态过滤文章
    if status:
        query = query.filter(Post.status==status)

    # 根据分类ID过滤文章
    if category_id:
        query = query.filter(Post.category_id==category_id)

    # 根据标签ID过滤文章
    if tag_id:
        query = query.join(Tag,Post.tags).filter(Tag.id==tag_id)

    # 根据作者ID过滤文章
    if author_id:
        query = query.filter(Post.author_id==author_id)

    # 根据搜索关键词过滤文章标题、内容和摘要
    if search:
        search_term=f"%{search}%"
        query = query.filter(
            or_(
            Post.title.ilike(search_term),
            Post.content.ilike(search_term),
            Post.excerpt.ilike(search_term)
            )
        )

    # 设置排序规则
    order_colum=getattr(Post,order_by,Post.published_at)
    if order_desc:
        query = query.order_by(desc(order_colum))
    else:
        query = query.order_by(asc(order_colum))

    return query.offset(skip).limit(limit).all()

def create_post(db:Session,post:PostBase,author_id:int)->Post:
    """
    创建文章
    
    参数:
        db (Session): 数据库会话对象
        post (PostBase): 文章数据
        author_id (int): 作者ID
    
    返回:
        Post: 创建的文章对象
    """
    import re
    from slugify import slugify

    slug = slugify(post.title)

    counter = 1
    original_slug = slug
    while db.query(Post).filter(Post.slug==slug).first():
        slug = f"{original_slug}-{counter}"
        counter += 1

    word_count = len(post.content.split())
    reading_time = max(1,word_count//200)

    db_post = Post(
        **post.model_dump(exclude={"tags"}),
        slug=slug,
        word_count=word_count,
        author_id=author_id,
        reading_time=reading_time,
        published_at=datetime.now() if post.status=="published" else None
    )

    if db_post:
        tags = []
        for tag_name in post.tags:
            tag = db.query(Tag).filter(Tag.name==tag_name).first()
            if not tag:
                tag = Tag(name=tag_name,slug=slugify(tag_name))
                db.add(tag)
                db.flush()
            tags.append(tag)
        db_post.tags = tags

    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def update_post(db:Session,post_id:int,post_update:PostUpdate)->Optional[ Post]:
    """
    更新文章
    
    参数:
        db (Session): 数据库会话对象
        post_id (int): 文章ID
        post_update (PostUpdate): 更新的文章数据
    
    返回:
        Optional[Post]: 更新后的文章对象，如果文章不存在则返回None
    """""
    db_post = get_post(db,post_id)
    if not db_post:
        return None
    
    update_data=post_update.model_dump(exclude_unset=True,exclude={"tags"})

    for field,value in update_data.items():
        if value is not None:
            setattr(db_post,field,value)

    if "title" in update_data and update_data["title"]:
        db_post.slug = slugify(update_data["title"])

    if post_update.tags is not None:

        db_post.tags.clear()

        for tag_name in post_update.tags:
            tag = db.query(Tag).filter(Tag.name==tag_name).first()
            if not tag:
                tag = Tag(name=tag_name,slug=slugify(tag_name))
                db.add(tag)
                db.flush()
            db_post.tags.append(tag)

    if "content" in update_data:
        word_count = len(update_data["content"].split())
        db_post.word_count = word_count
        db_post.reading_time=max(1,word_count//200)

    if "status" in update_data and update_data["status"]=="published" and not db_post.published_at:
        db_post.published_at = datetime.now()

    db_post.updated_at=datetime.now()
    db.commit()
    db.refresh(db_post)
    return db_post

def delete_post(db:Session,post_id:int)->bool:
    """
    删除文章
    
    参数:
        db (Session): 数据库会话对象
        post_id (int): 要删除的文章ID
    
    返回:
        bool: 删除成功返回True，文章不存在返回False
    """""
    db_post = get_post(db,post_id)
    if not db_post:
        return False

    db.delete(db_post)
    db.commit()
    return True

def increment_post_views(db:Session,post_id:int)->Optional[Post]:
    """
    文章浏览量加1
    
    参数:
        db (Session): 数据库会话对象
        post_id (int): 文章ID
    
    返回:
        Optional[Post]: 更新后的文章对象，如果文章不存在则返回None
    """""
    db_post =  get_post(db,post_id)  # 修复：使用get_post而不是get_posts
    if db_post:
        # db_post.views=db_post.views+1
        db.commit()
        db.refresh(db_post)
    return db_post

def get_post_count(db:Session,status:Optional[str]=None)->int:
    """
    获取文章数量
    
    参数:
        db (Session): 数据库会话对象
        status (Optional[str]): 文章状态过滤条件
    
    返回:
        int: 符合条件的文章数量
    """""
    query = db.query(Post)
    if status:
        query = query.filter(Post.status==status)
    return query.count()