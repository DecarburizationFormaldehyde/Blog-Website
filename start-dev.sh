#!/bin/bash
echo "🚀 启动博客开发环境..."

echo "1. 安装后端依赖..."
cd backend
uv sync

echo "2. 启动后端服务器 (端口:8000)..."
uvicorn app.main:app --reload --host=0.0.0.0 --port 8000 &
BACKEND_PID=$!

cd ..

echo "3. 启动前端服务器 (端口:3000)..."
cd frontend
npm run dev &
FRONTEND_PID=$!

cd ..

echo "✅ 启动完成！"
echo "🌐 前端访问: http://localhost:3000"
echo "📚 API文档: http://localhost:8000/docs"
echo "🔄 健康检查: http://localhost:8000/api/health"

echo ""
echo "按 Ctrl+C 停止所有服务"

# 捕获退出信号
trap "echo '正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait