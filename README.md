# EquityStream — Investment Management Platform

Platform for managing equity investments. Admins create deals (stock packages), distribute positions among clients, manage prices and documents. Clients view their portfolio, performance dynamics, and materials.

**Demo**: https://ybdq5yh7rzdpe.kimi.page

---

## Default Accounts

| Email | Password | Role |
|-------|----------|------|
| `user@equitystream.com` | `user` | User |
| `admin@equitystream.com` | `admin` | Admin |
| `superadmin@equitystream.com` | `superadmin` | Superadmin |

All three accounts are pre-created in the database and visible in the Clients list.

---

## Data Architecture

### Where data is stored

All data is stored in **browser localStorage** (keys `es_deals`, `es_clients`, `es_materials`, `es_price_history`). This means:
- Data lives only in **your browser**
- No data when switching browsers/devices
- Data persists on page refresh
- Data persists on new deployments

### Triple protection against data loss

```
┌─────────────────────────────────────────┐
│  1. initLocalDb() — never overwrites    │
│     existing data                       │
│                                         │
│  2. Automatic backup after every        │
│     change (es_deals → es_deals_backup) │
│                                         │
│  3. Auto-restore on startup — if main   │
│     data is empty, restores from backup │
└─────────────────────────────────────────┘
```

### Seed data (first visit only)

| Entity | Count |
|--------|-------|
| Clients | 13 (3 default accounts + 10 demo) |
| Deals | 2 (Apple AAPL — Founding, Databricks — Wait IPO) |
| Materials | 6 (3 per deal: presentations, reports, links) |

---

## Roles

Three role levels with colored badges:

| Role | Badge Color | Navigation |
|------|-------------|------------|
| **User** | Blue | Client portal |
| **Admin** | Purple | Admin panel |
| **Superadmin** | Red | Admin panel |

Role is selected via dropdown when creating or editing a client.

---

## Deal Statuses

Nine statuses for deals, each with its own color:

| # | Status | Color | Description |
|---|--------|-------|-------------|
| 1 | **Draft** | Gray | Draft |
| 2 | **Pipeline** | Blue | In pipeline |
| 3 | **Skip** | Slate | Skipped |
| 4 | **Reserve** | Purple | Reserved |
| 5 | **Founding** | Orange | Fundraising |
| 6 | **Deal done** | Green | Deal closed |
| 7 | **Wait IPO** | Cyan | Awaiting IPO |
| 8 | **Lock-up** | Yellow | Lock-up period |
| 9 | **Exit** | Red | Exited |

**Active deals** = Pipeline, Skip, Reserve, Founding, Deal done, Wait IPO (count in metrics).

Status is selected via dropdown in Step 1 of deal creation and in the Edit Deal modal.

---

## Features

### Admin Panel

#### 1. Dashboard (`/admin`)
- **Metrics**: Total AUM, Active Deals, Total Clients, Avg Return
- **3D Globe**: Three.js rotating globe
- **Active Deals**: list with all 9 status filters
- **Top Performers**: 5 best clients by P&L
- **Portfolio Chart**: portfolio dynamics over time
- **Quick Actions**: + New Deal, + Add Client, Upload Materials

#### 2. All Deals (`/admin/deals`)
- **Table** of all deals: Company, Status, Volume, Entry/Current Price, Return, Clients
- **Search** by name or ticker
- **Filter** by any of 9 statuses + "Active (all)"
- **Sort** by date/volume/return
- **Actions** per row: View, Delete
- **Delete**: confirmation modal requiring deal name typed in

#### 3. New Deal (`/admin/deals/new`) — 3-step wizard

**Step 1: Company Information**
- Company Name, Ticker Symbol, Exchange, Sector
- **Status** (dropdown: Draft → Pipeline → Skip → Reserve → Founding → Deal done → Wait IPO → Lock-up → Exit)
- Description (textarea, 500 chars)
- Total Deal Volume, Share Price → auto Share Quantity
- Market Cap, Website, Founder(s)
- Management Fee %, Target Price, Time Horizon
- Live preview card (real-time updates)
- **Back to Deals** button at top, **Cancel** button at bottom

**Step 2: Client Allocations**
- Summary bar: Total, Allocated, Remaining, Progress bar
- **Add Client**: search from list, amount, "Use Remaining" button
- **Lead Investor**: only one per deal, marked with crown
- **Custom Entry Price**: individual entry price per client
- **Equal Split**: equal distribution
- Client table with %, shares, P&L

**Step 3: Review & Create**
- Deal summary card (with status badge)
- Client allocations (Lead separate)
- Admin Reserve (unallocated volume)
- Management Fee summary
- **Create Deal** (gold button) with status from Step 1

#### 4. Deal Detail (`/admin/deals/:id`)
- **Header**: Ticker badge, Status badge (colored), Edit/Delete buttons
- **Metrics**: Total Package, Allocated %, Clients count, Total Return
- **Price Panel**: Entry Price, Current Price (inline edit), Shares, Fee, Target
- **Price History Bar Chart**: histogram from all Last Price entries, green/red bars
- **Price History Table**:
  - All price records: Date, Price, Change %, Admin, Source Link
  - **Add Last Price** button in header — opens modal
  - Inline **edit** per row (price, admin, source URL)
  - Inline **delete** with confirmation
- **Client Positions Table**:
  - Client avatar + name + Lead badge
  - Investment, Shares, Entry Price, P&L
  - **Remove** (trash → confirmation)
  - **Add Client** button → modal
- **Deal Materials**: files and links associated with the deal

**Edit Deal Modal** (all fields):
- Company Information: name, ticker, exchange, sector, **status dropdown**, description
- Financial: volume, share price, market cap, fee %, target price, time horizon
- Additional: website, founder(s)

#### 5. All Clients (`/admin/clients`)
- Grid/Table toggle view
- Search by name/email
- Filter by status
- Sort by name/investments/P&L
- **Add Client** button → navigates to full wizard
- Role badges (User/Admin/Superadmin) on cards and in table

#### 6. New Client (`/admin/clients/new`) — 4-step wizard

**Step 1: Personal Information**
- Full Name, Date of Birth
- Nickname / Username
- Password + Confirm Password + Strength indicator
- **Role**: User / Admin / Superadmin (dropdown)
- **Back to Clients** button at top, **Cancel** button at bottom

**Step 2: Contact Information**
- Email, Phone
- Telegram (auto @ prefix)
- Notes (textarea)

**Step 3: Documents**
- Contract PDF (drag & drop, max 10MB)
- Avatar Photo (drag & drop, max 5MB)
- ID Document (drag & drop, max 10MB)
- File preview + progress simulation

**Step 4: Review & Create**
- Personal card, Contacts, Documents checklist
- **Create Client** / **Create & Send Invite**

#### 7. Client Detail (`/admin/clients/:id`)
- **Header**: Avatar, Name, Role badge, Edit Profile / Deactivate
- **Full Profile** (4 panels):
  - **Personal Info**: Full Name, Display Name, Nickname, DOB, Role badge, Status badge
  - **Contact**: Email (mailto), Phone (tel), Telegram (t.me link)
  - **Documents**: Contract, Avatar, ID — clickable links or "Not uploaded"
  - **Notes & System**: Notes text, Created date, Updated date
- **Metrics**: Total Invested, Current Value, Total P&L, Deal Count, Avg Return
- **Portfolio Chart**: AreaChart with timeframes (1M/3M/6M/1Y/ALL)
- **Positions Table**: all client deals with P&L
- **Activity Feed**

**Edit Profile Modal** (all fields):
- Personal: Full Name, Nickname, Date of Birth, **Role dropdown**
- Contacts: Email, Phone, Telegram, Notes
- **Delete Account** at the bottom:
  - Expandable panel with warning
  - Type client's full name to confirm
  - Deletes client + all their investments from deals
  - Redirects to clients list

#### 8. Materials Library (`/admin/materials`)
- Grid/List view toggle
- Filter: All / Files / Links
- Search, Type filter, Deal filter, Sort
- **Drag & Drop Upload Zone** (gold border on hover)
- **Add Link Modal**: URL, description
- File cards: preview, name, size, deal badges
- Bulk selection + bulk actions

### Client Portal

#### Client Dashboard (`/dashboard`)
- Animated greeting (Good morning/afternoon/evening)
- **3 metric cards in a row on mobile**: Portfolio Value, Total Invested, Total Return
- Portfolio Performance chart with reference line "Your Investment"
- Active Positions: cards per deal with P&L
- Recent Materials: horizontal scroller

#### Client Deal View (`/deals/:id`)
- Deal header: company name, status badge, ticker, website link, creation date
- **My Position Panel**: Shares, Invested, Current Value, P&L with color coding
- Deal overview metrics: Share Price, Entry Price, Total Shares
- **Price History Bar Chart**: histogram from Last Price data, green/red bars
- **All Price Updates Table**: date, price, admin, source link
- **Deal Materials**: files and links grid with icons

---

## Price History Management

Each deal has a price history table:
- **Add Last Price**: modal with Price ($), Admin name, Source URL
- **Inline Edit**: click pencil → edit price, admin, source URL
- **Inline Delete**: click trash → confirm with check/cross
- **Bar Chart**: visualizes all price changes, green = up, red = down
- Entry Price shown as dashed reference line

When a price is added/edited/deleted:
- The deal's `currentPrice` is automatically recalculated from the latest history entry
- Price history is persisted in `es_price_history` localStorage key

---

## Technologies

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Framer Motion (animations)
- Recharts (charts)
- Three.js (3D globe)
- React Router (HashRouter)

---

## Project Structure

```
src/
├── api/
│   ├── client.ts              # Axios + JWT interceptor
│   ├── types.ts               # All TypeScript interfaces
│   ├── localDb.ts             # localStorage database
│   │                            # - Triple protection against data loss
│   │                            # - Backup/Restore system
│   │                            # - CRUD for deals, clients, materials, priceHistory
│   └── services/
│       ├── auth.ts            # Login/Register (3 default accounts)
│       ├── deals.ts           # CRUD deals + investments + priceHistory
│       ├── clients.ts         # CRUD clients
│       ├── materials.ts       # CRUD materials
│       └── dashboard.ts       # Analytics
├── components/
│   ├── Navbar.tsx             # Navigation (role-based)
│   ├── Layout.tsx             # Page wrapper (role-based)
│   ├── Globe.tsx              # Three.js 3D globe
│   ├── client/
│   │   ├── PortfolioMetricCard.tsx  # Metric cards (3-col on mobile)
│   │   └── PositionCard.tsx   # Deal position card
│   ├── clients/
│   │   ├── ClientCard.tsx     # Client card (grid)
│   │   ├── ClientTableRow.tsx # Client table row
│   │   └── EditClientModal.tsx # Edit + Delete Account
│   └── deals/
│       ├── AddClientModal.tsx # Add client to deal
│       └── EditDealModal.tsx  # Edit deal
├── lib/
│   └── statusColors.ts        # Deal status colors helper
├── pages/
│   ├── admin/
│   │   ├── Dashboard.tsx       # Admin home
│   │   ├── DealsList.tsx       # All deals (table)
│   │   ├── DealEditor.tsx      # New Deal wizard (3 steps)
│   │   ├── DealDetail.tsx      # Deal detail + price history chart
│   │   ├── ClientsList.tsx     # Clients list
│   │   ├── ClientDetail.tsx    # Full client profile
│   │   ├── CreateClient.tsx    # New Client wizard (4 steps)
│   │   └── MaterialsLibrary.tsx
│   └── client/
│       ├── Dashboard.tsx       # Client portfolio
│       └── DealView.tsx        # Deal view + price history + materials
├── data/
│   └── mockData.ts             # Utilities: formatCurrency, formatPercent, timeAgo
└── hooks/
    └── useApi.ts               # useFetch, useMutation hooks
```

---

## API Services

### dealsApi
```typescript
dealsApi.getAll({ status?, search? })     // → Deal[] (with materials attached)
dealsApi.getById(id)                      // → Deal | null (with materials)
dealsApi.create(data)                     // → Deal
dealsApi.update(id, patch)                // → Deal
dealsApi.updatePrice(id, { price })       // → Deal
dealsApi.delete(id)                       // → { success }
dealsApi.addInvestment(dealId, { clientId, amount, isLead? })
dealsApi.removeInvestment(dealId, investmentId)
// Price History
dealsApi.getPriceHistory(dealId)          // → PriceHistoryItem[]
dealsApi.addPriceHistory(dealId, { price, changedByAdmin, sourceUrl? })
dealsApi.updatePriceHistory(priceId, { price, changedByAdmin, sourceUrl? })
dealsApi.deletePriceHistory(priceId)      // → { success }
```

### clientsApi
```typescript
clientsApi.getAll({ status?, search? })   // → Client[]
clientsApi.getById(id)                    // → Client | null
clientsApi.create(data)                   // → Client
clientsApi.update(id, patch)              // → Client
clientsApi.delete(id)                     // → { success }
clientsApi.getPortfolio(id)               // → Deal[]
```

### materialsApi
```typescript
materialsApi.getAll({ type?, dealId?, search? })
materialsApi.create(data)                 // → Material
materialsApi.delete(id)                   // → { success }
materialsApi.attachToDeal(materialId, dealId)
```

### authApi
```typescript
authApi.login({ email, password })        // → { accessToken, user }
// Validates against 3 default accounts
authApi.me()                              // → UserDto (logged in user)
authApi.logout()                          // clears session
```

---

## Local Development

```bash
npm install
npm run dev     # localhost:5173
npm run build   # production → dist/
```

---

## License

Private — All rights reserved.
