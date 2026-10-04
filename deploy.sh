#!/bin/bash

# Momentum 一键部署脚本
# 部署到腾讯云 mo.velolabs.top

set -e

# 服务器配置
SERVER_IP="118.25.141.173"
SERVER_USER="ubuntu"
SERVER_PASS="Chris@1989"
REMOTE_DIR="/home/ubuntu/momentum"
PORT=3050

echo "=========================================="
echo "  Momentum 一键部署脚本"
echo "  目标服务器: $SERVER_IP"
echo "=========================================="
echo ""

# 检查 sshpass
if ! command -v sshpass &> /dev/null; then
    echo "[1/6] 安装 sshpass..."
    brew install sshpass 2>/dev/null || echo "  请手动安装 sshpass: brew install sshpass"
fi

# 步骤1: 本地构建
echo ""
echo "[1/6] 本地构建..."
npm run build
echo "  ✓ 构建完成"

# 步骤2: 打包部署文件
echo ""
echo "[2/6] 打包部署文件..."
DEPLOY_FILES="dist/ package*.json Dockerfile docker-compose.yml"
tar -czvf momentum-deploy.tar.gz $DEPLOY_FILES
echo "  ✓ 打包完成"

# 步骤3: 上传到服务器
echo ""
echo "[3/6] 上传到服务器..."
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no momentum-deploy.tar.gz "$SERVER_USER@$SERVER_IP:/tmp/"
echo "  ✓ 上传完成"

# 步骤4: 在服务器上解压并部署
echo ""
echo "[4/6] 服务器端部署..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'
    set -e
    echo "  创建部署目录..."
    mkdir -p ~/momentum
    cd ~/momentum
    
    echo "  解压部署文件..."
    tar -xzvf /tmp/momentum-deploy.tar.gz
    
    echo "  检查 Docker..."
    if ! command -v docker &> /dev/null; then
        echo "  安装 Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
    fi
    
    echo "  检查 docker-compose..."
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo "  安装 docker-compose 插件..."
        sudo apt-get update
        sudo apt-get install -y docker-compose-plugin
    fi
    
    echo "  创建环境变量文件..."
    if [ ! -f .env ]; then
        cat > .env << 'ENV'
GEMINI_API_KEY=
NODE_ENV=production
PORT=3000
ENV
    fi
    
    echo "  启动服务..."
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d --build
    else
        docker compose up -d --build
    fi
    
    echo "  等待服务启动..."
    sleep 5
    
    echo "  检查服务状态..."
    if command -v docker-compose &> /dev/null; then
        docker-compose ps
    else
        docker compose ps
    fi
EOF
echo "  ✓ 服务端部署完成"

# 步骤5: 配置域名解析提示
echo ""
echo "[5/6] 域名配置..."
echo "  请确保 mo.velolabs.top 已解析到 $SERVER_IP"
echo "  DNS 记录: A 记录 mo.velolabs.top -> $SERVER_IP"

# 步骤6: 验证
echo ""
echo "[6/6] 验证部署..."
sleep 3
if curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_IP:3000" | grep -q "200"; then
    echo "  ✓ 服务运行正常!"
    echo ""
    echo "=========================================="
    echo "  部署成功!"
    echo "  访问地址: http://$SERVER_IP:3000"
    echo "  配置域名后访问: https://mo.velolabs.top"
    echo "=========================================="
else
    echo "  ⚠ 服务可能还在启动中，请稍候再试"
fi

# 清理本地临时文件
rm -f momentum-deploy.tar.gz

echo ""
echo "部署脚本执行完毕。"