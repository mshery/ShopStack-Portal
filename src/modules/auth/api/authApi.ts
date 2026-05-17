/**
 * Unified Auth API
 *
 * Uses the new unified /auth/* backend endpoints.
 * Auto-detects user type based on tenantId in response.
 */

import { httpClient } from "@/core/api/httpClient";
import { endpoints } from "@/core/config/endpoints";
import type { ApiResponse } from "@/shared/types/api";

// ============================================
// RESPONSE TYPES (matching backend)
// ============================================

export interface AuthUser {
  id: string;
  tenantId: string | null;
  email: string;
  name: string;
  role: "super_admin" | "owner" | "cashier";
  status: "active" | "inactive" | "suspended";
  avatarUrl: string | null;
  phone: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTenant {
  id: string;
  slug: string;
  companyName: string;
  status: string;
  features: Record<string, boolean>;
  settings: Record<string, unknown>;
  // Tenant limits (from plan)
  maxUsers?: number;
  maxProducts?: number;
  maxOrders?: number;
}

export interface LoginResponse {
  user: AuthUser;
  tenant: AuthTenant | null; // null for platform users
  token: string;
  // refreshToken is now delivered as an httpOnly cookie (ITS-26) and is
  // intentionally absent from the JSON body.
}

export interface RegisterInput {
  companyName: string;
  slug: string;
  planId: string;
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

// ============================================
// AUTH API
// ============================================

export const authApi = {
  /**
   * Login - works for both platform and tenant users
   * Backend auto-detects based on user's tenantId
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await httpClient.post<ApiResponse<LoginResponse>>(
      endpoints.auth.login,
      { email, password },
    );
    return res.data.data;
  },

  /**
   * Register new tenant
   */
  register: async (data: RegisterInput): Promise<LoginResponse> => {
    const res = await httpClient.post<ApiResponse<LoginResponse>>(
      endpoints.auth.register,
      data,
    );
    return res.data.data;
  },

  /**
   * Silent refresh — the refresh token travels as an httpOnly cookie, so
   * we just POST with `withCredentials: true` (configured on the httpClient)
   * and read the new access token from the body.
   */
  refreshToken: async (): Promise<{ token: string }> => {
    const res = await httpClient.post<ApiResponse<{ token: string }>>(
      endpoints.auth.refreshToken,
      {},
    );
    return res.data.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<AuthUser> => {
    const res = await httpClient.get<ApiResponse<AuthUser>>(endpoints.auth.me);
    return res.data.data;
  },

  /**
   * Update profile
   */
  updateProfile: async (data: UpdateProfileInput): Promise<AuthUser> => {
    const res = await httpClient.put<ApiResponse<AuthUser>>(
      endpoints.auth.me,
      data,
    );
    return res.data.data;
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordInput): Promise<void> => {
    await httpClient.put(`${endpoints.auth.me}/change-password`, data);
  },

  /**
   * Logout — tells the backend to revoke the refresh family and clear the
   * httpOnly cookie. Best-effort: a failure here still results in the
   * client clearing its in-memory token.
   */
  logout: async (): Promise<void> => {
    try {
      await httpClient.post(endpoints.auth.logout, {});
    } catch {
      // Network/4xx — proceed with the client-side clear in the caller.
    }
  },
};

export default authApi;
