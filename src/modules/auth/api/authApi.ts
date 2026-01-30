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
  refreshToken: string;
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
   * Refresh access token
   */
  refreshToken: async (
    refreshToken: string,
  ): Promise<{ token: string; refreshToken: string }> => {
    const res = await httpClient.post<
      ApiResponse<{ token: string; refreshToken: string }>
    >(endpoints.auth.refreshToken, { refreshToken });
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
   * Logout - clears tokens (handled client-side, no API call needed)
   */
  logout: async (): Promise<void> => {
    // No API call needed, just return
    return Promise.resolve();
  },
};

export default authApi;
