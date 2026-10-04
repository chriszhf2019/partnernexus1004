# Momentum 腾讯云部署指南

## 部署到 mo.velolabs.top

### 方案一：云服务器 CVM + Docker

#### 1. 购买云服务器
- 推荐配置：2核4G， CentOS 7.9 或 Ubuntu 20.04
- 购买后获取公网 IP

#### 2. 安装 Docker
```bash
# CentOS
yum install -y docker docker-compose
systemctl start docker
systemctl enable docker

# Ubuntu
apt update
apt install -y docker.io docker-compose
systemctl start docker
systemctl enable docker
```

#### 3. 上传代码到服务器
```bash
# 在本地打包
tar -czvf momentum-deploy.tar.gz dist/ package*.json Dockerfile docker-compose.yml

# 上传到服务器
scp momentum-deploy.tar.gz root@<服务器IP>:/root/
```

#### 4. 在服务器上部署
```bash
cd /root
tar -xzvf momentum-deploy.tar.gz

# 创建环境变量文件
echo "GEMINI_API_KEY=你的API密钥" > .env

# 启动服务
docker-compose up -d --build
```

#### 5. 配置域名解析
- 登录腾讯云 DNS 解析控制台
- 添加 A 记录：`mo.velolabs.top` -> `<服务器公网IP>`

#### 6. 配置 Nginx 反向代理（推荐）
```bash
# 安装 Nginx
yum install -y nginx  # CentOS
# 或 apt install -y nginx  # Ubuntu

# 配置
vim /etc/nginx/conf.d/momentum.conf
```

Nginx 配置内容：
```nginx
server {
    listen 80;
    server_name mo.velolabs.top;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启动 Nginx
systemctl start nginx
systemctl enable nginx
```

#### 7. 配置 SSL 证书（推荐）
```bash
# 安装 certbot
yum install -y certbot python3-certbot-nginx  # CentOS
# 或 apt install -y certbot python3-certbot-nginx  # Ubuntu

# 申请证书
certbot --nginx -d mo.velolabs.top

# 自动续期
certbot renew --dry-run
```

---

### 方案二：轻量应用服务器（更简单）

#### 1. 购买轻量应用服务器
- 选择 Docker 应用镜像
- 2核2G 即可满足需求

#### 2. 登录服务器执行部署
```bash
# 上传文件后
cd /opt
docker-compose up -d --build
```

---

### 方案三：云托管 CloudBase（无需服务器）

#### 1. 开通云开发环境
- 登录腾讯云控制台
- 开通 CloudBase 云开发

#### 2. 使用静态网站托管
```bash
# 安装 cloudbase CLI
npm install -g @cloudbase/cli

# 登录
tcb login

# 部署静态文件
tcb hosting deploy dist -e <环境ID>
```

#### 3. 配置域名
- 在 CloudBase 控制台添加自定义域名 `mo.velolabs.top`

---

## 验证部署

部署完成后访问：https://mo.velolabs.top

检查：
- 页面正常加载
- 主题切换功能正常
- 数据本地存储正常
- AI Coach 功能正常（需配置 API Key）

---

## 环境变量说明

| 变量 | 说明 | 必填 |
|-----|------|-----|
| `GEMINI_API_KEY` | Google Gemini API 密钥 | 否（不配置则使用模拟数据） |
| `NODE_ENV` | 运行环境，设为 `production` | 是 |
| `PORT` | 服务端口，默认 3000 | 否 |

---

## 常见问题

### Q: 页面加载慢？
检查服务器带宽，建议至少 1Mbps

### Q: AI Coach 不工作？
检查 GEMINI_API_KEY 是否正确配置

### Q: 域名无法访问？
1. 检查 DNS 解析是否生效
2. 检查服务器防火墙是否开放 80/443 端口
3. 检查 Nginx 配置是否正确