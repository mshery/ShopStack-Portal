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
  addAdjustment: (
    adjustment: Omit<InventoryAdjustment, "createdAt" | "updatedAt">,
  ) => void;
}

export const useInventoryStore = create<InventoryStoreState>((set) => ({
  // Initial state
  inventoryAdjustments: [],

  // Setters
  setInventoryAdjustments: (adjustments) =>
    set({ inventoryAdjustments: adjustments ?? [] }),

  addAdjustment: (adjustment) => {
    set((state) => ({
      inventoryAdjustments: [
        ...state.inventoryAdjustments,
        {
          ...adjustment,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as InventoryAdjustment,
      ],
    }));
  },
}));
