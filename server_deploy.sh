#!/bin/bash
set -e

echo "=== 服务器端部署开始 ==="

cd ~/momentum

# 备份旧版本
if [ -f dist/server.cjs ]; then
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    tar -czf "backups/$BACKUP_NAME" dist/ data/ 2>/dev/null || true
    echo "已备份: backups/$BACKUP_NAME"
fi

# 清理旧文件
rm -rf dist/ package*.json Dockerfile docker-compose.yml
echo "旧文件已清理"

# 解压新版本
tar -xzf /tmp/momentum-deploy.tar.gz
echo "新版本已解压"

# 检查/创建环境变量
if [ ! -f .env ]; then
    cat > .env << 'ENV'
NODE_ENV=production
PORT=3050
JWT_SECRET=momentum-prod-change-me
BCRYPT_ROUNDS=10
GEMINI_API_KEY=
DATA_DIR=/home/ubuntu/momentum/data
LOG_DIR=/home/ubuntu/momentum/logs
ENV
    echo "已创建 .env 文件"
else
    echo ".env 已存在，跳过"
fi

# 安装生产依赖
echo "安装生产依赖..."
npm install --production --no-audit --no-fund 2>&1 | tail -3

# 停止旧服务
pm2 stop momentum 2>/dev/null || true
pm2 delete momentum 2>/dev/null || true
echo "旧服务已停止"

# 启动新服务
pm2 start dist/server.cjs \
    --name momentum \
    --time \
    --max-memory-restart 500M \
    --env production
pm2 save
echo "新服务已启动"

# 等待启动
sleep 3

# 健康检查
echo "健康检查:"
curl -s http://localhost:3050/health
echo ""

echo "=== 部署完成 ==="
