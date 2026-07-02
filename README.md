# EquityStream Frontend

Premium investment management platform for equity package distribution. Admin creates deals, allocates positions to clients, manages materials. Clients view their portfolio, track P&L, and access deal materials.

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Framer Motion (animations)
- Recharts (data visualization)
- Three.js (3D globe hero)
- React Router (HashRouter)

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Shared components (Navbar, Sidebar, Layout, Footer)
│   ├── ui/             # shadcn/ui components
│   ├── deals/          # Deal-specific components
│   ├── clients/        # Client-specific components
│   ├── materials/      # Materials-specific components
│   └── client/         # Client portal components
├── pages/
│   ├── admin/          # Admin pages (Dashboard, DealEditor, DealDetail, Clients, Materials)
│   ├── client/         # Client pages (Dashboard, DealView)
│   └── RouteSelector.tsx
├── data/
│   └── mockData.ts     # Mock data + utility functions
├── hooks/
│   └── useMaterials.ts # Materials state management
└── lib/
    └── utils.ts        # Utility functions
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## License

Private — All rights reserved.
