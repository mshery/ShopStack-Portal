# ShopStack Portal

ShopStack Portal is a modern, world-class **multi-tenant Point-of-Sale (POS) and Business Management** platform built for performance, reliability, and scale.

## 🚀 Tech Stack

- **Framework:** React 19 (Vite)
- **Language:** TypeScript (Strict Mode)
- **State Management:** **Zustand** (Boring stores, reactive UI)
- **Styling:** Tailwind CSS 4 + Shadcn/UI (Radix Primitives)
- **Animations:** Framer Motion (Motion)
- **Forms:** React Hook Form + Zod
- **Data Table:** TanStack Table
- **Infrastructure:** clean, domain-driven modular architecture

## 📁 Project Structure

This project follows a **domain-driven modular architecture** designed for strict tenant isolation and high developer velocity:

```
src/
├── core/                          # Cross-cutting app infrastructure
│   ├── api/                       # HTTP client, interceptors, error handling
│   │   ├── httpClient.ts          # Base fetch/axios wrapper
│   │   └── interceptors.ts        # Auth token injection, error mapping
│   ├── config/                    # Environment, feature flags
│   │   ├── env.ts                 # Environment variables
│   │   └── features.ts            # Feature flag helpers
│   ├── routing/                   # App-level routing
│   │   ├── router.tsx             # Root router config
│   │   ├── guards/                # Route guards
│   │   │   ├── AuthGuard.tsx      # Authentication check
│   │   │   ├── PlatformGuard.tsx  # Platform access check
│   │   │   └── TenantGuard.tsx    # Tenant + RBAC check
│   │   └── layouts/               # Layout shells
│   │       ├── AuthLayout.tsx     # Login/signup layout
│   │       ├── PlatformLayout.tsx # Platform admin layout
│   │       └── TenantLayout.tsx   # Tenant app layout
│   ├── security/                  # Auth & RBAC
│   │   ├── rbac.config.ts         # Role → Permission mappings
│   │   ├── permissions.ts         # Permission check utilities
│   │   └── tenantContext.ts       # Active tenant context
│   └── providers/                 # App-level providers
│       └── AppProviders.tsx       # Toast, Theme, Query providers
│
├── shared/                        # Reusable UI + utilities (domain-agnostic)
│   ├── components/                # Generic UI components
│   │   ├── ui/                    # Primitives (Button, Input, Modal, Select)
│   │   ├── feedback/              # Toast, Alert, EmptyState, ErrorState
│   │   ├── data-display/          # Table, DataGrid, Card, Badge
│   │   └── skeletons/             # Loading skeletons
│   ├── hooks/                     # Generic hooks
│   │   ├── useDebounce.ts
│   │   ├── useModal.ts
│   │   └── usePagination.ts
│   ├── utils/                     # Pure utility functions
│   │   ├── format.ts              # Date, number, currency formatters
│   │   ├── normalize.ts           # Data normalization helpers
│   │   ├── validate.ts            # Validation utilities
│   │   └── cn.ts                  # Tailwind class merger
│   └── types/                     # Shared type definitions
│       ├── common.ts              # AsyncStatus, Pagination, etc.
│       └── ui.ts                  # UI component prop types
│
├── modules/                       # Feature modules (domain-based)
│   │
│   ├── auth/                      # Authentication module
│   │   ├── api/                   # Auth API calls
│   │   ├── components/            # Auth-specific components
│   │   ├── hooks/                 # Auth logic hooks
│   │   ├── store/                 # Auth state
│   │   └── index.ts               # Public API
│   │
│   ├── platform/                  # Platform (Super Admin) module
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/
│   │   └── index.ts
│   │
│   ├── tenant/                    # Tenant core module (dashboard, settings, users)
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/
│   │   └── index.ts
│   │
│   ├── products/                  # Products module
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/
│   │   └── index.ts
│   │
│   ├── pos/                       # Point of Sale module
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/
│   │   └── index.ts
│   │
│   └── reports/                   # Reports & Analytics module
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── store/
│       └── index.ts
│
├── App.tsx                        # Root component
├── main.tsx                       # Entry point
├── index.css                      # Global styles
└── vite-env.d.ts                  # Vite types
```

### Module Rules
- **Modules cannot import from other modules' internals.**
- **Always import via the module's Public API (`index.ts`).**
- **Strict Tenant Isolation:** Data fetching must always be scoped by `activeTenantId`.

## 🏗️ Architectural Patterns

### 1. Screen Hook Pattern (The Brain)
Every screen is orchestrated by exactly one logic hook that produces three outputs:
- **status:** `loading | error | empty | success`
- **vm (View Model):** Derived, UI-ready data (memoized)
- **actions:** Stable callback functions for user interactions

### 2. Multi-Tenant Guarding
The system uses `TenantGuard` and `PlatformGuard` to ensure that users only access data and features they are authorized for. Permissions are managed via a robust **RBAC (Role-Based Access Control)** system.

### 3. Null-Safety & Normalization
- **All external data is considered hostile.**
- Data is normalized at the API boundary.
- UI components are pure and dumb—they never handle null checks or business logic.

## 📏 Coding Standards

To maintain "world-class" quality, all developers must adhere to the following:
- **Zero "any":** TypeScript strict mode is mandatory.
- **Stable Actions:** All actions passed to UI components must be memoized with `useCallback`.
- **UI Placeholders:** Every async screen must implement Loading, Empty, and Error states.
- **Design System:** Use pre-defined tokens and variables from the CSS-first design system.

For a detailed breakdown of our coding rules, please see [CODING_STYLE.md](./CODING_STYLE.md) and [NEW_ARCHITECTURE_PLAN.md](./NEW_ARCHITECTURE_PLAN.md).

## 🛠️ Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Setup Environment:**
   Create `.env.local` based on `.env.example`.
3. **Start development server:**
   ```bash
   npm run dev
   ```

### Environment Variables
Vite loads environment variables from:
- `.env.development` (when running `npm run dev`)
- `.env.production` (when running `npm run build`)
- `.env.local` (ignored by git)

## 📝 Summary for Dev Team

- **UI renders, hooks decide.** Do not put logic in components.
- **Normalize early.** Protect the UI from backend inconsistency.
- **Memoize intentionally.** Stability over micro-optimization.
- **Fail safe.** Always provide a fallback UI for edge cases.
