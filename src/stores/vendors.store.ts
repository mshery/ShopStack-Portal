import { create } from "zustand";
import type { Vendor } from "@/types";
import { generateId } from "@/utils/normalize";

/**
 * Vendors Store - Vendor Management
 */

interface VendorsStoreState {
  // State
  vendors: Vendor[];

  // Setters
  setVendors: (vendors: Vendor[]) => void;
  addVendor: (vendor: Omit<Vendor, "id" | "createdAt" | "updatedAt">) => string;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  removeVendor: (id: string) => void;
}

export const useVendorsStore = create<VendorsStoreState>((set) => ({
  // Initial state
  vendors: [],

  // Setters
  setVendors: (vendors) => set({ vendors: vendors ?? [] }),

  addVendor: (vendorData) => {
    const vendorId = generateId("vendor");
    const newVendor: Vendor = {
      ...vendorData,
      id: vendorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      vendors: [...state.vendors, newVendor],
    }));
    return vendorId;
  },

  updateVendor: (id, updates) =>
    set((state) => ({
      vendors: state.vendors.map((v) =>
        v.id === id
          ? { ...v, ...updates, updatedAt: new Date().toISOString() }
          : v,
      ),
    })),

  removeVendor: (id) =>
    set((state) => ({
      vendors: state.vendors.filter((v) => v.id !== id),
    })),
}));
