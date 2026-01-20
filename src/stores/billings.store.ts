import { create } from "zustand";
import type { TenantBilling, BillingInvoice } from "@/types";

/**
 * Billings Store - Platform-level billing management
 *
 * RULES:
 * - Arrays are NEVER optional, always []
 * - Stores are boring on purpose
 */

interface BillingsStoreState {
  // State
  billings: TenantBilling[];
  invoices: BillingInvoice[];

  // Setters
  setBillings: (billings: TenantBilling[]) => void;
  setInvoices: (invoices: BillingInvoice[]) => void;
  updateBilling: (id: string, updates: Partial<TenantBilling>) => void;
}

export const useBillingsStore = create<BillingsStoreState>((set) => ({
  // Initial state - arrays always []
  billings: [],
  invoices: [],

  // Setters
  setBillings: (billings) => set({ billings: billings ?? [] }),
  setInvoices: (invoices) => set({ invoices: invoices ?? [] }),

  updateBilling: (id, updates) =>
    set((state) => ({
      billings: state.billings.map((b) =>
        b.id === id
          ? { ...b, ...updates, updatedAt: new Date().toISOString() }
          : b,
      ),
    })),
}));
