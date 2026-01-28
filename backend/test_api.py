#!/usr/bin/env python
"""
API 测试脚本
"""
import requests
import json

BASE_URL = "http://localhost:8000"


def test_health():
    """测试健康检查"""
    print("🧪 测试健康检查...")
    response = requests.get(f"{BASE_URL}/api/health")
    print(f"  状态码: {response.status_code}")
    print(f"  响应: {response.json()}")
    return response.status_code == 200


def test_list_posts():
    """测试获取文章列表"""
    print("\n📝 测试获取文章列表...")
    response = requests.get(f"{BASE_URL}/api/v1/posts")
    print(f"  状态码: {response.status_code}")

    if response.status_code == 200:
        posts = response.json()
        print(f"  获取到 {len(posts)} 篇文章")
        for i, post in enumerate(posts[:3]):  # 只显示前3篇
            print(f"  {i + 1}. {post.get('title', '无标题')}")
    return response.status_code == 200


def test_create_post():
    """测试创建文章（需要认证，暂时跳过）"""
    print("\n📝 测试创建文章（跳过，需要认证）...")
    print("  需要先实现用户认证")
    return True


def test_categories():
    """测试获取分类"""
    print("\n🏷️ 测试获取分类...")
    response = requests.get(f"{BASE_URL}/api/v1/categories")
    print(f"  状态码: {response.status_code}")

    if response.status_code == 200:
        categories = response.json()
        print(f"  获取到 {len(categories)} 个分类")
        for cat in categories:
            print(f"  - {cat['name']} ({cat['post_count']}篇文章)")
    return response.status_code == 200


def test_tags():
    """测试获取标签"""
    print("\n🏷️ 测试获取标签...")
    response = requests.get(f"{BASE_URL}/api/v1/tags")
    print(f"  状态码: {response.status_code}")

    if response.status_code == 200:
        tags = response.json()
        print(f"  获取到 {len(tags)} 个标签")
        for tag in tags[:10]:  # 只显示前10个
            print(f"  - {tag['name']} ({tag['post_count']}篇文章)")
    return response.status_code == 200


def main():
    """主测试函数"""
    print("=" * 50)
    print("API 测试工具")
    print("=" * 50)

    tests = [
        ("健康检查", test_health),
        ("文章列表", test_list_posts),
        ("分类列表", test_categories),
        ("标签列表", test_tags),
    ]

    results = []

    for test_name, test_func in tests:
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            print(f"❌ {test_name} 测试出错: {e}")
            results.append((test_name, False))

    print("\n" + "=" * 50)
    print("测试结果:")
    print("=" * 50)

    for test_name, success in results:
        status = "✅ 通过" if success else "❌ 失败"
        print(f"{test_name}: {status}")

    all_passed = all(success for _, success in results)

    if all_passed:
        print("\n🎉 所有测试通过！")
        print("\n接下来:")
        print("1. 启动前端开发")
        print("2. 实现用户认证系统")
        print("3. 添加更多API功能")
    else:
        print("\n⚠️  部分测试失败，请检查API服务是否运行")

    return all_passed


if __name__ == "__main__":
    # 检查API服务是否运行
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到API服务")
        print("请先启动后端服务:")
        print("  cd backend && uvicorn app.main:app --reload")