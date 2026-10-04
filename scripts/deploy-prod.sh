#!/bin/bash

# Momentum 生产环境部署脚本 (v2.0)
# 包含: 生产构建、安全配置、备份、健康检查

set -e

# 服务器配置
SERVER_IP="118.25.141.173"
SERVER_USER="ubuntu"
SERVER_PASS="Chris@1989"
REMOTE_DIR="/home/ubuntu/momentum"
APP_PORT=3050

echo "=========================================="
echo "  Momentum 生产环境部署 v2.0"
echo "  目标: https://mo.velolabs.top"
echo "  包含: 认证系统 / 数据库 / 安全中间件"
echo "=========================================="
echo ""

# 检查 sshpass
if ! command -v sshpass &> /dev/null; then
    echo "[!] 缺少 sshpass，请先安装: brew install sshpass"
    exit 1
fi

# 步骤1: 本地生产构建
echo ""
echo "[1/7] 本地生产构建..."
NODE_ENV=production npm run build 2>&1 | tail -10
echo "  ✓ 构建完成"

# 步骤2: 创建生产环境配置
echo ""
echo "[2/7] 准备部署文件..."
if [ ! -f .env.production ]; then
    cat > .env.production << 'ENV'
NODE_ENV=production
PORT=3050
JWT_SECRET=momentum-prod-$(date +%s)-change-this
BCRYPT_ROUNDS=10
GEMINI_API_KEY=
DATA_DIR=/home/ubuntu/momentum/data
LOG_DIR=/home/ubuntu/momentum/logs
ENV
fi
echo "  ✓ 配置文件就绪"

# 步骤3: 打包部署文件
echo ""
echo "[3/7] 打包部署文件..."
DEPLOY_FILES="dist/ package*.json Dockerfile docker-compose.yml .env.production"
tar -czvf momentum-deploy.tar.gz $DEPLOY_FILES 2>/dev/null
echo "  ✓ 打包完成 ($(du -h momentum-deploy.tar.gz | cut -f1))"

# 步骤4: 上传到服务器
echo ""
echo "[4/7] 上传到服务器..."
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no momentum-deploy.tar.gz "$SERVER_USER@$SERVER_IP:/tmp/"
echo "  ✓ 上传完成"

# 步骤5: 服务器端部署
echo ""
echo "[5/7] 服务器端部署..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'
    set -e

    echo "  创建目录结构..."
    mkdir -p ~/momentum/{data,logs,backups}
    cd ~/momentum

    echo "  备份旧版本..."
    if [ -f dist/server.cjs ]; then
        BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S).tar.gz"
        tar -czf "backups/$BACKUP_NAME" dist/ data/ 2>/dev/null || true
        echo "    ✓ 已备份到 backups/$BACKUP_NAME"
    fi

    echo "  清理旧文件..."
    rm -rf dist/ package*.json
    rm -f Dockerfile docker-compose.yml .env.production

    echo "  解压新版本..."
    tar -xzf /tmp/momentum-deploy.tar.gz

    echo "  复制环境变量..."
    if [ -f .env.production ] && [ ! -f .env ]; then
        cp .env.production .env
    fi

    echo "  安装生产依赖..."
    npm install --production --no-audit --no-fund 2>&1 | tail -5

    echo "  停止旧服务..."
    pm2 stop momentum 2>/dev/null || true
    pm2 delete momentum 2>/dev/null || true

    echo "  启动新服务..."
    pm2 start dist/server.cjs \
        --name momentum \
        --time \
        --max-memory-restart 500M \
        --env production

    pm2 save

    echo "  清理旧日志..."
    pm2 flush momentum 2>/dev/null || true

    echo "  等待服务启动..."
    sleep 5

    echo "  服务状态:"
    pm2 status momentum
EOF
echo "  ✓ 服务端部署完成"

# 步骤6: 健康检查
echo ""
echo "[6/7] 健康检查..."
sleep 3
if sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "curl -s http://localhost:$APP_PORT/health"; then
    echo ""
    echo "  ✓ 后端健康检查通过"
else
    echo "  ✗ 后端健康检查失败"
fi

# 步骤7: 前端访问验证
echo ""
echo "[7/7] 前端访问验证..."
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://mo.velolabs.top/" || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✓ HTTPS 访问正常 (HTTP $HTTP_CODE)"
else
    echo "  ⚠ HTTPS 访问返回: $HTTP_CODE"
fi

# 清理本地临时文件
rm -f momentum-deploy.tar.gz

echo ""
echo "=========================================="
echo "  部署完成！"
echo "  访问地址: https://mo.velolabs.top"
echo ""
echo "  重要信息："
echo "  • 用户数据已持久化到 SQLite (~/momentum/data)"
echo "  • 应用日志: ~/momentum/logs"
echo "  • 旧版本备份: ~/momentum/backups"
echo "  • PM2 进程名: momentum"
echo ""
echo "  常用命令："
echo "  • 查看日志: ssh ubuntu@$SERVER_IP 'pm2 logs momentum'"
echo "  • 重启服务: ssh ubuntu@$SERVER_IP 'pm2 restart momentum'"
echo "  • 备份数据: ./scripts/backup.sh"
echo "=========================================="
