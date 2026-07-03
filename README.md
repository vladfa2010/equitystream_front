# EquityStream Frontend

Premium investment management platform for equity package distribution. Admin creates deals, allocates positions to clients, manages materials. Clients view their portfolio, track P&L, and access deal materials.

**Live Demo**: https://ybdq5yh7rzdpe.kimi.page

---

## Features

### Admin Panel

| Feature | Description |
|---------|-------------|
| **Dashboard** | AUM metrics, active deals, portfolio performance chart, top performers |
| **New Deal** | 3-step wizard: Company info → Client allocations → Review & Create |
| **All Deals** | Full list with search, status filter, sort by volume/return/date |
| **Deal Detail** | Price management, client positions table, P&L tracking |
| **New Client** | 4-step wizard: Personal → Contacts → Documents → Review |
| **All Clients** | Grid/table view, search, add client modal |
| **Client Profile** | Portfolio positions, performance chart, personal details |
| **Delete Deal** | Confirmation modal — type company name to confirm |
| **Materials** | File upload (drag & drop), link management |

### Client Portal

| Feature | Description |
|---------|-------------|
| **Portfolio** | Personal positions, P&L, performance chart |
| **Deal View** | Entry vs current price, share count, materials |

### Database (localStorage)

- **Deals** — company info, ticker, volume, price, status, investments
- **Clients** — personal data, contacts, documents (avatar, contract, ID)
- **Materials** — files and links attached to deals
- **Price History** — automatic tracking on price updates

---

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Framer Motion (animations)
- Recharts (charts)
- Three.js (3D globe hero)
- React Router (HashRouter)

---

## Quick Start

```bash
npm install
npm run dev     # localhost:5173
```

### Build

```bash
npm run build   # dist/ output
```

---

## Project Structure

```
src/
├── api/                    # API layer
│   ├── client.ts           # Axios instance with JWT interceptor
│   ├── types.ts            # TypeScript interfaces (DealResponse, ClientResponse, etc.)
│   ├── localDb.ts          # localStorage database (demo mode)
│   ├── index.ts            # Barrel exports
│   └── services/
│       ├── auth.ts         # Login/register
│       ├── deals.ts        # CRUD deals
│       ├── clients.ts      # CRUD clients
│       ├── materials.ts    # CRUD materials
│       └── dashboard.ts    # Analytics
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── Layout.tsx
│   ├── Footer.tsx
│   ├── Globe.tsx           # Three.js 3D globe
│   └── deals/              # Deal-specific components
│       ├── StepIndicator.tsx
│       ├── CurrencyInput.tsx
│       ├── AddClientModal.tsx
│       ├── ClientCard.tsx
│       ├── ClientTableRow.tsx
│       └── EditClientModal.tsx
├── pages/
│   ├── RouteSelector.tsx   # Admin/Client choice
│   ├── admin/
│   │   ├── Dashboard.tsx
│   │   ├── DealsList.tsx   # All deals page
│   │   ├── DealEditor.tsx  # New Deal wizard
│   │   ├── DealDetail.tsx
│   │   ├── ClientsList.tsx
│   │   ├── ClientDetail.tsx
│   │   ├── CreateClient.tsx # New Client wizard
│   │   └── MaterialsLibrary.tsx
│   └── client/
│       ├── Dashboard.tsx
│       └── DealView.tsx
├── data/
│   └── mockData.ts         # Utility functions (formatCurrency, etc.)
├── hooks/
│   └── useApi.ts           # useFetch, useMutation hooks
└── App.tsx                 # Routes
```

---

## API Services

All services support both **localStorage** (demo) and **REST API** (production) modes.

### Deals
```typescript
dealsApi.getAll({ status?, search? })      // List deals
dealsApi.getById(id)                       // Deal detail
dealsApi.create(data: CreateDealRequest)   // Create deal
dealsApi.update(id, data)                  // Update deal
dealsApi.updatePrice(id, { price })        // Update price
dealsApi.delete(id)                        // Delete deal
```

### Clients
```typescript
clientsApi.getAll({ status?, search? })    // List clients
clientsApi.getById(id)                     // Client detail
clientsApi.create(data: CreateClientRequest) // Create client
clientsApi.update(id, data)                // Update client
clientsApi.getPortfolio(id)                // Client portfolio
```

### Dashboard
```typescript
dashboardApi.getAdmin()    // Admin dashboard data
dashboardApi.getClient()   // Client dashboard data
```

---

## Switch to Real Backend

1. Set API URL in `.env`:
```
VITE_API_URL=http://localhost:3001/api/v1
```

2. Swap `localDb.ts` for real API calls in `src/api/services/*.ts`

3. Backend repo: https://github.com/vladfa2010/equitystream

---

## Design System

- **Background**: `#0A0A0F` (deep obsidian)
- **Glass panels**: `backdrop-filter: blur(24px) saturate(140%)`
- **Gold accent**: `#B8A14E`
- **Profit green**: `#10B981`
- **Loss red**: `#EF4444`
- **Fonts**: Clash Display (headings), Inter (body), JetBrains Mono (numbers)

---

## License

Private — All rights reserved.
