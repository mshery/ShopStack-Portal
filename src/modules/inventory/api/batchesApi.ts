/**
 * Batches API
 *
 * API client for batch and expiry tracking.
 */

import { httpClient } from "@/core/api/httpClient";
import { endpoints } from "@/core/config/endpoints";
import type { ApiResponse } from "@/shared/types/api";

// ============================================
// TYPES
// ============================================

export interface ProductBatch {
  id: string;
  tenantId: string;
  productId: string;
  batchNumber: string;
  quantity: number;
  costPrice: string;
  expiryDate: string | null;
  receivedDate: string;
  purchaseId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product?: { id: string; name: string; sku: string };
  purchase?: { id: string; purchaseNumber: string };
}

export interface BatchSelection {
  batch: ProductBatch;
  quantityFromBatch: number;
}

export interface CreateBatchInput {
  productId: string;
  batchNumber?: string;
  quantity: number;
  costPrice: number;
  expiryDate?: string;
  receivedDate?: string;
  purchaseId?: string;
}

export interface UpdateBatchInput {
  quantity?: number;
  expiryDate?: string;
  isActive?: boolean;
}

// ============================================
// API
// ============================================

export const batchesApi = {
  // Get batches expiring within N days
  getExpiringBatches: async (days: number = 7): Promise<ProductBatch[]> => {
    const res = await httpClient.get<ApiResponse<ProductBatch[]>>(
      endpoints.tenant.batches.expiring,
      { params: { days } },
    );
    return res.data.data;
  },

  // Get expired batches
  getExpiredBatches: async (): Promise<ProductBatch[]> => {
    const res = await httpClient.get<ApiResponse<ProductBatch[]>>(
      endpoints.tenant.batches.expired,
    );
    return res.data.data;
  },

  // Get batch by ID
  getBatchById: async (id: string): Promise<ProductBatch> => {
    const res = await httpClient.get<ApiResponse<ProductBatch>>(
      endpoints.tenant.batches.byId(id),
    );
    return res.data.data;
  },

  // Get batches for a product
  getProductBatches: async (
    productId: string,
    activeOnly: boolean = true,
  ): Promise<{ items: ProductBatch[]; total: number }> => {
    const res = await httpClient.get<
      ApiResponse<{ items: ProductBatch[]; total: number }>
    >(endpoints.tenant.batches.byProduct(productId), {
      params: { activeOnly },
    });
    return res.data.data;
  },

  // Select batches for sale using FIFO
  selectBatchesForSale: async (
    productId: string,
    quantity: number,
  ): Promise<BatchSelection[]> => {
    const res = await httpClient.post<ApiResponse<BatchSelection[]>>(
      endpoints.tenant.batches.selectForSale,
      { productId, quantity },
    );
    return res.data.data;
  },

  // Create a new batch
  createBatch: async (data: CreateBatchInput): Promise<ProductBatch> => {
    const res = await httpClient.post<ApiResponse<ProductBatch>>(
      endpoints.tenant.batches.list,
      data,
    );
    return res.data.data;
  },

  // Update a batch
  updateBatch: async (
    id: string,
    data: UpdateBatchInput,
  ): Promise<ProductBatch> => {
    const res = await httpClient.put<ApiResponse<ProductBatch>>(
      endpoints.tenant.batches.byId(id),
      data,
    );
    return res.data.data;
  },
};

export default batchesApi;
