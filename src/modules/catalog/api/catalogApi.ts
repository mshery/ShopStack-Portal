/**
 * Catalog API (Categories & Brands)
 *
 * API client for category and brand management.
 */

import { httpClient } from "@/core/api/httpClient";
import { endpoints } from "@/core/config/endpoints";
import type { ApiResponse } from "@/shared/types/api";

// ============================================
// TYPES
// ============================================

export interface Category {
  id: string;
  tenantId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface Brand {
  id: string;
  tenantId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

// ============================================
// API
// ============================================

export const catalogApi = {
  // ========== Categories ==========

  getCategories: async (): Promise<Category[]> => {
    const res = await httpClient.get<ApiResponse<Category[]>>(
      endpoints.tenant.categories.list,
    );
    return res.data.data;
  },

  getCategory: async (id: string): Promise<Category> => {
    const res = await httpClient.get<ApiResponse<Category>>(
      endpoints.tenant.categories.byId(id),
    );
    return res.data.data;
  },

  createCategory: async (name: string): Promise<Category> => {
    const res = await httpClient.post<ApiResponse<Category>>(
      endpoints.tenant.categories.list,
      { name },
    );
    return res.data.data;
  },

  updateCategory: async (id: string, name: string): Promise<Category> => {
    const res = await httpClient.put<ApiResponse<Category>>(
      endpoints.tenant.categories.byId(id),
      { name },
    );
    return res.data.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await httpClient.delete(endpoints.tenant.categories.byId(id));
  },

  // ========== Brands ==========

  getBrands: async (): Promise<Brand[]> => {
    const res = await httpClient.get<ApiResponse<Brand[]>>(
      endpoints.tenant.brands.list,
    );
    return res.data.data;
  },

  getBrand: async (id: string): Promise<Brand> => {
    const res = await httpClient.get<ApiResponse<Brand>>(
      endpoints.tenant.brands.byId(id),
    );
    return res.data.data;
  },

  createBrand: async (name: string): Promise<Brand> => {
    const res = await httpClient.post<ApiResponse<Brand>>(
      endpoints.tenant.brands.list,
      { name },
    );
    return res.data.data;
  },

  updateBrand: async (id: string, name: string): Promise<Brand> => {
    const res = await httpClient.put<ApiResponse<Brand>>(
      endpoints.tenant.brands.byId(id),
      { name },
    );
    return res.data.data;
  },

  deleteBrand: async (id: string): Promise<void> => {
    await httpClient.delete(endpoints.tenant.brands.byId(id));
  },
};

export default catalogApi;
