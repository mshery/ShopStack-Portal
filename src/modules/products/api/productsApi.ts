/**
 * Products API
 *
 * API client for product management with pagination and filters.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpClient } from "@/core/api/httpClient";
import { endpoints } from "@/core/config/endpoints";
import type { ApiResponse, PaginatedResponse } from "@/shared/types/api";
import type { Product } from "@/shared/types/models";

export type { Product };

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
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "name" | "price_asc" | "price_desc" | "stock" | "newest";
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
  productType?: "unit" | "weighted";
  minSaleWeight?: number;
  weightIncrement?: number;
  unitOfMeasureId?: string;
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
  productType?: "unit" | "weighted";
  minSaleWeight?: number;
  weightIncrement?: number;
  unitOfMeasureId?: string;
}

// ============================================
// API
// ============================================

// Helper to transform API product to application model
const transformProduct = (data: any): Product => {
  return {
    ...data,
    unitPrice: Number(data.unitPrice),
    costPrice: Number(data.costPrice),
    currentStock: Number(data.currentStock),
    minimumStock: Number(data.minimumStock),
    productType: data.productType || data.product_type || "unit",
    minSaleWeight: data.minSaleWeight ? Number(data.minSaleWeight) : undefined,
    weightIncrement: data.weightIncrement
      ? Number(data.weightIncrement)
      : undefined,
    // Ensure tenant_id is present (API might return tenantId)
    tenant_id: data.tenant_id || data.tenantId,
  };
};

export const productsApi = {
  getProducts: async (
    params?: ProductFilters,
  ): Promise<PaginatedResponse<Product>> => {
    const res = await httpClient.get<ApiResponse<PaginatedResponse<any>>>(
      endpoints.tenant.products.list,
      { params },
    );
    return {
      ...res.data.data,
      items: res.data.data.items.map(transformProduct),
    };
  },

  getProduct: async (id: string): Promise<Product> => {
    const res = await httpClient.get<ApiResponse<any>>(
      endpoints.tenant.products.byId(id),
    );
    return transformProduct(res.data.data);
  },

  createProduct: async (data: CreateProductInput): Promise<Product> => {
    const res = await httpClient.post<ApiResponse<any>>(
      endpoints.tenant.products.list,
      data,
    );
    return transformProduct(res.data.data);
  },

  updateProduct: async (
    id: string,
    data: UpdateProductInput,
  ): Promise<Product> => {
    const res = await httpClient.put<ApiResponse<any>>(
      endpoints.tenant.products.byId(id),
      data,
    );
    return transformProduct(res.data.data);
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
