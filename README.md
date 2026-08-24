# EquityStream — Stock Portfolio Distribution Platform

**Live**: https://159-194-206-229.sslip.io

EquityStream is a full-stack investment management platform with:
- **Client Portal**: portfolio tracking, deal access, marketplace with Level 2 Order Book
- **Admin Panel**: deal creation, client management, user approval workflow, materials library
- **Marketplace**: real-time order book with limit/market orders, position-based permissions

---

## Quick Start

```bash
# Frontend (dev)
npm install
npm run dev     # localhost:5173

# Backend (dev — requires PostgreSQL)
cd /opt/equitystream-backend
npm install
npm run dev     # localhost:3001 (ts-node)
```

---

## Default Admin Account

| Email | Password | Role |
|-------|----------|------|
| `vladfa2010@gmail.com` | `Bmw335cabrio!+!` | admin |

---

## Architecture

```
React 19 + Vite + Tailwind CSS + Framer Motion
         │ HTTPS (Caddy auto-SSL)
┌────────▼────────┐
│  Caddy Reverse  │  /api/* → Express
│  Proxy          │  static → /var/www/equitystream
└────────┬────────┘
         │ HTTP
┌────────▼────────┐
│  Express + TS   │  Port 3001, systemd service
│  PostgreSQL 16  │  Port 5432, local auth
└─────────────────┘
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/TECH_STACK.md](docs/TECH_STACK.md) | Full stack, database schema, color system, folder structure |
| [docs/AUTH.md](docs/AUTH.md) | Login, registration, approval workflow, admin user management |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | VPS deployment, Caddy config, systemd, PostgreSQL setup |

---

## Key Features

### Client Portal
- Portfolio dashboard with performance charts
- Deal details with price history
- **Level 2 Order Book** — individual orders, limit/market orders
- Position-based permissions (can only sell if holding)
- Glassmorphism UI with warm terracotta palette

### Admin Panel
- Metrics dashboard (AUM, active deals, clients, returns)
- 3D Globe (Three.js)
- Deal wizard (3 steps: info → allocations → review)
- Client wizard (4 steps: personal → contacts → documents → review)
- **User Management** — approve/block/toggle admin/reset password/delete

---

## Technologies

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, Recharts
- **Backend**: Express, TypeScript, Node.js 20, ts-node
- **Database**: PostgreSQL 16 (users, deals, clients, materials, price history, activity log)
- **Auth**: bcrypt (cost 12), JWT HS256, admin approval workflow
- **Server**: Caddy (auto-SSL), Ubuntu VPS
- **UI Effects**: React Bits (SpotlightCard, ShinyText, GlareHover, CountUp)

---

## Project Structure

```
src/
  /api/services/          # API clients (auth, admin, deals, clients, materials)
  /components/
    /react-bits/          # SpotlightCard, ShinyText, GlareHover, CountUp
    /ui/                  # shadcn/ui components
    Navbar.tsx, Layout.tsx, Sidebar.tsx, Globe.tsx
    /client/, /clients/, /deals/, /materials/
  /context/AuthContext.tsx  # JWT auth state + viewMode
  /data/mockData.ts        # Seed data + format utilities
  /pages/
    LoginPage.tsx          # 5-mode auth (login/register/forgot/code/reset)
    PendingApprovalPage.tsx
    /admin/                # Dashboard, Deals, Clients, Materials, Users
    /client/               # Dashboard, DealView, DealTrading, Market
```

---

## License

Private — All rights reserved.
