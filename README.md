# EquityStream — Investment Management Platform

Платформа для управления инвестициями в акции. Админ создаёт сделки (пакеты акций), распределяет позиции между клиентами, управляет ценами и документами. Клиенты видят свой портфель, динамику и материалы.

**Демо**: https://ybdq5yh7rzdpe.kimi.page

---

## Архитектура данных

### Где хранятся данные

Все данные хранятся в **localStorage браузера** (ключи `es_deals`, `es_clients`, `es_materials`). Это значит:
- Данные живут только в **твоём браузере**
- При смене браузера/устройства данных не будет
- Данные не пропадают при обновлении страницы
- Данные не пропадают при деплое новой версии

### Тройная защита от потери данных

```
┌─────────────────────────────────────────┐
│  1. initLocalDb() — никогда не          │
│     перезаписывает существующие данные  │
│                                         │
│  2. Автоматический backup после каждого │
│     изменения (es_deals →               │
│     es_deals_backup)                    │
│                                         │
│  3. Автовосстановление при старте —     │
│     если основные данные пусты,         │
│     восстанавливаются из backup         │
└─────────────────────────────────────────┘
```

### Seed-данные (только при первом визите)

| Сущность | Количество |
|----------|-----------|
| Клиенты | 10 (Alexei Volkov, Maria Petrova, ...) |
| Сделки | 2 (Apple AAPL, NVIDIA NVDA) |
| Материалы | 0 |

---

## Функционал

### Админ-панель

#### 1. Dashboard (`/admin`)
- **Метрики**: Total AUM, Active Deals, Total Clients, Avg Return
- **3D Globe**: Three.js глобус с вращением
- **Active Deals**: список сделок с фильтром (All/Active/Pending/Closed/Draft)
- **Top Performers**: 5 лучших клиентов по P&L
- **Portfolio Chart**: динамика портфеля за период
- **Quick Actions**: + New Deal, + Add Client, Upload Materials

#### 2. All Deals (`/admin/deals`)
- **Таблица** всех сделок: Company, Status, Volume, Entry/Current Price, Return, Clients
- **Search** по названию или тикеру
- **Filter** по статусу (All/Active/Pending/Closed/Draft)
- **Sort** по дате/объёму/доходности
- **Actions** на каждой строке: View, Delete
- **Delete**: модалка с вводом названия сделки для подтверждения

#### 3. New Deal (`/admin/deals/new`) — 3-шаговый wizard

**Шаг 1: Company Information**
- Company Name, Ticker Symbol, Exchange, Sector
- Description (textarea, 500 символов)
- Total Deal Volume, Share Price → auto Share Quantity
- Market Cap, Website, Founder(s)
- Management Fee %, Target Price, Time Horizon
- Live preview card (обновляется в реальном времени)

**Шаг 2: Client Allocations**
- Summary bar: Total, Allocated, Remaining, Progress bar
- **Add Client**: поиск из списка, сумма, кнопка "Use Remaining"
- **Lead Investor**: только один на сделку, отмечается 👑
- **Custom Entry Price**: индивидуальная цена входа
- **Equal Split**: равномерное распределение
- Таблица клиентов с %, shares, P&L

**Шаг 3: Review & Create**
- Deal summary card
- Client allocations (Lead отдельно)
- Admin Reserve (unallocated volume)
- Management Fee summary
- **Create Deal** (gold) / **Create as Draft**

#### 4. Deal Detail (`/admin/deals/:id`)
- **Header**: Ticker badge, Status badge, Edit/Delete кнопки
- **Metrics**: Total Package, Allocated %, Clients count, Total Return
- **Price Panel**: Entry Price, Current Price (inline edit ✏️), Shares, Fee, Target
- **Client Positions Table**:
  - Client avatar + name + Lead badge
  - Investment, Shares, Entry Price, P&L
  - **Remove** (корзина → подтверждение)
  - **Add Client** кнопка → модалка

**Edit Deal Modal** (все поля):
- Company Information: name, ticker, exchange, sector, status, description
- Financial: volume, share price, market cap, fee %, target price, time horizon
- Additional: website, founder(s)

#### 5. All Clients (`/admin/clients`)
- Grid/Table toggle view
- Search по имени/email
- Filter по статусу
- Sort по имени/инвестициям/P&L
- **Add Client** кнопка

#### 6. New Client (`/admin/clients/new`) — 4-шаговый wizard

**Шаг 1: Personal Information**
- Full Name, Date of Birth
- Nickname / Username
- Password + Confirm Password + Strength indicator
- Role: Client / Admin

**Шаг 2: Contact Information**
- Email, Phone
- Telegram (auto @ prefix)
- Notes (textarea)

**Шаг 3: Documents**
- Contract PDF (drag & drop, max 10MB)
- Avatar Photo (drag & drop, max 5MB)
- ID Document (drag & drop, max 10MB)
- File preview + progress simulation

**Шаг 4: Review & Create**
- Personal card, Contacts, Documents checklist
- **Create Client** / **Create & Send Invite**

#### 7. Client Detail (`/admin/clients/:id`)
- **Header**: Avatar, Name, Status badge, Edit Profile / Deactivate
- **Metrics**: Total Invested, Current Value, Total P&L, Deal Count, Avg Return
- **Portfolio Chart**: AreaChart с таймфреймами (1M/3M/6M/1Y/ALL)
- **Positions Table**: все сделки клиента с P&L
- **Activity Feed**

**Edit Profile Modal** (все поля):
- Personal: Full Name, Nickname, Date of Birth, Role
- Contacts: Email, Phone, Telegram, Notes
- **Delete Account** внизу:
  - Раскрывающаяся панель с предупреждением
  - Ввод полного имени клиента для подтверждения
  - Удаляет клиента + все его инвестиции из сделок
  - Редирект на список клиентов

#### 8. Materials Library (`/admin/materials`)
- Grid/List view toggle
- Filter: All / Files / Links
- Search, Type filter, Deal filter, Sort
- **Drag & Drop Upload Zone** (gold border on hover)
- **Add Link Modal**: URL, description
- File cards: preview, name, size, deal badges
- Bulk selection + bulk actions

### Клиентский портал

#### Client Dashboard (`/dashboard`)
- Animated greeting (Good morning/afternoon/evening)
- 3 metric cards: Portfolio Value, Total Invested, Total Return
- Portfolio Performance chart с референс-линией "Your Investment"
- Active Positions: карточки по каждой сделке
- Recent Materials: горизонтальный скроллер

#### Client Deal View (`/deals/:id`)
- Personal Position Panel: invested, current value, P&L
- Entry → Current Price comparison
- Price Movement chart с линией входа
- Deal Materials grid

---

## Технологии

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Framer Motion (анимации)
- Recharts (графики)
- Three.js (3D глобус)
- React Router (HashRouter)

---

## Структура проекта

```
src/
├── api/
│   ├── client.ts              # Axios + JWT interceptor
│   ├── types.ts               # Все TypeScript интерфейсы
│   ├── localDb.ts             # База данных в localStorage
│   │                            # - Тройная защита от потери данных
│   │                            # - Backup/Restore система
│   │                            # - CRUD для deals, clients, materials
│   └── services/
│       ├── auth.ts            # Login/Register
│       ├── deals.ts           # CRUD сделок + инвестиции
│       ├── clients.ts         # CRUD клиентов
│       ├── materials.ts       # CRUD материалов
│       └── dashboard.ts       # Аналитика
├── components/
│   ├── Navbar.tsx             # Навигация (admin/client)
│   ├── Sidebar.tsx            # Админ сайдбар
│   ├── Layout.tsx             # Обёртка страниц
│   ├── Footer.tsx
│   ├── Globe.tsx              # Three.js 3D глобус
│   └── deals/
│       ├── StepIndicator.tsx   # Индикатор шагов wizard
│       ├── CurrencyInput.tsx   # Ввод валюты с $
│       ├── AddClientModal.tsx  # Модалка добавления клиента
│       ├── ClientCard.tsx      # Карточка клиента (grid)
│       ├── ClientTableRow.tsx  # Строка клиента (table)
│       └── EditClientModal.tsx # Редактирование клиента + Delete Account
├── pages/
│   ├── RouteSelector.tsx       # Выбор Admin/Client
│   ├── admin/
│   │   ├── Dashboard.tsx       # Главная админа
│   │   ├── DealsList.tsx       # Все сделки (таблица)
│   │   ├── DealEditor.tsx      # New Deal wizard (3 шага)
│   │   ├── DealDetail.tsx      # Детальная сделки + Edit
│   │   ├── ClientsList.tsx     # Список клиентов
│   │   ├── ClientDetail.tsx    # Профиль клиента
│   │   ├── CreateClient.tsx    # New Client wizard (4 шага)
│   │   └── MaterialsLibrary.tsx
│   └── client/
│       ├── Dashboard.tsx       # Портфель клиента
│       └── DealView.tsx        # Просмотр сделки
├── data/
│   └── mockData.ts             # Утилиты: formatCurrency, formatPercent, timeAgo
└── hooks/
    └── useApi.ts               # useFetch, useMutation хуки
```

---

## API Services

### dealsApi
```typescript
dealsApi.getAll({ status?, search? })     // → Deal[]
dealsApi.getById(id)                      // → Deal | null
dealsApi.create(data)                     // → Deal (создание)
dealsApi.update(id, patch)                // → Deal (обновление полей)
dealsApi.updatePrice(id, { price })       // → Deal (обновление цены)
dealsApi.delete(id)                       // → { success }
dealsApi.addInvestment(dealId, { clientId, amount, isLead? })
dealsApi.removeInvestment(dealId, investmentId)
```

### clientsApi
```typescript
clientsApi.getAll({ status?, search? })   // → Client[]
clientsApi.getById(id)                    // → Client | null
clientsApi.create(data)                   // → Client (создание)
clientsApi.update(id, patch)              // → Client (обновление)
clientsApi.delete(id)                     // → { success }
clientsApi.getPortfolio(id)               // → Deal[] (сделки клиента)
```

### materialsApi
```typescript
materialsApi.getAll({ type?, dealId?, search? })
materialsApi.create(data)                 // → Material
materialsApi.delete(id)                   // → { success }
materialsApi.attachToDeal(materialId, dealId)
```

---

## Переход на реальный backend

1. Указать API URL в `.env`:
```
VITE_API_URL=http://localhost:3001/api/v1
```

2. Backend репозиторий:
```bash
git clone https://github.com/vladfa2010/equitystream.git
cd equitystream
docker compose up -d   # PostgreSQL
npm install
npm run start:dev      # localhost:3001
```

3. Swagger документация: http://localhost:3001/api/docs

---

## Локальный запуск

```bash
npm install
npm run dev     # localhost:5173
npm run build   # production → dist/
```

---

## License

Private — All rights reserved.
