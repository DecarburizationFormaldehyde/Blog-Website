#!/usr/bin/env python
"""
初始化数据库数据
"""
import sys
import os
from pathlib import Path

# 添加项目根目录
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models.user import User
from app.models.categories import Category
from app.models.tags import Tag
from app.models.post import Post
from app.models.setting import Setting
from app.models.comment import Comment  # 导入Comment模型以解决循环依赖
from app.models.post_tag import PostTag  # 导入PostTag模型以解决多对多关系依赖
from app.models.series import Series
import bcrypt
from datetime import datetime


def create_admin_user(db):
    """创建管理员用户"""
    print("👤 创建管理员用户...")

    # 检查是否已存在
    admin = db.query(User).filter(User.username == "admin").first()
    if admin:
        print("  ✅ 管理员用户已存在")
        return admin

    # 创建管理员
    hashed_password = bcrypt.hashpw(b"admin123", bcrypt.gensalt())
    admin = User(
        username="admin",
        email="admin@example.com",
        display_name="系统管理员",
        hashed_password=hashed_password.decode('utf-8'),
        is_admin=True
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)
    print("  ✅ 管理员用户创建成功")
    return admin


def create_default_categories(db):
    """创建默认分类"""
    print("\n🏷️ 创建默认分类...")

    default_categories = [
        {"name": "技术教程", "slug": "tutorial", "description": "技术教程和指南"},
        {"name": "开发日志", "slug": "devlog", "description": "开发经验和心得"},
        {"name": "问题解决", "slug": "troubleshooting", "description": "技术问题解决方案"},
        {"name": "项目展示", "slug": "showcase", "description": "项目展示和介绍"},
    ]

    created = 0
    for cat_data in default_categories:
        existing = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
        if not existing:
            category = Category(**cat_data)
            db.add(category)
            created += 1

    db.commit()
    print(f"  ✅ 创建了 {created} 个默认分类")
    return created


def create_sample_posts(db, admin_id):
    """创建示例文章"""
    print("\n📝 创建示例文章...")

    sample_posts = [
        {
            "title": "欢迎使用博客系统",
            "slug": "welcome-to-blog-system",
            "content": """
# 欢迎使用博客系统！

这是一个基于 FastAPI 和 React 构建的现代化博客系统。

## 主要功能

1. **文章管理**: 创建、编辑、删除文章
2. **分类和标签**: 组织你的内容
3. **响应式设计**: 在手机和电脑上都能完美显示
4. **Markdown支持**: 使用Markdown编写文章

## 技术栈

- **后端**: FastAPI, SQLAlchemy, Pydantic
- **前端**: React, Redux Toolkit, Chakra UI
- **数据库**: SQLite/PostgreSQL

## 开始使用

1. 登录系统
2. 创建你的第一篇文章
3. 发布并分享！

祝使用愉快！
            """,
            "excerpt": "欢迎使用基于FastAPI和React构建的博客系统",
            "status": "published",
            "author_id": admin_id,
            "category_id": 1,  # 假设技术教程是第一个分类
            "published_at": datetime.now()
        },
        {
            "title": "Markdown写作指南",
            "slug": "markdown-writing-guide",
            "content": """
# Markdown 写作指南

Markdown 是一种轻量级标记语言，让你可以专注于内容本身。

## 基础语法

### 标题

### 代码
行内代码: `print("Hello World")`

代码块:
```python
def hello_world():
    print("Hello, World!")
""",
"excerpt": "学习如何使用Markdown编写博客文章",
"status": "published",
"author_id": admin_id,
"category_id": 1,
"published_at": datetime.now()
}
]
    created = 0
    for post_data in sample_posts:
        existing = db.query(Post).filter(Post.slug == post_data["slug"]).first()
        if not existing:
            # 计算字数和阅读时间
            content = post_data["content"]
            word_count = len(content.split())
            reading_time = max(1, word_count // 200)

            post = Post(
                **post_data,
                word_count=word_count,
                reading_time=reading_time
            )
            db.add(post)
            created += 1

    db.commit()
    print(f"  ✅ 创建了 {created} 篇示例文章")
    return created

def create_default_settings(db):
    """创建默认设置"""
    print("\n⚙️ 创建默认设置...")
    default_settings = [
        {"key": "site_name", "value": "我的技术博客", "group": "general", "is_public": True},
        {"key": "site_description", "value": "一个基于FastAPI和React的博客系统", "group": "general", "is_public": True},
        {"key": "posts_per_page", "value": "10", "value_type": "int", "group": "general", "is_public": True},
        {"key": "theme", "value": "light", "group": "appearance", "is_public": True},
        {"key": "allow_comments", "value": "true", "value_type": "bool", "group": "content", "is_public": True},
    ]

    created = 0
    for setting_data in default_settings:
        existing = db.query(Setting).filter(Setting.key == setting_data["key"]).first()
        if not existing:
            setting = Setting(**setting_data)
            db.add(setting)
            created += 1

    db.commit()
    print(f"  ✅ 创建了 {created} 个默认设置")
    return created

def main():
    """主函数"""
    print("=" * 50)
    print("初始化数据库数据")
    print("=" * 50)
    db = SessionLocal()

    try:
        # 创建管理员用户
        admin = create_admin_user(db)

        # 创建默认分类
        create_default_categories(db)

        # 创建示例文章
        create_sample_posts(db, admin.id)

        # 创建默认设置
        create_default_settings(db)

        print("\n" + "=" * 50)
        print("🎉 数据初始化完成！")
        print("\n默认登录信息:")
        print("  用户名: admin")
        print("  密码: admin123")
        print("\n请及时修改默认密码！")

    except Exception as e:
        db.rollback()
        print(f"❌ 初始化失败: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        db.close()

    return True

if __name__ == "__main__":
    main()
