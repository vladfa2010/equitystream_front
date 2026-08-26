# EquityStream — Frontend Deployment Guide

## Production Environment

| Component | Host | URL |
|-----------|------|-----|
| Frontend | VPS (static files via nginx) | https://159-194-206-229.sslip.io |
| Backend API | VPS (NestJS on localhost:3001) | https://159-194-206-229.sslip.io/api/v1 |
| PostgreSQL | VPS (localhost:5432) | — |

---

## VPS Specs

- **OS**: Ubuntu 22.04/24.04 LTS
- **IP**: 159.194.206.229
- **Domain**: sslip.io (auto via Let's Encrypt / certbot, or Caddy if used)
- **SSL**: Let's Encrypt (auto-renewal)

---

## Deploy Steps

### 1. Server Prerequisites

```bash
# Node.js 22 (backend requirement)
sudo apt update && sudo apt install -y curl gnupg
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt install -y nodejs

# PostgreSQL 16
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql

# nginx
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2. PostgreSQL Setup

```bash
sudo -u postgres psql
CREATE USER equitystream WITH PASSWORD '<strong_password>';
CREATE DATABASE equitystream OWNER equitystream;
GRANT ALL PRIVILEGES ON DATABASE equitystream TO equitystream;
\q

# Run migrations (from backend repo)
cd /root/equitystream
npx typeorm-ts-node-commonjs migration:run -d ./src/config/database.config.ts
```

### 3. Backend Deploy

```bash
# Directory
sudo mkdir -p /root/equitystream
sudo chown -R root:root /root/equitystream

# Copy files (from local build or via git)
cd /root/equitystream
npm install --legacy-peer-deps
npm run build

# Environment — edit .env with real secrets
cat > /root/equitystream/.env << 'EOF'
PORT=3001
HOST=127.0.0.1
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=equitystream
DB_USER=equitystream
DB_PASSWORD=<strong_password>
JWT_SECRET=<min_32_bytes_base64>
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=https://159-194-206-229.sslip.io
RESEND_API_KEY=<resend_key>
RESEND_FROM_EMAIL=noreply@equitystream.com
EMAIL_ENABLED=true
UPLOAD_BASE_URL=https://159-194-206-229.sslip.io
SEED_ON_STARTUP=false
EOF

# Systemd service
cat > /etc/systemd/system/equitystream.service << 'EOF'
[Unit]
Description=EquityStream NestJS API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/equitystream
EnvironmentFile=/root/equitystream/.env
ExecStart=/usr/bin/node dist/main.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now equitystream
```

### 4. Frontend Deploy

```bash
# Build locally (from equitystream_front repo)
cd /path/to/equitystream_front
npm install
npm run build   # → dist/

# Deploy to server
ssh root@159.194.206.229 "rm -rf /var/www/equitystream && mkdir -p /var/www/equitystream"
scp -r dist/* root@159.194.206.229:/var/www/equitystream/
ssh root@159.194.206.229 "chown -R www-data:www-data /var/www/equitystream"
```

### 5. nginx Config

```nginx
server {
    listen 443 ssl http2;
    server_name 159-194-206-229.sslip.io;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend static files + SPA fallback
    root /var/www/equitystream;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/v1/ {
        proxy_pass http://127.0.0.1:3001/api/v1/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # GraphQL (optional, restrict in production if not used)
    location /graphql {
        proxy_pass http://127.0.0.1:3001/graphql;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name 159-194-206-229.sslip.io;
    return 301 https://$host$request_uri;
}
```

```bash
nginx -t
systemctl reload nginx
```

---

## Useful Commands

| Task | Command |
|------|---------|
| Restart API | `sudo systemctl restart equitystream` |
| Check API logs | `sudo journalctl -u equitystream -f` |
| Check nginx | `sudo systemctl status nginx` |
| nginx reload | `sudo systemctl reload nginx` |
| DB connect | `sudo -u postgres psql -d equitystream` |
| API health | `curl https://159-194-206-229.sslip.io/health` |
| API docs | `curl https://159-194-206-229.sslip.io/api/docs` |

---

## File Locations

| Path | Purpose |
|------|---------|
| `/root/equitystream/` | Backend source + compiled dist |
| `/var/www/equitystream/` | Frontend static files |
| `/etc/nginx/sites-available/equitystream` | Web server config |
| `/etc/systemd/system/equitystream.service` | API systemd service |
| `/root/equitystream/.env` | Backend environment |

---

## Post-Deploy Verification

```bash
# 1. Health check
curl https://159-194-206-229.sslip.io/health

# 2. Swagger UI available
curl -I https://159-194-206-229.sslip.io/api/docs

# 3. Public registration creates pending user
curl -X POST https://159-194-206-229.sslip.io/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test","password":"TestPass123"}'

# 4. Admin login
curl -X POST https://159-194-206-229.sslip.io/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vladfa2010@gmail.com","password":"Bmw335cabrio!+!"}'
```

---

## Security Checklist

- [ ] Change `JWT_SECRET` from default
- [ ] Change PostgreSQL password from default
- [ ] Configure Resend API key for email (`RESEND_API_KEY`, `EMAIL_ENABLED=true`)
- [ ] Set up firewall (`ufw allow 22, 80, 443`)
- [ ] Frontend `.env.production` uses `VITE_API_URL=/api/v1`
- [ ] `SEED_ON_STARTUP=false` in production
- [ ] Regular PostgreSQL backups
- [ ] Monitor `user_logins` table for suspicious activity
