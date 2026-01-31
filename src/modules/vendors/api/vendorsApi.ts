/**
 * Vendors API
 *
 * API client for vendor management.
 */

import { httpClient } from "@/core/api/httpClient";
import { endpoints } from "@/core/config/endpoints";
import type { ApiResponse } from "@/shared/types/api";
import type { Vendor } from "@/shared/types/models";

// ============================================
// TYPES
// ============================================

export interface CreateVendorInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  paymentTerms?: string;
}

export interface UpdateVendorInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  paymentTerms?: string;
}

// ============================================
// API
// ============================================

export const vendorsApi = {
  getVendors: async (): Promise<Vendor[]> => {
    const res = await httpClient.get<ApiResponse<Vendor[]>>(
      endpoints.tenant.vendors.list,
    );
    return res.data.data;
  },

  getVendor: async (id: string): Promise<Vendor> => {
    const res = await httpClient.get<ApiResponse<Vendor>>(
      endpoints.tenant.vendors.byId(id),
    );
    return res.data.data;
  },

  createVendor: async (data: CreateVendorInput): Promise<Vendor> => {
    const res = await httpClient.post<ApiResponse<Vendor>>(
      endpoints.tenant.vendors.list,
      data,
    );
    return res.data.data;
  },

  updateVendor: async (
    id: string,
    data: UpdateVendorInput,
  ): Promise<Vendor> => {
    const res = await httpClient.put<ApiResponse<Vendor>>(
      endpoints.tenant.vendors.byId(id),
      data,
    );
    return res.data.data;
  },

  deleteVendor: async (id: string): Promise<void> => {
    await httpClient.delete(endpoints.tenant.vendors.byId(id));
  },
};

export default vendorsApi;
