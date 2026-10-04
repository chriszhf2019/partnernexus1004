#!/bin/bash

# Momentum 数据备份脚本
# 用法: ./scripts/backup.sh [服务器IP]
# 默认备份到本地 ./backups/ 目录

set -e

SERVER_IP="${1:-118.25.141.173}"
SERVER_USER="ubuntu"
SERVER_PASS="Chris@1989"
REMOTE_DIR="/home/ubuntu/momentum"
LOCAL_BACKUP_DIR="./backups"

mkdir -p "$LOCAL_BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_NAME="momentum-backup-${TIMESTAMP}.tar.gz"
REMOTE_BACKUP="/tmp/${BACKUP_NAME}"

echo "=========================================="
echo "  Momentum 数据备份"
echo "  时间: $(date)"
echo "  服务器: $SERVER_IP"
echo "=========================================="
echo ""

# 远程备份
echo "[1/3] 在服务器上创建备份..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << EOF
    # 停止服务以确保数据一致性
    pm2 stop momentum 2>/dev/null || true
    sleep 2

    # 创建备份
    cd $REMOTE_DIR
    tar -czf $REMOTE_BACKUP data/ .env 2>/dev/null

    # 重启服务
    pm2 start momentum 2>/dev/null || pm2 restart momentum 2>/dev/null || true

    echo "  ✓ 远程备份创建完成"
    ls -lh $REMOTE_BACKUP
EOF

# 下载备份
echo ""
echo "[2/3] 下载备份到本地..."
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP:$REMOTE_BACKUP" "$LOCAL_BACKUP_DIR/"
echo "  ✓ 下载完成: $LOCAL_BACKUP_DIR/$BACKUP_NAME"

# 清理远程临时文件
echo ""
echo "[3/3] 清理远程临时文件..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "rm -f $REMOTE_BACKUP"

# 清理旧备份（保留最近 30 天）
find "$LOCAL_BACKUP_DIR" -name "momentum-backup-*.tar.gz" -mtime +30 -delete 2>/dev/null || true

echo ""
echo "=========================================="
echo "  备份完成"
echo "  本地路径: $LOCAL_BACKUP_DIR/$BACKUP_NAME"
echo "  备份大小: $(du -h "$LOCAL_BACKUP_DIR/$BACKUP_NAME" | cut -f1)"
echo ""
echo "  恢复命令:"
echo "  scp $LOCAL_BACKUP_DIR/$BACKUP_NAME ubuntu@$SERVER_IP:/tmp/"
echo "  ssh ubuntu@$SERVER_IP 'pm2 stop momentum && cd ~/momentum && tar -xzf /tmp/$BACKUP_NAME && pm2 start momentum'"
echo "=========================================="
