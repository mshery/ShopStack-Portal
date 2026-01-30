/**
 * API Endpoints
 *
 * Centralized endpoint configuration for the application.
 * Must match ShopStack-Server routes exactly.
 */

export const endpoints = {
  // ============================================
  // UNIFIED AUTH (works for both platform & tenant)
  // ============================================
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    refreshToken: "/auth/refresh-token",
    me: "/auth/me",
    changePassword: "/auth/me/change-password",
    // User management (context-aware)
    users: "/auth/users",
    userById: (id: string) => `/auth/users/${id}`,
  },

  // ============================================
  // PLATFORM ADMIN ROUTES
  // ============================================
  platform: {
    settings: "/platform/settings",
    activityLogs: "/platform/activity-logs",
    stats: "/platform/stats",
    plans: {
      list: "/platform/plans",
      byId: (id: string) => `/platform/plans/${id}`,
    },
    tenants: {
      list: "/platform/tenants",
      byId: (id: string) => `/platform/tenants/${id}`,
      impersonate: (id: string) => `/platform/tenants/${id}/impersonate`,
      suspend: (id: string) => `/platform/tenants/${id}/suspend`,
      billing: (id: string) => `/platform/tenants/${id}/billing`,
    },
  },

  // ============================================
  // TENANT ROUTES
  // ============================================
  tenant: {
    dashboard: "/tenant/dashboard",
    billing: "/tenant/billing",
    upload: "/tenant/upload",
    // Products
    products: {
      list: "/tenant/products",
      byId: (id: string) => `/tenant/products/${id}`,
      generateSku: "/tenant/products/generate-sku",
    },
    categories: {
      list: "/tenant/categories",
      byId: (id: string) => `/tenant/categories/${id}`,
    },
    brands: {
      list: "/tenant/brands",
      byId: (id: string) => `/tenant/brands/${id}`,
    },
    // Supply chain
    vendors: {
      list: "/tenant/vendors",
      byId: (id: string) => `/tenant/vendors/${id}`,
    },
    purchases: {
      list: "/tenant/purchases",
      byId: (id: string) => `/tenant/purchases/${id}`,
    },
    inventory: {
      list: "/tenant/inventory",
      byId: (id: string) => `/tenant/inventory/${id}`,
    },
    // Customers
    customers: {
      list: "/tenant/customers",
      byId: (id: string) => `/tenant/customers/${id}`,
    },
    // Finance
    expenses: {
      list: "/tenant/expenses",
      byId: (id: string) => `/tenant/expenses/${id}`,
    },
    // POS & Sales
    sales: {
      list: "/tenant/sales",
      byId: (id: string) => `/tenant/sales/${id}`,
    },
    refunds: {
      list: "/tenant/refunds",
      byId: (id: string) => `/tenant/refunds/${id}`,
    },
    receipts: {
      list: "/tenant/receipts",
      byId: (id: string) => `/tenant/receipts/${id}`,
    },
    heldOrders: {
      list: "/tenant/held-orders",
      byId: (id: string) => `/tenant/held-orders/${id}`,
    },
  },
} as const;
