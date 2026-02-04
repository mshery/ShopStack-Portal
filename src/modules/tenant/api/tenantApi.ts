/**
 * Tenant Self-Service API
 *
 * APIs for tenant team management and billing.
 * Auth/profile APIs are in @/modules/auth/api/authApi.ts
 */

import { httpClient } from "@/core/api/httpClient";
import { endpoints } from "@/core/config/endpoints";
import type { ApiResponse } from "@/shared/types/api";

// ============================================
// RESPONSE TYPES
// ============================================

export interface TeamMember {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: "owner" | "cashier";
  status: "active" | "inactive" | "suspended";
  phone: string | null;
  avatarUrl: string | null;
  createdBy: "platform" | "tenant" | "self";
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamMemberInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UpdateTeamMemberInput {
  name?: string;
  email?: string;
  status?: "active" | "inactive" | "suspended";
  phone?: string;
  role?: "owner" | "cashier";
}

// Billing types
export interface TenantBilling {
  id: string;
  tenantId: string;
  plan: {
    id: string;
    name: string;
    slug: string;
    monthlyPrice: number;
    yearlyPrice: number;
    features: unknown[]; // Using unknown[] for simplicity or define PlanFeature
    limits: {
      maxUsers: number;
      maxProducts: number;
      maxOrders: number;
    };
  };
  status: "active" | "trial" | "past_due" | "cancelled";
  monthlyAmount: number;
  billingCycle: "monthly" | "yearly";
  nextBillingDate: string | null;
  lastPaymentDate: string | null;
  lastPaymentAmount: number | null;
  trialEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  planName: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "refunded";
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
}

export interface InvoicesResponse {
  items: Invoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaymentMethod {
  id: string;
  tenantId: string;
  type: "card" | "paypal";
  brand: string | null;
  last4: string | null;
  expiryMonth: number | null;
  expiryYear: number | null;
  email: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface AddPaymentMethodInput {
  type: "card" | "paypal";
  brand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  email?: string;
  isDefault?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const ITEMS_PER_PAGE = 10;

// ============================================
// TEAM MANAGEMENT API
// ============================================

export interface DashboardStats {
  today: {
    salesCount: number;
    revenue: number;
  };
  month: {
    salesCount: number;
    revenue: number;
    expenses: number;
    profit: number;
  };
  inventory: {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalValue: number;
  };
  customers: {
    total: number;
  };
  recentSales: {
    id: string;
    number: string;
    customer: string;
    grandTotal: number;
    itemCount: number;
    createdAt: string;
  }[];
  topProducts: {
    productId: string;
    name: string;
    quantitySold: number;
  }[];
  salesBreakdown: {
    label: string;
    value: number;
    color: string;
  }[];
  monthlySales: {
    month: string;
    revenue: number;
    orders: number;
  }[];
}

export const tenantApi = {
  // ========== Dashboard ==========

  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await httpClient.get<ApiResponse<DashboardStats>>(
      endpoints.tenant.dashboard,
    );
    return res.data.data;
  },

  // ========== Team Members ==========

  /**
   * Get all team members for current tenant (paginated)
   */
  getTeamMembers: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<TeamMember>> => {
    const res = await httpClient.get<
      ApiResponse<PaginatedResponse<TeamMember>>
    >(endpoints.auth.users, {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? ITEMS_PER_PAGE,
      },
    });
    return res.data.data;
  },

  /**
   * Get team member by ID
   */
  getTeamMember: async (id: string): Promise<TeamMember> => {
    const res = await httpClient.get<ApiResponse<TeamMember>>(
      endpoints.auth.userById(id),
    );
    return res.data.data;
  },

  /**
   * Create new team member (cashier only)
   */
  createTeamMember: async (
    data: CreateTeamMemberInput,
  ): Promise<TeamMember> => {
    const res = await httpClient.post<ApiResponse<TeamMember>>(
      endpoints.auth.users,
      data,
    );
    return res.data.data;
  },

  /**
   * Update team member (cannot modify owner)
   */
  updateTeamMember: async (
    id: string,
    data: UpdateTeamMemberInput,
  ): Promise<TeamMember> => {
    const res = await httpClient.put<ApiResponse<TeamMember>>(
      endpoints.auth.userById(id),
      data,
    );
    return res.data.data;
  },

  /**
   * Delete team member (cannot delete owner or self)
   */
  deleteTeamMember: async (id: string): Promise<void> => {
    await httpClient.delete(endpoints.auth.userById(id));
  },

  // ========== Billing ==========

  /**
   * Get billing info for current tenant
   */
  getBilling: async (): Promise<TenantBilling> => {
    const res = await httpClient.get<ApiResponse<TenantBilling>>(
      endpoints.tenant.billing,
    );
    return res.data.data;
  },

  /**
   * Update billing cycle
   */
  updateBillingCycle: async (
    billingCycle: "monthly" | "yearly",
  ): Promise<TenantBilling> => {
    const res = await httpClient.put<ApiResponse<TenantBilling>>(
      `${endpoints.tenant.billing}/cycle`,
      { billingCycle },
    );
    return res.data.data;
  },

  // ========== Invoices ==========

  /**
   * Get invoices with pagination
   */
  getInvoices: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<InvoicesResponse> => {
    const res = await httpClient.get<ApiResponse<InvoicesResponse>>(
      `${endpoints.tenant.billing}/invoices`,
      { params },
    );
    return res.data.data;
  },

  /**
   * Get invoice by ID
   */
  getInvoice: async (id: string): Promise<Invoice> => {
    const res = await httpClient.get<ApiResponse<Invoice>>(
      `${endpoints.tenant.billing}/invoices/${id}`,
    );
    return res.data.data;
  },

  // ========== Payment Methods ==========

  /**
   * Get payment methods
   */
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const res = await httpClient.get<ApiResponse<PaymentMethod[]>>(
      `${endpoints.tenant.billing}/payment-methods`,
    );
    return res.data.data;
  },

  /**
   * Add payment method
   */
  addPaymentMethod: async (
    data: AddPaymentMethodInput,
  ): Promise<PaymentMethod> => {
    const res = await httpClient.post<ApiResponse<PaymentMethod>>(
      `${endpoints.tenant.billing}/payment-methods`,
      data,
    );
    return res.data.data;
  },

  /**
   * Set default payment method
   */
  setDefaultPaymentMethod: async (id: string): Promise<PaymentMethod> => {
    const res = await httpClient.put<ApiResponse<PaymentMethod>>(
      `${endpoints.tenant.billing}/payment-methods/${id}/default`,
    );
    return res.data.data;
  },

  /**
   * Delete payment method
   */
  deletePaymentMethod: async (id: string): Promise<void> => {
    await httpClient.delete(
      `${endpoints.tenant.billing}/payment-methods/${id}`,
    );
  },
};

export default tenantApi;
