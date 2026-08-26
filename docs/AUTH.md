# EquityStream — Authentication & Authorization

## Overview

Full-stack auth system with PostgreSQL backend, JWT tokens, bcrypt password hashing (cost 12), admin approval workflow, and role-based access control (RBAC).

All auth endpoints use the backend prefix `/api/v1/auth`. The frontend service `src/api/services/authApi.ts` wraps these calls and normalizes `isVerified` from `user.status === 'active'`.

---

## Auth Flows

### 1. Login
```
User enters email + password
    → POST /api/v1/auth/login
    → Backend validates credentials (bcrypt compare)
    → If user.status === 'pending' → 401 "Account is pending admin approval."
    → If user.status === 'inactive' → 401
    → If user.status === 'active' → JWT token + user data
    → Frontend stores token in localStorage (key: es_auth_token)
    → AuthContext normalizes user: isVerified = status === 'active'
    → Redirect to /dashboard (client) or /admin (admin)
```

### 2. Registration
```
User enters email + name + password (min 8 chars)
    → POST /api/v1/auth/register  (no auth required)
    → Backend hashes password (bcrypt cost 12)
    → Creates user with role='client', status='pending'
    → Returns user object WITHOUT accessToken
    → Frontend shows PendingApprovalPage
    → User sees: "Thank you for registering. Your application is under review."
```

> Public registration always creates a pending client. Admins cannot be created through this endpoint.

### 3. Admin Approval
```
New user appears in Admin → All Clients with status='pending'
    → Admin opens client card / All Clients list
    → PATCH /api/v1/users/clients/:id { status: 'active' }
    → Backend sets status='active'
    → User can now login and access platform
```

### 4. Password Management

#### Admin resets password (email)
```
Admin → client card → Reset Password
    → POST /api/v1/users/:id/reset-password
    → Backend generates random password, saves hash, emails via Resend
    → Response: { userId, emailSent, emailError? }
```

#### Admin sets password manually
```
Admin → client card → Set Password
    → POST /api/v1/users/:id/set-password { newPassword }
    → Backend saves hash
    → Response: { userId, newPassword }
    → Admin copies password and sends it to client outside the system
```

#### User changes own password
```
Client → Profile → Change Password
    → POST /api/v1/auth/change-password { currentPassword, newPassword }
    → Backend verifies current password and saves new hash
```

> There is no public "Forgot password" self-service flow in the current implementation.

---

## Roles & Permissions

| Role | Status | Route Access | Capabilities |
|------|--------|--------------|--------------|
| **client** | pending | /pending only | View approval screen, sign out |
| **client** | active | /dashboard, /deals/*, /market | Portfolio, deals, marketplace |
| **admin** | active | /admin/* + all client routes | Full platform access + user management |

---

## API Endpoints

### Auth (`/api/v1/auth`)
| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| POST | `/login` | `{email, password}` | `{accessToken, user}` | No |
| POST | `/register` | `{email, name, password, role?}` | `{accessToken?, user}` | No |
| GET | `/me` | — | `{user}` | Yes |
| POST | `/change-password` | `{currentPassword, newPassword}` | `{message}` | Yes |

### Users / Admin (`/api/v1/users`)
All endpoints require `Authorization: Bearer <token>` + `role='admin'` unless noted.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/clients?status=pending` | List clients filtered by status |
| GET | `/users/clients/:id` | Client detail |
| PATCH | `/users/clients/:id` | Update client / approve pending registration |
| DELETE | `/users/clients/:id` | Deactivate client (status='inactive') |
| POST | `/users/:id/reset-password` | Reset password and email it |
| POST | `/users/:id/set-password` | Set password manually |
| DELETE | `/users/:id` | Hard delete user |

---

## Frontend Auth Components

| Component | Path | Purpose |
|-----------|------|---------|
| `AuthContext.tsx` | `src/context/` | JWT management, login/register/logout, user state, `isVerified` flag |
| `authApi.ts` | `src/api/services/` | Real backend auth API client |
| `auth.ts` | `src/api/services/` | Legacy mock auth service (not used in production build) |
| `LoginPage.tsx` | `src/pages/` | 5-mode auth form with WebThreads background + GlassSurface card + ShinyText logo |
| `PendingApprovalPage.tsx` | `src/pages/` | Unverified user waiting screen |
| `AdminAllClientsPage.tsx` / `ClientCardPage.tsx` | `src/pages/admin/` | User management, approve / deactivate / reset password / set password |

---

## Login Page Design

### Background — WebThreads
- **WebGL GLSL shader** via `ogl` library
- 4 animated threads with gold color palette (`#B8A14E` → `#C9B25F` → `#F5F5F0`)
- Mouse interaction: threads react to cursor movement
- Shimmer effect for liveliness
- Grain overlay for cinematic texture

### Card — GlassSurface
- **SVG displacement map** glass effect with chromatic aberration
- `borderWidth={0.01}`, `blur={1}` — subtle edge glow
- `displace={0.5}`, `distortionScale={-180}` — soft refraction
- `mixBlendMode="difference"` — RGB-split at edges
- Fallback for Safari/Firefox: standard glassmorphism (`backdrop-filter: blur(20px)`)

### Tabs (Plashki)
Two pill-shaped tabs at the top of the card:
- **Sign In** / **Register** — toggle between login and registration modes
- Active tab: gold background (`rgba(184, 161, 78, 0.12)`), gold text, gold border
- Inactive tab: transparent, muted text (`#55555E`)
- Smooth transition between modes via `AnimatePresence` + `framer-motion`

### Logo — ShinyText
- Animated shimmer effect on "EQUITYSTREAM" text
- Gold gradient (`#B8A14E`) with white shine (`#F5F5F0`)
- Speed: 4 cycles per second

### Input Fields
- Background: `rgba(255, 255, 255, 0.03)`
- Border: `1px solid rgba(255, 255, 255, 0.06)`
- Focus: gold border + gold glow shadow
- Icons (Mail, Lock, User) from Lucide React

### Primary Button
- Gradient: `#B8A14E` → `#C9B25F`
- Text: `#0A0A0F` (dark)
- Hover: brightness(1.1) + gold shadow
- Loading state: animated spinner

---

## Security

- **bcrypt** with cost factor 12 for password hashing
- **JWT HS256** with server-side secret
- **Rate limiting** on auth endpoints (5 requests / 15 min window) — planned via backend
- **helmet** headers on backend
- **CORS** whitelist: `https://159-194-206-229.sslip.io`
- **Audit logging**: all login attempts recorded in `user_logins` and `activity_log`
- **Pending approval gate**: new registrations cannot log in until admin sets `status='active'`
