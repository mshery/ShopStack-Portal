import { httpClient } from "@/core/api/httpClient";
import { endpoints } from "@/core/config/endpoints";
import type { ApiResponse, PaginatedResponse } from "@/shared/types/api";
import type { InventoryAdjustment } from "@/shared/types/models";

export interface InventoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateAdjustmentInput {
  productId: string;
  reason: string;
  quantityChange: number;
  costImpact: number;
  notes?: string;
}

export const inventoryApi = {
  // Inventory is managed via Adjustments and Expenses in this system
  // There isn't a single "Inventory Item" table besides Products

  // Logs/Adjustments
  getAdjustments: async (
    params?: InventoryFilters,
  ): Promise<PaginatedResponse<InventoryAdjustment>> => {
    const res = await httpClient.get<
      ApiResponse<PaginatedResponse<InventoryAdjustment>>
    >(endpoints.tenant.inventory.adjustments, { params });
    return res.data.data;
  },

  createAdjustment: async (
    data: CreateAdjustmentInput,
  ): Promise<InventoryAdjustment> => {
    const res = await httpClient.post<ApiResponse<InventoryAdjustment>>(
      endpoints.tenant.inventory.adjustments,
      data,
    );
    return res.data.data;
  },
};
