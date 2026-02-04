/**
 * Customers API
 *
 * API client for customer management.
 */

import { httpClient } from "@/core/api/httpClient";
import { endpoints } from "@/core/config/endpoints";
import type { ApiResponse } from "@/shared/types/api";
import type { Customer, Sale } from "@/shared/types/models";

// ============================================
// TYPES
// ============================================

export interface CreateCustomerInput {
  name: string;
  email?: string;
  phone?: string;
}

export interface UpdateCustomerInput {
  name?: string;
  email?: string;
  phone?: string;
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CustomerListResponse {
  items: Customer[];
  total: number;
}

export interface CustomerDetail extends Customer {
  sales: Partial<Sale>[];
  totalSpent: number;
  _count?: {
    sales: number;
  };
}

export interface PurchaseHistoryResponse {
  items: Sale[];
  total: number;
}

// ============================================
// API
// ============================================

export const customersApi = {
  // List customers with pagination and search
  getCustomers: async (
    params?: CustomerFilters,
  ): Promise<CustomerListResponse> => {
    // Backend returns nested pagination object
    const res = await httpClient.get<
      ApiResponse<{ items: Customer[]; pagination: { total: number } }>
    >(endpoints.tenant.customers.list, { params });
    // Flatten response to match CustomerListResponse
    return {
      items: res.data.data.items,
      total: res.data.data.pagination.total,
    };
  },

  // Get single customer by ID
  getCustomer: async (id: string): Promise<CustomerDetail> => {
    const res = await httpClient.get<ApiResponse<CustomerDetail>>(
      endpoints.tenant.customers.byId(id),
    );
    return res.data.data;
  },

  // Create new customer
  createCustomer: async (data: CreateCustomerInput): Promise<Customer> => {
    const res = await httpClient.post<ApiResponse<Customer>>(
      endpoints.tenant.customers.list,
      data,
    );
    return res.data.data;
  },

  // Update existing customer
  updateCustomer: async (
    id: string,
    data: UpdateCustomerInput,
  ): Promise<Customer> => {
    const res = await httpClient.put<ApiResponse<Customer>>(
      endpoints.tenant.customers.byId(id),
      data,
    );
    return res.data.data;
  },

  // Delete customer
  deleteCustomer: async (id: string): Promise<void> => {
    await httpClient.delete(endpoints.tenant.customers.byId(id));
  },

  // Get customer purchase history
  getPurchaseHistory: async (
    id: string,
    params?: { page?: number; limit?: number },
  ): Promise<PurchaseHistoryResponse> => {
    const res = await httpClient.get<
      ApiResponse<{ items: Sale[]; pagination: { total: number } }>
    >(endpoints.tenant.customers.purchases(id), { params });
    return {
      items: res.data.data.items,
      total: res.data.data.pagination.total,
    };
  },
};

export default customersApi;
