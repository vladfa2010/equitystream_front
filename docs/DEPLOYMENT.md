# EquityStream — Deployment Guide

## Production Environment

| Component | Host | URL |
|-----------|------|-----|
| Frontend | VPS (static files via Caddy) | https://159-194-206-229.sslip.io |
| Backend API | VPS (Express on localhost:3001) | https://159-194-206-229.sslip.io/api |
| PostgreSQL | VPS (localhost:5432) | — |

---

## VPS Specs

- **OS**: Ubuntu 22.04/24.04 LTS
- **IP**: 159.194.206.229
- **Domain**: sslip.io (auto via Caddy ACME)
- **SSL**: Let's Encrypt (auto-renewal)

---

## Deploy Steps

### 1. Server Prerequisites

```bash
# Node.js 20
sudo apt update && sudo apt install -y curl gnupg
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs

# PostgreSQL 16
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql

# Caddy (auto-SSL)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
```

### 2. PostgreSQL Setup

```bash
sudo -u postgres psql
CREATE USER equitystream WITH PASSWORD 'es_password_2025';
CREATE DATABASE equitystream OWNER equitystream;
GRANT ALL PRIVILEGES ON DATABASE equitystream TO equitystream;
\q

# Run migrations
psql -U equitystream -d equitystream -f /opt/equitystream-backend/src/migrations/001_initial.sql
```

### 3. Backend Deploy

```bash
# Directory
sudo mkdir -p /opt/equitystream-backend
sudo chown -R root:root /opt/equitystream-backend

# Copy files (from local build)
cp -r backend/* /opt/equitystream-backend/
cd /opt/equitystream-backend
npm install
npm run build  # compiles to dist/

# Environment
cat > /opt/equitystream-backend/.env << 'EOF'
DATABASE_URL=postgresql://equitystream:es_password_2025@localhost:5432/equitystream
JWT_SECRET=es_jwt_secret_2025_change_in_production
FRONTEND_URL=https://159-194-206-229.sslip.io
PORT=3001
NODE_ENV=production
EMAIL_PROVIDER=none
EMAIL_FROM=EquityStream <noreply@equitystream.ru>
EOF

# Systemd service
cat > /etc/systemd/system/equitystream-api.service << 'EOF'
[Unit]
Description=EquityStream API
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/equitystream-backend
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable equitystream-api
sudo systemctl start equitystream-api
```

### 4. Frontend Deploy

```bash
# Build locally
npm run build   # → dist/

# Deploy to server
rm -rf /var/www/equitystream
mkdir -p /var/www/equitystream
cp -r dist/* /var/www/equitystream/
chown -R caddy:caddy /var/www/equitystream
```

### 5. Caddy Config

```caddy
159-194-206-229.sslip.io {
    # API → backend
    handle /api/* {
        uri strip_prefix /api
        reverse_proxy localhost:3001
    }

    # Static files + SPA fallback
    handle {
        root * /var/www/equitystream
        file_server
        try_files {path} /index.html
        encode gzip
    }

    header /assets/* Cache-Control "public, max-age=31536000, immutable"
}
```

```bash
sudo systemctl reload caddy
```

---

## Useful Commands

| Task | Command |
|------|---------|
| Restart API | `sudo systemctl restart equitystream-api` |
| Check API logs | `sudo journalctl -u equitystream-api -f` |
| Check Caddy | `sudo systemctl status caddy` |
| Caddy reload | `sudo systemctl reload caddy` |
| DB connect | `sudo -u postgres psql -d equitystream` |
| API health | `curl https://159-194-206-229.sslip.io/api/health` |

---

## File Locations

| Path | Purpose |
|------|---------|
| `/opt/equitystream-backend/` | Backend source + compiled dist |
| `/var/www/equitystream/` | Frontend static files |
| `/etc/caddy/Caddyfile` | Web server config |
| `/etc/systemd/system/equitystream-api.service` | API systemd service |
| `/opt/equitystream-backend/.env` | Backend environment |

---

## Security Checklist

- [ ] Change `JWT_SECRET` from default
- [ ] Change PostgreSQL password from default
- [ ] Configure Resend API key for email (`EMAIL_PROVIDER=resend`)
- [ ] Set up firewall (ufw allow 22, 80, 443)
- [ ] Regular PostgreSQL backups
- [ ] Monitor `user_logins` table for suspicious activity
