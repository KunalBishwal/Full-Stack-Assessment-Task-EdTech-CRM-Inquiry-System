# Full-Stack Assessment Task: EdTech CRM & Inquiry System (K12 Hunar)

[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-12%2F12%20Passing-brightgreen)]()
[![Frontend Tests](https://img.shields.io/badge/Frontend%20Tests-4%2F4%20Passing-brightgreen)]()
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?logo=supabase&logoColor=white)]()
[![Auth](https://img.shields.io/badge/Auth-Custom%20JWT%20(bcrypt)-blue)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript&logoColor=white)]()

A complete, production-ready full-stack CRM inquiry management system built for **K12 Hunar**, strictly compliant with all assessment guidelines.

---

## 1. Assessment Objectives & Implementation

### 1. Objective
A clean full-stack CRM inquiry system where anyone can submit a public inquiry form with category and user-type dropdown filters, and an admin can log in to view, search, filter, paginate, and manage inquiries.

### 2. Tech Stack & Architecture
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, React Hook Form, Zod.
- **Backend**: Node.js, Express, TypeScript, Layered architecture (Controllers, Services, Repositories, Validators, Middleware).
- **Database**: **Supabase (PostgreSQL)** via standard PostgreSQL connection strings and the native `pg` driver (no Prisma/Sequelize overhead, direct connection pool with SSL handling).
- **Authentication**: **Custom JWT-based authentication implemented from scratch** using `bcrypt` and `jsonwebtoken` with protected Express middleware. **Supabase Auth is strictly avoided**, adhering 100% to assessment instructions.

### 3. Core Features Implemented

#### A. Public Inquiry Form (`/`)
- Clean, responsive landing page accessible without authentication.
- **User Type (Dropdown)**: `Parent`, `Student`, `School` (with default placeholder and validation).
- **Category (Dropdown)**: `Scholarship`, `Concert`, `Admission`, `General Query` (with default placeholder and validation).
- **Personal Details**: `Full Name`, `Email Address`, `Phone Number` (with E.164/international regex validation).
- **Message / Query**: Multi-line text area with length counter.
- **Real-Time Validation**: Both client-side (Zod + React Hook Form) and server-side (Zod Express middleware).
- Submitting the form saves data directly into the **Supabase PostgreSQL** `inquiries` table and displays a confirmation card.

#### B. Admin Authentication & Dashboard (`/admin/login` & `/admin/dashboard`)
- **Custom JWT Authentication**:
  - Passwords hashed using `bcrypt` (12 salt rounds).
  - Signed JWT tokens containing admin ID, email, role, and issuer (`k12-hunar-crm`).
  - Protected Express middleware [`requireAdminAuth`](file:///backend/src/middleware/auth.middleware.ts) validates Bearer tokens.
- **Session Management**:
  - JWT stored securely in `sessionStorage` on login.
  - Automatic session expiration: a `401 Unauthorized` triggers token clearing and clean redirect to `/admin/login`.
- **Tabular View**:
  - Columns: **Name**, **Phone**, **Email**, **User Type**, **Category**, **Date**, and **Status**.
  - Status badges with distinct visual styling: `New`, `Contacted`, `In Progress`, `Resolved`.
  - Quick inline status change dropdowns and a slide-over modal drawer for inspecting full message text and updating status.
  - Live summary counter cards (Total Inquiries, New, Contacted, In Progress, Resolved).

#### C. Mandatory Filters & Search
- **Filter by Category**: Dropdown for `Scholarship`, `Concert`, `Admission`, `General Query`, or `All Categories`.
- **Filter by User Type**: Dropdown for `Parent`, `Student`, `School`, or `All User Types`.
- **Filter by Status**: Dropdown for `New`, `Contacted`, `In Progress`, `Resolved`, or `All Statuses`.
- **Search Bar**: Debounced instant search on **Name** or **Phone number**, executed server-side with parameterized SQL `ILIKE` queries to prevent SQL injection.
- **Chronological Pagination**: Server-side page navigation with configurable limits (default 10 per page).

---

## 2. Candidate Deliverables Checklist

| Deliverable | Repository Path / Reference | Status |
|---|---|---|
| **GitHub Repository** | Clean monorepo containing both `frontend/` and `backend/` directories | ✅ Complete |
| **Database Schema (schema.sql)** | [`database/schema.sql`](./database/schema.sql) with DDL for `admins`, `inquiries`, enums, trigger, and indexes | ✅ Complete |
| **Environment Sample File** | [`.env.example`](./.env.example), [`backend/.env.example`](./backend/.env.example), [`frontend/.env.example`](./frontend/.env.example) | ✅ Complete |
| **Setup & JWT Auth Instructions** | Detailed step-by-step local setup, admin provisioning, and testing guide below | ✅ Complete |
| **Deployment Configuration** | [`backend/render.yaml`](./backend/render.yaml) (Render) & [`frontend/vercel.json`](./frontend/vercel.json) (Vercel) | ✅ Complete |

---

## 3. Project Directory Structure

```text
k12-hunar/
├── .env.example                  # Root environment variable documentation
├── README.md                     # Assessment documentation and setup guide
├── .gitignore                    # Git ignore file (prevents committing secrets/builds)
├── database/
│   └── schema.sql                # Complete PostgreSQL DDL (enums, tables, triggers, indexes)
├── frontend/                     # React 18 + Vite + TypeScript + Tailwind CSS
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── vercel.json               # SPA routing rewrite rule for Vercel
│   ├── .env.example
│   ├── tests/
│   │   └── frontend.test.mjs     # Frontend contract and validation test suite
│   └── src/
│       ├── components/           # InquiryForm, Navbar, Footer, StatusBadge, Modal, etc.
│       ├── pages/                # LandingPage, AdminLoginPage, AdminDashboardPage
│       ├── hooks/                # useAuth, useDebounce
│       ├── services/             # Axios API client, authService, inquiryService
│       ├── styles/               # CSS variables and Tailwind imports
│       ├── types/                # TypeScript interfaces and union types
│       ├── App.tsx               # Client routes and ProtectedRoute wrapper
│       ├── main.tsx              # React DOM render entry
│       └── vite-env.d.ts         # Vite client type definitions
└── backend/                      # Node.js + Express + TypeScript
    ├── package.json
    ├── tsconfig.json
    ├── render.yaml               # Render Web Service blueprint
    ├── .env.example
    ├── tests/
    │   └── backend.test.mjs      # 12 Integration tests (queries live Supabase DB)
    └── src/
        ├── app.ts                # Express app factory (helmet, cors, routes, error handlers)
        ├── index.ts              # Server startup and graceful shutdown
        ├── config/
        │   ├── database.ts       # pg Pool configuration with Supabase SSL handling
        │   └── env.ts            # Zod-validated environment variables
        ├── controllers/
        │   ├── auth.controller.ts
        │   └── inquiry.controller.ts
        ├── middleware/
        │   ├── auth.middleware.ts    # requireAdminAuth Bearer token verifier
        │   ├── error.middleware.ts   # Centralized error handler
        │   ├── rateLimit.middleware.ts
        │   └── validate.middleware.ts# Zod request validation middleware
        ├── repositories/
        │   ├── admin.repository.ts   # Parameterized SQL for admins table
        │   └── inquiry.repository.ts # Parameterized SQL for inquiries table
        ├── routes/
        │   ├── auth.routes.ts        # POST /login, GET /me
        │   ├── inquiry.routes.ts     # POST /, GET /, GET /:id, PATCH /:id/status
        │   └── index.ts              # GET /health, router mount
        ├── scripts/
        │   ├── migrate.ts            # Automated runner for database/schema.sql
        │   └── provision-admin.ts    # CLI admin creation with bcrypt
        ├── services/
        │   ├── auth.service.ts       # bcrypt compare & jsonwebtoken sign/verify
        │   └── inquiry.service.ts
        ├── types/                    # DB records, JWT payloads, pagination types
        └── validators/
            ├── auth.validator.ts
            └── inquiry.validator.ts
```

---

## 4. Database Schema (`database/schema.sql`)

The schema uses PostgreSQL extensions, custom ENUMs, automatic updated timestamps, and query optimization indexes:

- **`admins` table**:
  - `id`: UUID (Primary Key, `gen_random_uuid()`)
  - `email`: VARCHAR(255) (Unique, indexed with `LOWER(email)`)
  - `password_hash`: TEXT (Bcrypt hash)
  - `created_at`: TIMESTAMPTZ (Default `NOW()`)
  - `last_login_at`: TIMESTAMPTZ (Updated on successful login)
- **`inquiries` table**:
  - `id`: UUID (Primary Key, `gen_random_uuid()`)
  - `name`: VARCHAR(150) NOT NULL
  - `email`: VARCHAR(255) NOT NULL
  - `phone`: VARCHAR(30) NOT NULL
  - `user_type`: VARCHAR(30) CHECK (`Parent`, `Student`, `School`)
  - `category`: VARCHAR(40) CHECK (`Scholarship`, `Concert`, `Admission`, `General Query`)
  - `message`: TEXT NOT NULL
  - `status`: VARCHAR(30) DEFAULT `'New'` CHECK (`New`, `Contacted`, `In Progress`, `Resolved`)
  - `created_at`: TIMESTAMPTZ DEFAULT `NOW()`
  - `updated_at`: TIMESTAMPTZ DEFAULT `NOW()` (Maintained automatically by trigger `trg_inquiries_updated_at`)
- **Indexes**:
  - `idx_inquiries_created_at` on `created_at DESC` (Chronological pagination)
  - `idx_inquiries_status` on `status` (Status filter & breakdown counts)
  - `idx_inquiries_category` on `category` (Category filter)
  - `idx_inquiries_user_type` on `user_type` (User type filter)
  - `idx_inquiries_name_lower` on `LOWER(name)` (ILIKE search optimization)
  - `idx_inquiries_phone` on `phone` (Phone search optimization)

---

## 5. Local Setup & Execution Guide

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase account (or local PostgreSQL instance)

### Step 1: Clone Repository
```bash
git clone https://github.com/KunalBishwal/Full-Stack-Assessment-Task-EdTech-CRM-Inquiry-System..git
cd Full-Stack-Assessment-Task-EdTech-CRM-Inquiry-System.
```

### Step 2: Configure Environment Variables

**Backend (`backend/.env`)**:
```env
PORT=4000
NODE_ENV=development

# Supabase PostgreSQL Connection String (Transaction or Session Pooler / Direct URI)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require"
DATABASE_SSL=true

# Custom JWT Authentication Configuration
JWT_SECRET="replace-with-a-secure-64-char-random-hex-secret-in-production"
JWT_EXPIRES_IN="12h"
BCRYPT_SALT_ROUNDS=12

# Allowed CORS Origins
CORS_ORIGIN="http://localhost:5173,http://127.0.0.1:5173"

# Admin Provisioning Script Defaults
INITIAL_ADMIN_EMAIL="admin@k12hunar.edu.in"
INITIAL_ADMIN_PASSWORD="HunarAdmin#2026"
```

**Frontend (`frontend/.env`)**:
```env
# Points to Express Backend API
VITE_API_BASE_URL="http://localhost:4000/api"
```

### Step 3: Backend Setup, Migration, and Admin Provisioning
```bash
cd backend
npm install

# 1. Apply schema directly to Supabase PostgreSQL
npm run db:migrate

# 2. Provision the initial administrator account (hashes password with bcrypt)
npm run provision:admin -- admin@k12hunar.edu.in "HunarAdmin#2026"

# 3. Start Express backend in development mode
npm run dev
# Backend running at http://localhost:4000/api
```

### Step 4: Frontend Setup & Launch
Open a new terminal window:
```bash
cd frontend
npm install

# Start Vite dev server
npm run dev
# Frontend running at http://localhost:5173
```

---

## 6. How to Test Custom JWT Authentication & API Endpoints

### Option A: Run the Automated Test Suite (Recommended)

1. **Backend Integration Tests (12/12 Passing)**:
   ```bash
   cd backend
   npm test
   ```
   *Executes against the live Supabase PostgreSQL database, verifying:*
   - Direct database pool connectivity
   - Public inquiry submission (`POST /api/inquiries`)
   - 400 Bad Request validation handling on malformed payload
   - 401 Unauthorized on unauthenticated admin routes
   - 401 Unauthorized on malformed/forged JWT
   - 401 Unauthorized on invalid admin credentials
   - 200 OK + JWT issuance on valid credentials
   - Authenticated profile verification (`GET /api/auth/me`)
   - Inquiries list with status summary counts (`GET /api/inquiries`)
   - Multi-filtering by Category, User Type, and Name/Phone search
   - Persistent status update (`PATCH /api/inquiries/:id/status`)

2. **Frontend Contract Tests (4/4 Passing)**:
   ```bash
   cd frontend
   npm test
   ```
   *Verifies Zod client validation schemas and session storage token handling.*

### Option B: Manual API Testing with `curl`

1. **Submit a public inquiry** (No authentication required):
   ```bash
   curl -X POST http://localhost:4000/api/inquiries \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Priya Sharma",
       "email": "priya.sharma@example.com",
       "phone": "+91 98765 43210",
       "user_type": "Parent",
       "category": "Scholarship",
       "message": "Inquiring about merit scholarship application details for Grade 9."
     }'
   ```

2. **Verify unauthenticated request is blocked (401 Unauthorized)**:
   ```bash
   curl -i http://localhost:4000/api/inquiries
   ```

3. **Authenticate via Custom JWT login**:
   ```bash
   curl -X POST http://localhost:4000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@k12hunar.edu.in", "password": "HunarAdmin#2026"}'
   ```
   *Response includes `token` (JWT) and `admin` object.*

4. **Access protected inquiries with Bearer Token**:
   ```bash
   curl -H "Authorization: Bearer <TOKEN>" \
     "http://localhost:4000/api/inquiries?category=Scholarship&user_type=Parent&search=Priya&page=1&limit=10"
   ```

5. **Update inquiry status persistently**:
   ```bash
   curl -X PATCH http://localhost:4000/api/inquiries/<INQUIRY_UUID>/status \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"status": "Contacted"}'
   ```

---

## 7. Default Admin Credentials

For evaluation and testing:
- **Admin Portal**: `http://localhost:5173/admin/login`
- **Email**: `admin@k12hunar.edu.in`
- **Password**: `HunarAdmin#2026`

---

## 8. Deployment Guide

### Backend on Render
1. Create a new **Web Service** pointing to this repository.
2. Root Directory: `backend`
3. Build Command: `npm install && npm run build`
4. Start Command: `npm run start`
5. Configure Environment Variables:
   - `PORT`: `4000`
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: Supabase connection URI
   - `DATABASE_SSL`: `true`
   - `JWT_SECRET`: 64-character random hex string
   - `CORS_ORIGIN`: Your production Vercel frontend URL
6. Run `npm run provision:admin` once in the Render shell to seed the admin user.

### Frontend on Vercel
1. Import repository on Vercel with Root Directory set to `frontend`.
2. Framework Preset: `Vite`.
3. Build Command: `npm run build`, Output Directory: `dist`.
4. Set Environment Variable: `VITE_API_BASE_URL` = `https://<YOUR-RENDER-BACKEND>.onrender.com/api`.
5. Deploy. [`vercel.json`](./frontend/vercel.json) routes all SPA URLs (`/admin/dashboard`, `/admin/login`) cleanly.
