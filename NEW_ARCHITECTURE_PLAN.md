# ShopStack Portal — Multi-Tenant Architecture Plan

## Executive Summary

This document outlines the architectural refactoring plan for ShopStack Portal, a multi-tenant SaaS platform. The goal is to transform the current structure into a clean, domain-driven modular architecture that scales for large feature sets while maintaining strict tenant isolation.

---

## 1) System Overview

ShopStack Portal is a **multi-tenant Point-of-Sale (POS) and Business Management** platform with three distinct access levels:

| Level | Role | Description |
|-------|------|-------------|
| **Platform** | Super Admin | Manages all tenants, platform settings, billing, activity logs |
| **Tenant** | Owner | Full access to tenant features: products, customers, POS, reports, billing |
| **Tenant** | Cashier | Limited POS access: cart, sales, refunds |

### Multi-Tenancy Model

```
┌──────────────────────────────────────────────────────────────────────┐
│                         PLATFORM LAYER                                │
│  (Super Admin: Tenant Management, Platform Config, Activity Logs)     │
└──────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
            │  TENANT A   │  │  TENANT B   │  │  TENANT C   │
            │ (Store #1)  │  │ (Store #2)  │  │ (Store #3)  │
            └─────────────┘  └─────────────┘  └─────────────┘
                    │               │               │
         ┌──────────┴──────────┐    │    ┌──────────┴──────────┐
         ▼                     ▼    │    ▼                     ▼
    [Products]            [POS]     │  [Customers]         [Reports]
    [Inventory]           [Sales]   │  [Vendors]           [Expenses]
    [Purchases]           [Shifts]  │  [Users]             [Billing]
```

---

## 2) Goals and Guardrails

### Architecture Goals

- **Tenant Isolation**: Each tenant's data is strictly scoped by `tenant_id`
- **Module Independence**: Platform and tenant modules are self-contained
- **Lazy Loading**: Code-split per access level for performance
- **RBAC Integration**: Role-based access control baked into routing/guards
- **Consistent Patterns**: Every screen follows the same hook → vm → page structure

### Non-Goals (Avoid Over-Engineering)

- No micro-frontends
- No module federation (overkill for this size)
- No custom routing abstraction (use React Router directly)

---

## 3) Target Directory Structure

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
│   │   │   └── authApi.ts
│   │   ├── components/            # Auth-specific components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignUpForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── hooks/                 # Auth logic hooks
│   │   │   └── useAuthLogic.ts
│   │   ├── pages/                 # Auth pages
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignUpPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── ResetPasswordPage.tsx
│   │   ├── store/                 # Auth state
│   │   │   └── auth.store.ts
│   │   ├── types/                 # Auth types
│   │   │   └── index.ts
│   │   └── index.ts               # Public API
│   │
│   ├── platform/                  # Platform (Super Admin) module
│   │   ├── api/
│   │   │   ├── tenantsApi.ts
│   │   │   ├── platformSettingsApi.ts
│   │   │   └── activityLogsApi.ts
│   │   ├── components/
│   │   │   ├── TenantCard.tsx
│   │   │   ├── TenantBillingTab.tsx
│   │   │   ├── ImpersonationBanner.tsx
│   │   │   ├── CreateTenantModal.tsx
│   │   │   ├── EditTenantModal.tsx
│   │   │   └── DeleteTenantModal.tsx
│   │   ├── hooks/
│   │   │   ├── usePlatformDashboardLogic.ts
│   │   │   ├── useTenantsListLogic.ts
│   │   │   ├── useTenantDetailLogic.ts
│   │   │   ├── useCreateTenantLogic.ts
│   │   │   └── useEditTenantLogic.ts
│   │   ├── pages/
│   │   │   ├── PlatformDashboardPage.tsx
│   │   │   ├── TenantsListPage.tsx
│   │   │   ├── TenantDetailPage.tsx
│   │   │   ├── CreateTenantPage.tsx
│   │   │   ├── PlatformLogsPage.tsx
│   │   │   └── PlatformSettingsPage.tsx
│   │   ├── store/
│   │   │   ├── tenants.store.ts
│   │   │   ├── platformSettings.store.ts
│   │   │   └── activityLogs.store.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── tenant/                    # Tenant core module (dashboard, settings, users)
│   │   ├── api/
│   │   │   ├── tenantApi.ts
│   │   │   └── usersApi.ts
│   │   ├── components/
│   │   │   ├── TenantDashboardStats.tsx
│   │   │   ├── AddUserModal.tsx
│   │   │   ├── EditUserModal.tsx
│   │   │   └── TenantSettingsForm.tsx
│   │   ├── hooks/
│   │   │   ├── useTenantDashboardLogic.ts
│   │   │   ├── useTenantUsersLogic.ts
│   │   │   └── useTenantSettingsLogic.ts
│   │   ├── pages/
│   │   │   ├── TenantDashboardPage.tsx
│   │   │   ├── TenantUsersPage.tsx
│   │   │   ├── AddTenantUserPage.tsx
│   │   │   ├── TenantSettingsPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── store/
│   │   │   └── users.store.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── products/                  # Products module
│   │   ├── api/
│   │   │   └── productsApi.ts
│   │   ├── components/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductTable.tsx
│   │   │   ├── ProductFilters.tsx
│   │   │   ├── AddProductForm.tsx
│   │   │   └── EditProductModal.tsx
│   │   ├── hooks/
│   │   │   ├── useProductsLogic.ts
│   │   │   ├── useProductDetailsLogic.ts
│   │   │   └── useProductFilters.ts
│   │   ├── pages/
│   │   │   ├── ProductsPage.tsx
│   │   │   ├── ProductDetailsPage.tsx
│   │   │   └── AddProductPage.tsx
│   │   ├── store/
│   │   │   └── products.store.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── catalog/                   # Categories & Brands module
│   │   ├── api/
│   │   │   ├── categoriesApi.ts
│   │   │   └── brandsApi.ts
│   │   ├── components/
│   │   │   ├── CategoryList.tsx
│   │   │   ├── BrandList.tsx
│   │   │   ├── AddCategoryModal.tsx
│   │   │   └── AddBrandModal.tsx
│   │   ├── hooks/
│   │   │   ├── useCategoriesLogic.ts
│   │   │   └── useBrandsLogic.ts
│   │   ├── pages/
│   │   │   ├── CategoriesPage.tsx
│   │   │   └── BrandsPage.tsx
│   │   ├── store/
│   │   │   ├── categories.store.ts
│   │   │   └── brands.store.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── customers/                 # Customers module
│   │   ├── api/
│   │   │   └── customersApi.ts
│   │   ├── components/
│   │   │   ├── CustomerTable.tsx
│   │   │   ├── AddCustomerForm.tsx
│   │   │   └── EditCustomerModal.tsx
│   │   ├── hooks/
│   │   │   └── useCustomersLogic.ts
│   │   ├── pages/
│   │   │   ├── CustomersPage.tsx
│   │   │   └── AddCustomerPage.tsx
│   │   ├── store/
│   │   │   └── customers.store.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── vendors/                   # Vendors module
│   │   ├── api/
│   │   │   └── vendorsApi.ts
│   │   ├── components/
│   │   │   ├── VendorTable.tsx
│   │   │   ├── AddVendorModal.tsx
│   │   │   └── EditVendorModal.tsx
│   │   ├── hooks/
│   │   │   └── useVendorsLogic.ts
│   │   ├── pages/
│   │   │   └── VendorsPage.tsx
│   │   ├── store/
│   │   │   └── vendors.store.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── purchases/                 # Purchases module
│   │   ├── api/
│   │   │   └── purchasesApi.ts
│   │   ├── components/
│   │   │   ├── PurchaseTable.tsx
│   │   │   ├── PurchaseLineItems.tsx
│   │   │   ├── AddPurchaseModal.tsx
│   │   │   └── EditPurchaseModal.tsx
│   │   ├── hooks/
│   │   │   ├── usePurchasesLogic.ts
│   │   │   └── usePurchaseDetailsLogic.ts
│   │   ├── pages/
│   │   │   ├── PurchasesPage.tsx
│   │   │   └── PurchaseDetailsPage.tsx
│   │   ├── store/
│   │   │   └── purchases.store.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── inventory/                 # Inventory management module
│   │   ├── api/
│   │   │   └── inventoryApi.ts
│   │   ├── components/
│   │   │   ├── InventoryTable.tsx
│   │   │   ├── AdjustmentModal.tsx
│   │   │   └── LowStockAlerts.tsx
│   │   ├── hooks/
│   │   │   └── useInventoryLogic.ts
│   │   ├── pages/
│   │   │   └── InventoryPage.tsx
│   │   ├── store/
│   │   │   └── inventory.store.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── expenses/                  # Expenses module
│   │   ├── api/
│   │   │   └── expensesApi.ts
│   │   ├── components/
│   │   │   ├── ExpenseTable.tsx
│   │   │   └── AddExpenseModal.tsx
│   │   ├── hooks/
│   │   │   └── useExpensesLogic.ts
│   │   ├── pages/
│   │   │   └── ExpensesPage.tsx
│   │   ├── store/
│   │   │   └── expenses.store.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── pos/                       # Point of Sale module
│   │   ├── api/
│   │   │   ├── salesApi.ts
│   │   │   ├── shiftsApi.ts
│   │   │   └── refundsApi.ts
│   │   ├── components/
│   │   │   ├── Cart.tsx
│   │   │   ├── CartItem.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductSearch.tsx
│   │   │   ├── PaymentModal.tsx
│   │   │   ├── ReceiptModal.tsx
│   │   │   ├── HeldOrdersList.tsx
│   │   │   ├── DiscountModal.tsx
│   │   │   ├── RefundModal.tsx
│   │   │   └── SalesHistoryTable.tsx
│   │   ├── hooks/
│   │   │   ├── usePOSCartLogic.ts
│   │   │   ├── useSalesHistoryLogic.ts
│   │   │   └── useShiftsLogic.ts
│   │   ├── pages/
│   │   │   ├── CartPage.tsx
│   │   │   └── SalesHistoryPage.tsx
│   │   ├── store/
│   │   │   └── pos.store.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── billing/                   # Billing & Subscription module
│   │   ├── api/
│   │   │   └── billingApi.ts
│   │   ├── components/
│   │   │   ├── BillingOverview.tsx
│   │   │   ├── PlanSelector.tsx
│   │   │   ├── PaymentMethodCard.tsx
│   │   │   ├── InvoiceTable.tsx
│   │   │   └── UpgradeModal.tsx
│   │   ├── hooks/
│   │   │   ├── useBillingLogic.ts
│   │   │   └── useBillingUpgrade.ts
│   │   ├── pages/
│   │   │   └── BillingPage.tsx
│   │   ├── store/
│   │   │   └── billings.store.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   └── reports/                   # Reports & Analytics module
│       ├── api/
│       │   └── reportsApi.ts
│       ├── components/
│       │   ├── SalesChart.tsx
│       │   ├── RevenueChart.tsx
│       │   ├── ExpenseChart.tsx
│       │   ├── TopProductsChart.tsx
│       │   └── DateRangePicker.tsx
│       ├── hooks/
│       │   └── useReportsLogic.ts
│       ├── pages/
│       │   └── ReportsPage.tsx
│       ├── store/
│       │   └── reports.store.ts
│       ├── types/
│       │   └── index.ts
│       └── index.ts
│
├── App.tsx                        # Root component
├── main.tsx                       # Entry point
├── index.css                      # Global styles
└── vite-env.d.ts                  # Vite types
```

---

## 4) Module Boundaries & Import Rules

### Allowed Import Paths

```typescript
// ✅ ALLOWED — Core infrastructure
import { httpClient } from "@/core/api/httpClient";
import { hasPermission } from "@/core/security/permissions";

// ✅ ALLOWED — Shared utilities
import { Button, Modal } from "@/shared/components/ui";
import { formatCurrency } from "@/shared/utils/format";
import type { AsyncStatus } from "@/shared/types/common";

// ✅ ALLOWED — Within same module
import { ProductCard } from "../components/ProductCard";
import { useProductsLogic } from "../hooks/useProductsLogic";

// ✅ ALLOWED — Module public API only
import { useAuthStore } from "@/modules/auth";
```

### Forbidden Import Paths

```typescript
// ❌ FORBIDDEN — Cross-module internal imports
import { ProductCard } from "@/modules/products/components/ProductCard";
import { useCustomersLogic } from "@/modules/customers/hooks/useCustomersLogic";

// ❌ FORBIDDEN — Skipping module public API
import { products } from "@/modules/products/store/products.store";
```

### ESLint Enforcement

```javascript
// eslint.config.js - Import boundary rules
{
  rules: {
    "no-restricted-imports": ["error", {
      patterns: [
        {
          group: ["@/modules/*/components/*", "@/modules/*/hooks/*", "@/modules/*/store/*"],
          message: "Import from module's public API (index.ts) only"
        }
      ]
    }]
  }
}
```

---

## 5) Multi-Tenant Data Flow

### Tenant Context Pattern

All tenant-scoped operations MUST use `activeTenantId` from auth store:

```typescript
// ✅ CORRECT — Tenant-scoped data access
export function useProductsLogic() {
  const { activeTenantId } = useAuthStore();
  const { products } = useProductsStore();
  
  const tenantProducts = useMemo(
    () => products.filter(p => p.tenant_id === activeTenantId),
    [products, activeTenantId]
  );
  
  return { products: tenantProducts };
}
```

```typescript
// ❌ WRONG — Accessing all products without tenant filter
export function useProductsLogic() {
  const { products } = useProductsStore();
  return { products }; // Leaks data from other tenants!
}
```

### Tenant ID Injection Pattern

```
API Call → Include tenant_id → Backend validates tenant ownership → Response
```

```typescript
// productsApi.ts
export async function createProduct(data: CreateProductInput): Promise<Product> {
  const { activeTenantId } = useAuthStore.getState();
  if (!activeTenantId) throw new Error("No active tenant");
  
  return httpClient.post("/products", {
    ...data,
    tenant_id: activeTenantId,
  });
}
```

---

## 6) Screen Hook Pattern (Mandatory)

Every screen follows this exact pattern:

```typescript
// useProductsScreen.ts
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuthStore } from "@/modules/auth";
import { useProductsStore } from "../store/products.store";
import { fetchProducts } from "../api/productsApi";
import type { AsyncStatus } from "@/shared/types/common";

export function useProductsScreen() {
  // 1) Get stores
  const { activeTenantId } = useAuthStore();
  const { products, setProducts, setErrorMessage } = useProductsStore();
  
  // 2) Local state
  const [status, setStatus] = useState<AsyncStatus>("loading");
  
  // 3) Actions (stable references)
  const refresh = useCallback(async () => {
    if (!activeTenantId) return;
    setStatus("loading");
    try {
      const data = await fetchProducts(activeTenantId);
      setProducts(data);
      setStatus(data.length === 0 ? "empty" : "success");
    } catch (e) {
      setErrorMessage(toUserMessage(e));
      setStatus("error");
    }
  }, [activeTenantId, setProducts, setErrorMessage]);
  
  // 4) Effects
  useEffect(() => {
    refresh();
  }, [refresh]);
  
  // 5) View Model (memoized, UI-ready)
  const vm = useMemo(() => ({
    products: products.filter(p => p.tenant_id === activeTenantId),
    canRefresh: status !== "loading",
  }), [products, activeTenantId, status]);
  
  // 6) Actions object (memoized)
  const actions = useMemo(() => ({
    refresh,
  }), [refresh]);
  
  // 7) Return status + vm + actions
  return { status, vm, actions };
}
```

---

## 7) RBAC Integration

### Permission-Based Route Guards

```typescript
// core/routing/guards/TenantGuard.tsx
export function TenantGuard({ 
  children, 
  requiredPermission 
}: { 
  children: ReactNode; 
  requiredPermission: Permission;
}) {
  const { currentUser, userType } = useAuthStore();
  
  if (userType !== "tenant" || !currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  const tenantUser = currentUser as TenantUser;
  if (!hasPermission(tenantUser.role, requiredPermission)) {
    return <AccessDeniedPage />;
  }
  
  return <>{children}</>;
}
```

### Route Configuration

```typescript
// core/routing/router.tsx
const tenantRoutes = [
  {
    path: "/tenant/products",
    element: (
      <TenantGuard requiredPermission="products:view">
        <ProductsPage />
      </TenantGuard>
    ),
  },
  // ...
];
```

---

## 8) Migration Phases

### Phase 1: Foundation (2-3 days)

1. Create `src/core/` structure
   - [ ] `api/httpClient.ts` — centralized HTTP client
   - [ ] `config/env.ts` — environment configuration
   - [ ] `security/rbac.config.ts` — move from `src/config/`
   - [ ] `security/permissions.ts` — permission utilities
   - [ ] `routing/router.tsx` — move from `src/app/`
   - [ ] `routing/guards/` — route protection components
   - [ ] `routing/layouts/` — move from `src/app/layouts/`

2. Create `src/shared/` structure
   - [ ] Move `src/components/ui/` → `src/shared/components/ui/`
   - [ ] Move `src/components/common/` → `src/shared/components/feedback/`
   - [ ] Move `src/components/skeletons/` → `src/shared/components/skeletons/`
   - [ ] Move `src/utils/` → `src/shared/utils/`
   - [ ] Move `src/hooks/useModal.ts` → `src/shared/hooks/`

3. Configure path aliases in `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"],
         "@/core/*": ["./src/core/*"],
         "@/shared/*": ["./src/shared/*"],
         "@/modules/*": ["./src/modules/*"]
       }
     }
   }
   ```

### Phase 2: Auth Module (1 day)

1. Create `src/modules/auth/`
   - [ ] Move `src/pages/auth/` → `src/modules/auth/pages/`
   - [ ] Move `src/stores/auth.store.ts` → `src/modules/auth/store/`
   - [ ] Move `src/logic/useAuthLogic.ts` → `src/modules/auth/hooks/`
   - [ ] Move `src/components/auth/` → `src/modules/auth/components/`
   - [ ] Create `src/modules/auth/types/index.ts`
   - [ ] Create `src/modules/auth/index.ts` (public API)

### Phase 3: Platform Module (1-2 days)

1. Create `src/modules/platform/`
   - [ ] Move `src/pages/platform/` → `src/modules/platform/pages/`
   - [ ] Move `src/stores/tenants.store.ts` → `src/modules/platform/store/`
   - [ ] Move `src/stores/platformSettings.store.ts` → `src/modules/platform/store/`
   - [ ] Move `src/stores/activityLogs.store.ts` → `src/modules/platform/store/`
   - [ ] Move `src/logic/platform/` → `src/modules/platform/hooks/`
   - [ ] Move `src/components/platform/` → `src/modules/platform/components/`
   - [ ] Move `src/components/tenant/DeleteTenantModal.tsx` → platform module
   - [ ] Move `src/components/tenant/EditTenantModal.tsx` → platform module

### Phase 4: Tenant Core Module (1 day)

1. Create `src/modules/tenant/`
   - [ ] Move tenant dashboard, settings, users pages
   - [ ] Move `src/stores/users.store.ts` → `src/modules/tenant/store/`
   - [ ] Move tenant user management logic and components
   - [ ] Create public API

### Phase 5: Domain Modules (3-4 days)

Migrate each domain module in order:

1. **Products Module**
   - [ ] `src/modules/products/` — products, filters, details

2. **Catalog Module**
   - [ ] `src/modules/catalog/` — categories, brands

3. **Customers Module**
   - [ ] `src/modules/customers/` — customer management

4. **Vendors Module**
   - [ ] `src/modules/vendors/` — vendor management

5. **Purchases Module**
   - [ ] `src/modules/purchases/` — purchase orders

6. **Inventory Module**
   - [ ] `src/modules/inventory/` — stock adjustments

7. **Expenses Module**
   - [ ] `src/modules/expenses/` — expense tracking

8. **POS Module**
   - [ ] `src/modules/pos/` — cart, sales, shifts, refunds

9. **Billing Module**
   - [ ] `src/modules/billing/` — subscription, payments, invoices

10. **Reports Module**
    - [ ] `src/modules/reports/` — analytics, charts

### Phase 6: Cleanup (1 day)

- [ ] Remove old directories (`src/pages/`, `src/components/tenant/`, etc.)
- [ ] Update all import paths
- [ ] Run full build verification
- [ ] Update documentation

---

## 9) Module Public API Pattern

Each module exposes a clean public API via `index.ts`:

```typescript
// modules/products/index.ts

// Types
export type { Product, ProductStatus, CreateProductInput } from "./types";

// Store (selective exports)
export { useProductsStore } from "./store/products.store";

// Hooks (for cross-module usage if needed)
export { useProductsLogic } from "./hooks/useProductsLogic";

// Components (only if truly shared)
export { ProductCard } from "./components/ProductCard";
```

---

## 10) Testing Strategy

### Unit Tests

- Test hooks with `@testing-library/react`
- Test stores in isolation
- Mock API calls

### Integration Tests

- Test page → hook → store flow
- Test RBAC guards
- Test tenant isolation

### E2E Tests

- Platform admin flows
- Tenant owner flows
- Cashier POS flows
- Cross-tenant isolation verification

---

## 11) Build & Bundle Strategy

### Code Splitting by Access Level

```typescript
// router.tsx
const platformRoutes = {
  path: "/platform",
  lazy: () => import("@/modules/platform/pages/PlatformLayout"),
  children: [/* ... */],
};

const tenantRoutes = {
  path: "/tenant",
  lazy: () => import("@/modules/tenant/pages/TenantLayout"),
  children: [/* ... */],
};
```

### Expected Chunk Sizes

| Bundle | Target Size |
|--------|-------------|
| Vendor (React, Zustand) | ~150KB |
| Shared Components | ~50KB |
| Auth Module | ~20KB |
| Platform Module | ~40KB |
| Tenant Core | ~30KB |
| POS Module | ~60KB |
| Each Domain Module | ~15-25KB |

---

## 12) Migration Checklist

### Pre-Migration

- [ ] Create new directory structure
- [ ] Configure path aliases
- [ ] Add ESLint import rules

### Per-Module Migration

- [ ] Create module folders
- [ ] Move files to new locations
- [ ] Update imports within module
- [ ] Create public API (index.ts)
- [ ] Update external imports
- [ ] Verify no circular dependencies
- [ ] Run tests
- [ ] Run build

### Post-Migration

- [ ] Remove old directories
- [ ] Full build verification
- [ ] E2E test suite
- [ ] Performance audit (bundle sizes)
- [ ] Update onboarding documentation

---

## 13) Success Criteria

1. **Build passes** with zero errors
2. **All tests pass** (unit, integration, e2e)
3. **No cross-module internal imports** (enforced by ESLint)
4. **Tenant isolation verified** in e2e tests
5. **Bundle sizes** within targets
6. **New developer can understand** module structure in < 30 minutes

---

## 14) Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Pages | `{Domain}{View}Page` | `ProductsPage`, `ProductDetailsPage` |
| Components | `{Domain}{Component}` | `ProductCard`, `ProductFilters` |
| Hooks | `use{Domain}{Thing}Logic` | `useProductsLogic`, `usePOSCartLogic` |
| Stores | `{domain}.store.ts` | `products.store.ts`, `pos.store.ts` |
| APIs | `{domain}Api.ts` | `productsApi.ts`, `salesApi.ts` |
| Types | Singular noun | `Product`, `Sale`, `Customer` |

---

## 15) Quick Reference: File Locations

### "Where do I put...?"

| I need to add... | Location |
|------------------|----------|
| New tenant feature | `src/modules/{feature}/` |
| New platform feature | `src/modules/platform/` |
| New UI primitive | `src/shared/components/ui/` |
| New utility function | `src/shared/utils/` |
| New route guard | `src/core/routing/guards/` |
| New permission | `src/core/security/rbac.config.ts` |
| New environment var | `src/core/config/env.ts` |

---

## Appendix A: Current → New Path Mapping

| Current Path | New Path |
|--------------|----------|
| `src/pages/auth/*` | `src/modules/auth/pages/*` |
| `src/pages/platform/*` | `src/modules/platform/pages/*` |
| `src/pages/tenant/*` | `src/modules/{domain}/pages/*` |
| `src/pages/pos/*` | `src/modules/pos/pages/*` |
| `src/stores/*.store.ts` | `src/modules/{domain}/store/*.store.ts` |
| `src/logic/platform/*` | `src/modules/platform/hooks/*` |
| `src/logic/tenant/*` | `src/modules/{domain}/hooks/*` |
| `src/logic/pos/*` | `src/modules/pos/hooks/*` |
| `src/hooks/use*Screen.ts` | `src/modules/{domain}/hooks/use*Logic.ts` |
| `src/components/ui/*` | `src/shared/components/ui/*` |
| `src/components/common/*` | `src/shared/components/feedback/*` |
| `src/components/skeletons/*` | `src/shared/components/skeletons/*` |
| `src/components/platform/*` | `src/modules/platform/components/*` |
| `src/components/tenant/*` | `src/modules/{domain}/components/*` |
| `src/components/pos/*` | `src/modules/pos/components/*` |
| `src/config/rbac.config.ts` | `src/core/security/rbac.config.ts` |
| `src/app/router.tsx` | `src/core/routing/router.tsx` |
| `src/app/layouts/*` | `src/core/routing/layouts/*` |
| `src/utils/*` | `src/shared/utils/*` |

---

## Appendix B: Store → Module Mapping

| Store | Module |
|-------|--------|
| `auth.store.ts` | `auth` |
| `tenants.store.ts` | `platform` |
| `platformSettings.store.ts` | `platform` |
| `activityLogs.store.ts` | `platform` |
| `users.store.ts` | `tenant` |
| `products.store.ts` | `products` |
| `categories.store.ts` | `catalog` |
| `brands.store.ts` | `catalog` |
| `customers.store.ts` | `customers` |
| `vendors.store.ts` | `vendors` |
| `purchases.store.ts` | `purchases` |
| `inventory.store.ts` | `inventory` |
| `expenses.store.ts` | `expenses` |
| `pos.store.ts` | `pos` |
| `billings.store.ts` | `billing` |
| `audit.store.ts` | `audit` (or merge into `platform`) |
