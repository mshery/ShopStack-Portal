/**
 * Purchases API
 *
 * API client for purchase order management.
 */

import { httpClient } from "@/core/api/httpClient";
import { endpoints } from "@/core/config/endpoints";
import type { ApiResponse } from "@/shared/types/api";
import type { Purchase, PurchaseLineItem } from "@/shared/types/models";

// ============================================
// TYPES
// ============================================

export interface CreatePurchaseItemInput {
  productId: string;
  quantity: number;
  costPrice: number;
}

export interface CreatePurchaseInput {
  vendorId: string;
  items: CreatePurchaseItemInput[];
  notes?: string;
}

export interface PurchaseFilters {
  page?: number;
  limit?: number;
  status?: string;
  vendorId?: string;
}

export interface PurchaseListResponse {
  items: Purchase[];
  total: number;
}

export interface PurchaseItemDetail extends PurchaseLineItem {
  product: {
    id: string;
    name: string;
    sku: string;
    currentStock: number;
    imageUrl?: string;
  };
}

// ============================================
// API
// ============================================

export const purchasesApi = {
  // List purchases with pagination and filtering
  getPurchases: async (
    params?: PurchaseFilters,
  ): Promise<PurchaseListResponse> => {
    const res = await httpClient.get<ApiResponse<PurchaseListResponse>>(
      endpoints.tenant.purchases.list,
      { params },
    );
    return res.data.data;
  },

  // Get single purchase by ID
  getPurchase: async (id: string): Promise<Purchase> => {
    const res = await httpClient.get<ApiResponse<Purchase>>(
      endpoints.tenant.purchases.byId(id),
    );
    return res.data.data;
  },

  // Get purchase items
  getPurchaseItems: async (id: string): Promise<PurchaseItemDetail[]> => {
    const res = await httpClient.get<ApiResponse<PurchaseItemDetail[]>>(
      `${endpoints.tenant.purchases.byId(id)}/items`,
    );
    return res.data.data;
  },

  // Create new purchase order
  createPurchase: async (data: CreatePurchaseInput): Promise<Purchase> => {
    const res = await httpClient.post<ApiResponse<Purchase>>(
      endpoints.tenant.purchases.list,
      data,
    );
    return res.data.data;
  },

  // Workflow: Mark as Ordered
  markAsOrdered: async (id: string): Promise<Purchase> => {
    const res = await httpClient.post<ApiResponse<Purchase>>(
      endpoints.tenant.purchases.markAsOrdered(id),
    );
    return res.data.data;
  },

  // Workflow: Receive Purchase
  receivePurchase: async (
    id: string,
    data?: { receivedDate?: string },
  ): Promise<Purchase> => {
    const res = await httpClient.post<ApiResponse<Purchase>>(
      endpoints.tenant.purchases.receive(id),
      data,
    );
    return res.data.data;
  },

  // Workflow: Cancel Purchase
  cancelPurchase: async (id: string): Promise<Purchase> => {
    const res = await httpClient.post<ApiResponse<Purchase>>(
      endpoints.tenant.purchases.cancel(id),
    );
    return res.data.data;
  },
};

export default purchasesApi;
