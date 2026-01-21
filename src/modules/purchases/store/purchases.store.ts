import { create } from "zustand";
import type { Purchase, PurchaseStatus } from "@/shared/types/models";
import { generateId } from "@/shared/utils/normalize";

/**
 * Purchases Store - Purchase Order Management
 */

interface PurchasesStoreState {
  // State
  purchases: Purchase[];

  // Setters
  setPurchases: (purchases: Purchase[]) => void;
  addPurchase: (
    purchase: Omit<
      Purchase,
      "id" | "purchaseNumber" | "createdAt" | "updatedAt"
    >,
  ) => string;
  updatePurchase: (id: string, updates: Partial<Purchase>) => void;
  updatePurchaseStatus: (
    id: string,
    status: PurchaseStatus,
    receivedDate?: string,
  ) => void;
  cancelPurchase: (id: string) => void;
  removePurchase: (id: string) => void;
}

export const usePurchasesStore = create<PurchasesStoreState>((set) => ({
  // Initial state
  purchases: [],

  // Setters
  setPurchases: (purchases) => set({ purchases: purchases ?? [] }),

  addPurchase: (purchaseData) => {
    const purchaseId = generateId("purchase");
    const purchaseNumber = `PO-${Date.now().toString().slice(-6)}`;
    const newPurchase: Purchase = {
      ...purchaseData,
      id: purchaseId,
      purchaseNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      purchases: [...state.purchases, newPurchase],
    }));
    return purchaseId;
  },

  updatePurchase: (id, updates) =>
    set((state) => ({
      purchases: state.purchases.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p,
      ),
    })),

  updatePurchaseStatus: (id, status, receivedDate) =>
    set((state) => ({
      purchases: state.purchases.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              receivedDate:
                status === "received"
                  ? receivedDate || new Date().toISOString()
                  : p.receivedDate,
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    })),

  cancelPurchase: (id) =>
    set((state) => ({
      purchases: state.purchases.map((p) =>
        p.id === id ? { ...p, status: "cancelled" as PurchaseStatus } : p,
      ),
    })),

  removePurchase: (id) =>
    set((state) => ({
      purchases: state.purchases.filter((p) => p.id !== id),
    })),
}));
