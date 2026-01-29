import { httpClient } from "@/core/api/httpClient";
import { endpoints } from "@/core/config/endpoints";
import type { ApiResponse } from "@/shared/types/api";

// Types matching backend response structure
// These extend/align with existing types in modules/platform/types/index.ts

export interface LoginResponse {
  user: {
    id: string;
    tenantId: null;
    email: string;
    name: string;
    role: "super_admin";
    status: "active" | "inactive";
    avatarUrl: string | null;
    phone: string | null;
    createdAt: string;
    updatedAt: string;
  };
  tenant: null; // Platform users have no tenant
  token: string;
  refreshToken: string;
}

export interface ApiPlatformSettings {
  id: string;
  platformName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  primaryColor: string;
  accentColor: string;
  updatedAt: string;
}

export interface ApiSubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: { name: string; included: boolean }[];
  limits: { maxUsers: number; maxProducts: number; maxOrders: number };
  isPopular: boolean;
  isActive: boolean;
}

export interface ApiTenant {
  id: string;
  slug: string;
  companyName: string;
  status: "active" | "inactive" | "suspended";
  planId: string;
  plan: { id: string; name: string; monthlyPrice: number };
  billing: { status: string; plan: string; monthlyAmount: number };
  _count: { users: number; products: number; sales: number };
  createdAt: string;
}

export interface ApiActivityLog {
  id: string;
  action: string;
  actorId: string;
  targetType: string;
  targetId: string;
  details: Record<string, unknown>;
  createdAt: string;
  actor: { id: string; name: string; email: string; role: string };
}

export interface ApiPlatformUser {
  id: string;
  tenantId: null;
  email: string;
  name: string;
  role: "super_admin";
  status: "active" | "inactive";
  avatarUrl: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Platform API Service
 *
 * All methods return promises - let TanStack Query handle caching/deduplication.
 * Errors are thrown and handled by TanStack Query's error handling.
 *
 * NOTE: Auth endpoints now use unified /auth/* routes
 */
export const platformApi = {
  // ============ AUTH (uses unified /auth/* endpoints) ============
  login: async (email: string, password: string) => {
    const res = await httpClient.post<ApiResponse<LoginResponse>>(
      endpoints.auth.login, // Uses unified /auth/login
      { email, password },
    );
    // Add password field to match PlatformUser type
    return {
      ...res.data.data,
      user: {
        ...res.data.data.user,
        password: "", // API doesn't return password
      },
    };
  },

  getCurrentUser: async () => {
    const res = await httpClient.get<ApiResponse<ApiPlatformUser>>(
      endpoints.auth.me, // Uses unified /auth/me
    );
    return res.data.data;
  },

  updateProfile: async (data: { name?: string; email?: string }) => {
    const res = await httpClient.put<ApiResponse<ApiPlatformUser>>(
      endpoints.auth.me, // Uses unified /auth/me
      data,
    );
    return res.data.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const res = await httpClient.put<ApiResponse<{ message: string }>>(
      `${endpoints.auth.me}/change-password`, // Uses unified /auth/me/change-password
      data,
    );
    return res.data;
  },

  // ============ SETTINGS ============
  getSettings: async () => {
    const res = await httpClient.get<ApiResponse<ApiPlatformSettings>>(
      endpoints.platform.settings,
    );
    return res.data.data;
  },

  updateSettings: async (data: Partial<ApiPlatformSettings>) => {
    const res = await httpClient.put<ApiResponse<ApiPlatformSettings>>(
      endpoints.platform.settings,
      data,
    );
    return res.data.data;
  },

  // ============ PLANS ============
  getPlans: async () => {
    const res = await httpClient.get<ApiResponse<ApiSubscriptionPlan[]>>(
      endpoints.platform.plans.list,
    );
    return res.data.data;
  },

  createPlan: async (data: Omit<ApiSubscriptionPlan, "id">) => {
    const res = await httpClient.post<ApiResponse<ApiSubscriptionPlan>>(
      endpoints.platform.plans.list,
      data,
    );
    return res.data.data;
  },

  updatePlan: async (id: string, data: Partial<ApiSubscriptionPlan>) => {
    const res = await httpClient.put<ApiResponse<ApiSubscriptionPlan>>(
      endpoints.platform.plans.byId(id),
      data,
    );
    return res.data.data;
  },

  deletePlan: async (id: string) => {
    await httpClient.delete(endpoints.platform.plans.byId(id));
  },

  // ============ USERS (uses unified /auth/users) ============
  getUsers: async () => {
    const res = await httpClient.get<ApiResponse<ApiPlatformUser[]>>(
      endpoints.auth.users,
    );
    return res.data.data;
  },

  createUser: async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    const res = await httpClient.post<ApiResponse<ApiPlatformUser>>(
      endpoints.auth.users,
      data,
    );
    return res.data.data;
  },

  updateUser: async (id: string, data: Partial<ApiPlatformUser>) => {
    const res = await httpClient.put<ApiResponse<ApiPlatformUser>>(
      endpoints.auth.userById(id),
      data,
    );
    return res.data.data;
  },

  deleteUser: async (id: string) => {
    await httpClient.delete(endpoints.auth.userById(id));
  },

  // ============ TENANTS ============
  getTenants: async () => {
    const res = await httpClient.get<ApiResponse<ApiTenant[]>>(
      endpoints.platform.tenants.list,
    );
    return res.data.data;
  },

  getTenant: async (id: string) => {
    const res = await httpClient.get<ApiResponse<ApiTenant>>(
      endpoints.platform.tenants.byId(id),
    );
    return res.data.data;
  },

  createTenant: async (data: {
    slug: string;
    companyName: string;
    planId: string;
    ownerEmail: string;
    ownerName: string;
    ownerPassword: string;
  }) => {
    const res = await httpClient.post<ApiResponse<ApiTenant>>(
      endpoints.platform.tenants.list,
      data,
    );
    return res.data.data;
  },

  updateTenant: async (id: string, data: Partial<ApiTenant>) => {
    const res = await httpClient.put<ApiResponse<ApiTenant>>(
      endpoints.platform.tenants.byId(id),
      data,
    );
    return res.data.data;
  },

  suspendTenant: async (id: string) => {
    const res = await httpClient.post<ApiResponse<ApiTenant>>(
      endpoints.platform.tenants.suspend(id),
    );
    return res.data.data;
  },

  impersonateTenant: async (id: string) => {
    const res = await httpClient.post<
      ApiResponse<{
        token: string;
        tenant: { id: string; slug: string; companyName: string };
        user: { id: string; email: string; name: string; role: string };
      }>
    >(endpoints.platform.tenants.impersonate(id));
    return res.data.data;
  },

  // ============ ACTIVITY LOGS ============
  getActivityLogs: async (params?: {
    page?: number;
    limit?: number;
    action?: string;
  }) => {
    const res = await httpClient.get<
      ApiResponse<{
        items: ApiActivityLog[];
        pagination: { page: number; limit: number; total: number };
      }>
    >(endpoints.platform.activityLogs, { params });
    return res.data.data;
  },
};
