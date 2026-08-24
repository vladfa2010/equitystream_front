# EquityStream — Authentication & Authorization

## Overview

Full-stack auth system with PostgreSQL backend, JWT tokens, bcrypt password hashing, admin approval workflow, and role-based access control (RBAC).

---

## Auth Flows

### 1. Login
```
User enters email + password
    → POST /api/auth/login
    → Backend validates credentials (bcrypt compare)
    → If !isVerified → redirect to /pending
    → If isVerified → JWT token + user data
    → Frontend stores token in localStorage
    → Redirect to /dashboard
```

### 2. Registration
```
User enters email + username + password (min 8 chars)
    → POST /api/auth/register
    → Backend hashes password (bcrypt cost 12)
    → Creates user with isVerified = false, isAdmin = false
    → Returns JWT token
    → Frontend stores token, redirects to /pending
    → User sees: "Thank you for registering. Your application is under review."
```

### 3. Admin Approval
```
New user appears in Admin → Users with filter "Pending"
    → Admin clicks Approve (shield icon)
    → POST /api/admin/users/:id/approve
    → Backend sets isVerified = true
    → User can now login and access platform
```

### 4. Password Recovery
```
User clicks "Forgot password?"
    → POST /api/auth/forgot-password (sends 6-digit code)
    → Backend stores hashed code with 15 min TTL, max 5 attempts
    → User enters 6-digit code
    → POST /api/auth/verify-code
    → Returns resetToken
    → User sets new password (min 8 chars)
    → POST /api/auth/reset-password
```

### 5. Admin User Management
```
Admin navigates to /admin/users
    → GET /api/admin/users?filter=active|blocked|pending|admin
    → Actions per user:
        - Approve (pending users only)
        - Toggle Admin role
        - Block / Unblock
        - Reset Password (force new password)
        - Delete (cannot delete self or other admins)
```

---

## Roles & Permissions

| Role | Route Access | Capabilities |
|------|-------------|--------------|
| **user** (unverified) | /pending only | View approval screen, sign out |
| **user** (verified) | /dashboard, /deals/*, /market | Portfolio, deals, marketplace |
| **admin** | /admin/* + all client routes | Full platform access + user management |

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/login` | `{email, password}` | `{token, user}` |
| POST | `/register` | `{email, username, password}` | `{token, user}` |
| GET | `/me` | — | `{user}` |
| POST | `/forgot-password` | `{email}` | `{message}` |
| POST | `/verify-code` | `{email, code}` | `{resetToken}` |
| POST | `/reset-password` | `{resetToken, newPassword}` | `{message}` |

### Admin (`/api/admin`)
All endpoints require `Authorization: Bearer <token>` + `isAdmin = true`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users?filter=&page=&limit=` | List users with pagination |
| GET | `/users/:id` | User detail + activity + logins |
| POST | `/users/:id/toggle-admin` | Toggle admin role |
| POST | `/users/:id/toggle-block` | Block/unblock user |
| POST | `/users/:id/approve` | **Set isVerified = true** |
| POST | `/users/:id/reset-password` | Force password reset |
| DELETE | `/users/:id` | Delete user (self-protected) |

---

## Frontend Auth Components

| Component | Path | Purpose |
|-----------|------|---------|
| `AuthContext.tsx` | `src/context/` | JWT management, login/register/logout, user state |
| `LoginPage.tsx` | `src/pages/` | 5-mode: login / register / forgot / code / reset |
| `PendingApprovalPage.tsx` | `src/pages/` | Unverified user waiting screen |
| `AdminUsersList.tsx` | `src/pages/admin/` | Full user management table |

---

## Security

- **bcrypt** with cost factor 12 for password hashing
- **JWT HS256** with `es_jwt_secret_2025_change_in_production`
- **Rate limiting** on auth endpoints (5 requests / 15 min window)
- **helmet** headers on backend
- **CORS** whitelist: `https://159-194-206-229.sslip.io`
- **Audit logging**: all login attempts recorded in `user_logins` and `activity_log`
- **Password recovery**: 6-digit codes, 15 min TTL, max 5 attempts, hashed storage
