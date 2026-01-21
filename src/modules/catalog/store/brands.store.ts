import { create } from "zustand";
import type { ProductBrand } from "@/shared/types/models";

/**
 * Brands Store - Tenant product brand management
 *
 * RULES:
 * - Arrays are NEVER optional, always []
 * - Stores are boring on purpose
 */

interface BrandsStoreState {
  // State
  brands: ProductBrand[];

  // Setters
  setBrands: (brands: ProductBrand[]) => void;
  addBrand: (brand: ProductBrand) => void;
  updateBrand: (id: string, updates: Partial<ProductBrand>) => void;
  removeBrand: (id: string) => void;
}

export const useBrandsStore = create<BrandsStoreState>((set) => ({
  // Initial state - arrays always []
  brands: [],

  // Setters
  setBrands: (brands) => set({ brands: brands ?? [] }),

  addBrand: (brand) =>
    set((state) => ({
      brands: [...state.brands, brand],
    })),

  updateBrand: (id, updates) =>
    set((state) => ({
      brands: state.brands.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    })),

  removeBrand: (id) =>
    set((state) => ({
      brands: state.brands.filter((b) => b.id !== id),
    })),
}));
