import { create } from "zustand";
import type { ProductCategory } from "@/types";

/**
 * Categories Store - Tenant product category management
 *
 * RULES:
 * - Arrays are NEVER optional, always []
 * - Stores are boring on purpose
 */

interface CategoriesStoreState {
  // State
  categories: ProductCategory[];

  // Setters
  setCategories: (categories: ProductCategory[]) => void;
  addCategory: (category: ProductCategory) => void;
  updateCategory: (id: string, updates: Partial<ProductCategory>) => void;
  removeCategory: (id: string) => void;
}

export const useCategoriesStore = create<CategoriesStoreState>((set) => ({
  // Initial state - arrays always []
  categories: [],

  // Setters
  setCategories: (categories) => set({ categories: categories ?? [] }),

  addCategory: (category) =>
    set((state) => ({
      categories: [...state.categories, category],
    })),

  updateCategory: (id, updates) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      ),
    })),

  removeCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    })),
}));
