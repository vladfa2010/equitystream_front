# EquityStream — Technical Stack & Architecture

## Full Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│  React 19 + TypeScript + Vite + Tailwind CSS + Framer       │
│  HashRouter (/#/routes) for static hosting                  │
│  JWT in localStorage, Context API for auth state            │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────▼───────────────────────────────────┐
│                        CADDY                                │
│  • Auto-SSL via Let's Encrypt (ACME + sslip.io)            │
│  • Static files: /var/www/equitystream                     │
│  • Reverse proxy: /api/* → localhost:3001                  │
│  • SPA fallback: try_files {path} /index.html              │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP (localhost)
┌─────────────────────────▼───────────────────────────────────┐
│                      BACKEND                                │
│  Express + TypeScript (ts-node dev / dist/ prod)            │
│  Port: 3001, systemd service: equitystream-api             │
│  • helmet, cors, express-rate-limit                        │
│  • JWT auth middleware, admin middleware                     │
│  • PostgreSQL via pg Pool                                   │
└─────────────────────────┬───────────────────────────────────┘
                          │ TCP (localhost)
┌─────────────────────────▼───────────────────────────────────┐
│                    POSTGRESQL 16                            │
│  Database: equitystream                                     │
│  Tables: users, password_reset_codes, user_logins,         │
│          activity_log                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.x |
| Language | TypeScript | 5.7 |
| Build Tool | Vite | 7.3 |
| Router | React Router | HashRouter |
| Styling | Tailwind CSS | 3.4 |
| UI Kit | shadcn/ui + Radix | — |
| Animations | Framer Motion | 12.x |
| Charts | Recharts | 2.x |
| Icons | Lucide React | 0.4xx |
| 3D | Three.js / React Three Fiber | — |

### UI Effects (React Bits)
- `SpotlightCard` — cursor-tracking glow
- `ShinyText` — animated shimmer on text
- `GlareHover` — glassmorphism glare on hover
- `GradientText` — gradient text fills
- `CountUp` — animated number counters

---

## Backend Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 20.x |
| Framework | Express | 4.x |
| Language | TypeScript | 5.7 |
| Dev runner | ts-node | 10.x |
| Database | PostgreSQL | 16 |
| Driver | pg (node-postgres) | 8.x |
| Auth | bcrypt (cost 12) + JWT HS256 | — |
| Security | helmet, express-rate-limit, cors | — |

### Environment Variables (`.env`)
```
DATABASE_URL=postgresql://equitystream:es_password_2025@localhost:5432/equitystream
JWT_SECRET=es_jwt_secret_2025_change_in_production
FRONTEND_URL=https://159-194-206-229.sslip.io
PORT=3001
NODE_ENV=production
EMAIL_PROVIDER=none
RESEND_API_KEY=
EMAIL_FROM=EquityStream <noreply@equitystream.ru>
```

---

## Database Schema

### `users`
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| username | VARCHAR(100) | NOT NULL |
| password_hash | TEXT | NOT NULL |
| is_admin | BOOLEAN | DEFAULT false |
| is_blocked | BOOLEAN | DEFAULT false |
| is_verified | BOOLEAN | DEFAULT false |
| registration_source | VARCHAR(50) | DEFAULT 'web' |
| registration_ip | INET | |
| cohort_date | DATE | DEFAULT CURRENT_DATE |
| last_login_at | TIMESTAMPTZ | |
| login_count | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### `password_reset_codes`
| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PK |
| user_id | UUID | FK → users.id, ON DELETE CASCADE |
| code_hash | TEXT | NOT NULL |
| attempts | INTEGER | DEFAULT 0 |
| used | BOOLEAN | DEFAULT false |
| expires_at | TIMESTAMPTZ | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### `user_logins`
| Column | Type |
|--------|------|
| id | SERIAL PK |
| user_id | UUID FK |
| login_at | TIMESTAMPTZ |
| ip_address | INET |
| user_agent | TEXT |
| platform | VARCHAR(50) |
| device_type | VARCHAR(50) |
| os | VARCHAR(50) |
| browser | VARCHAR(50) |

### `activity_log`
| Column | Type |
|--------|------|
| id | SERIAL PK |
| user_id | UUID FK |
| actor_id | UUID FK |
| event_type | VARCHAR(100) |
| metadata | JSONB |
| created_at | TIMESTAMPTZ DEFAULT NOW() |

---

## Color System

```css
--bg-base: #0F0A06          /* Deep cocoa */
--bg-surface: #1A120B       /* Dark wood */
--bg-elevated: #2A1F15     /* Warm surface */

--text-primary: #FDF4E3     /* Cream */
--text-secondary: #C9A882  /* Sand */
--text-tertiary: #7A5E44   /* Cocoa */

--accent-gold: #C9753A      /* Terracotta */
--accent-gold-hover: #E09040 /* Golden sand */
```

---

## Folder Structure

```
/src
  /api/services/
    authApi.ts          # Login/register/forgot/reset API client
    adminApi.ts         # User management API client
    deals.ts            # Deal CRUD
    clients.ts          # Client CRUD
    materials.ts        # Materials CRUD
    dashboard.ts        # Analytics
  /components/
    /react-bits/         # SpotlightCard, ShinyText, GlareHover, CountUp
    /ui/                 # shadcn components (50+)
    Navbar.tsx, Layout.tsx, Sidebar.tsx, Footer.tsx
    Globe.tsx            # Three.js 3D globe
    /client/             # PortfolioMetricCard, PositionCard, Sparkline
    /clients/            # ClientCard, ClientTableRow, EditClientModal
    /deals/              # StepIndicator, CurrencyInput
    /materials/          # MaterialCard, FilterBar, UploadModal
  /context/
    AuthContext.tsx      # JWT + user state + viewMode
  /data/
    mockData.ts          # Seed data + format utilities
  /hooks/
    useApi.ts, useMaterials.ts, use-mobile.ts
  /lib/
    statusColors.ts      # Deal status color mapping
    utils.ts             # cn() helper
  /pages/
    LoginPage.tsx        # 5-mode auth form
    PendingApprovalPage.tsx
    Home.tsx, RouteSelector.tsx
    /admin/
      Dashboard.tsx       # Admin home with metrics + globe
      DealsList.tsx       # All deals table
      DealEditor.tsx      # 3-step wizard
      DealDetail.tsx      # Detail + price history
      ClientsList.tsx     # Client grid/table
      ClientDetail.tsx    # Full profile
      CreateClient.tsx    # 4-step wizard
      MaterialsLibrary.tsx
      AdminUsersList.tsx  # User management
    /client/
      Dashboard.tsx       # Portfolio dashboard
      DealView.tsx        # Deal detail
      DealTrading.tsx     # Order book + trading
      Market.tsx          # Market view
      AvailableDeals.tsx  # Available deals list
/public
  /assets/               # Globe texture, empty states
/docs
  AUTH.md               # Auth system docs
  TECH_STACK.md         # This file
  DEPLOYMENT.md         # VPS deployment guide
```
