/**
 * Products API
 *
 * API client for product management with pagination and filters.
 */

import { httpClient } from "@/core/api/httpClient";
import { endpoints } from "@/core/config/endpoints";
import type { ApiResponse, PaginatedResponse } from "@/shared/types/api";

// ============================================
// TYPES
// ============================================

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  status?: "in_stock" | "low_stock" | "out_of_stock";
  vendorId?: string;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  sku: string;
  unitPrice: string;
  costPrice: string;
  vendorId: string | null;
  categoryId: string | null;
  brandId: string | null;
  currentStock: number;
  minimumStock: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  imageUrl: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string } | null;
  brand?: { id: string; name: string } | null;
  vendor?: { id: string; name: string } | null;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  unitPrice: number;
  costPrice: number;
  categoryId?: string;
  brandId?: string;
  vendorId?: string;
  currentStock?: number;
  minimumStock?: number;
  description?: string;
  imageUrl?: string;
}

export interface UpdateProductInput {
  name?: string;
  sku?: string;
  unitPrice?: number;
  costPrice?: number;
  categoryId?: string | null;
  brandId?: string | null;
  vendorId?: string | null;
  currentStock?: number;
  minimumStock?: number;
  description?: string;
  imageUrl?: string | null;
  status?: "in_stock" | "low_stock" | "out_of_stock";
}

// ============================================
// API
// ============================================

export const productsApi = {
  getProducts: async (
    params?: ProductFilters,
  ): Promise<PaginatedResponse<Product>> => {
    const res = await httpClient.get<ApiResponse<PaginatedResponse<Product>>>(
      endpoints.tenant.products.list,
      { params },
    );
    return res.data.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const res = await httpClient.get<ApiResponse<Product>>(
      endpoints.tenant.products.byId(id),
    );
    return res.data.data;
  },

  createProduct: async (data: CreateProductInput): Promise<Product> => {
    const res = await httpClient.post<ApiResponse<Product>>(
      endpoints.tenant.products.list,
      data,
    );
    return res.data.data;
  },

  updateProduct: async (
    id: string,
    data: UpdateProductInput,
  ): Promise<Product> => {
    const res = await httpClient.put<ApiResponse<Product>>(
      endpoints.tenant.products.byId(id),
      data,
    );
    return res.data.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await httpClient.delete(endpoints.tenant.products.byId(id));
  },

  generateSku: async (): Promise<string> => {
    const res = await httpClient.get<ApiResponse<{ sku: string }>>(
      endpoints.tenant.products.generateSku,
    );
    return res.data.data.sku;
  },

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await httpClient.post<ApiResponse<{ url: string }>>(
      "/tenant/upload/product",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return res.data.data.url;
  },
};

export default productsApi;
