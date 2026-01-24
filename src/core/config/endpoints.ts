/**
 * API Endpoints
 *
 * Centralized endpoint configuration for the application.
 */

export const endpoints = {
  // Authentication
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    refreshToken: "/auth/refresh-token",
    me: "/auth/me",
  },

  // Tenant / Shop Management
  tenant: {
    profile: "/tenant/profile",
    settings: "/tenant/settings",
  },

  // Core Modules (Placeholders for future implementation)
  products: {
    list: "/products",
    byId: (id: string) => `/products/${id}`,
  },

  orders: {
    list: "/orders",
    byId: (id: string) => `/orders/${id}`,
  },

  customers: {
    list: "/customers",
    byId: (id: string) => `/customers/${id}`,
  },
} as const;
