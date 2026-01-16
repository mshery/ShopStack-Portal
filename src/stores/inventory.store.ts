import { create } from "zustand";
import type { InventoryAdjustment } from "@/types";

/**
 * Inventory Store - Stock adjustment tracking
 * Follows ANTIGRAVITY RULES: Boring store - only state and setters
 */

interface InventoryStoreState {
  // State
  inventoryAdjustments: InventoryAdjustment[];

  // Setters
  setInventoryAdjustments: (adjustments: InventoryAdjustment[]) => void;
  addAdjustment: (adjustment: InventoryAdjustment) => void;
}

export const useInventoryStore = create<InventoryStoreState>((set) => ({
  // Initial state
  inventoryAdjustments: [],

  // Setters
  setInventoryAdjustments: (adjustments) =>
    set({ inventoryAdjustments: adjustments ?? [] }),

  addAdjustment: (adjustment) => {
    set((state) => ({
      inventoryAdjustments: [...state.inventoryAdjustments, adjustment],
    }));
  },
}));
