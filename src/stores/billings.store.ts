import { create } from "zustand";
import type {
  TenantBilling,
  BillingInvoice,
  SubscriptionPlan,
  BillingPaymentMethod,
  TenantPlan,
} from "@/types";

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
  subscriptionPlans: SubscriptionPlan[];
  paymentMethods: BillingPaymentMethod[];

  // Setters
  setBillings: (billings: TenantBilling[]) => void;
  setInvoices: (invoices: BillingInvoice[]) => void;
  setSubscriptionPlans: (plans: SubscriptionPlan[]) => void;
  setPaymentMethods: (methods: BillingPaymentMethod[]) => void;
  updateBilling: (id: string, updates: Partial<TenantBilling>) => void;

  // Actions
  upgradePlan: (
    tenantId: string,
    newPlan: TenantPlan,
    newAmount: number,
  ) => BillingInvoice | null;
  addInvoice: (invoice: BillingInvoice) => void;
  addPaymentMethod: (method: BillingPaymentMethod) => void;
  removePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (tenantId: string, methodId: string) => void;
}

export const useBillingsStore = create<BillingsStoreState>((set, get) => ({
  // Initial state - arrays always []
  billings: [],
  invoices: [],
  subscriptionPlans: [],
  paymentMethods: [],

  // Setters
  setBillings: (billings) => set({ billings: billings ?? [] }),
  setInvoices: (invoices) => set({ invoices: invoices ?? [] }),
  setSubscriptionPlans: (plans) => set({ subscriptionPlans: plans ?? [] }),
  setPaymentMethods: (methods) => set({ paymentMethods: methods ?? [] }),

  updateBilling: (id, updates) =>
    set((state) => ({
      billings: state.billings.map((b) =>
        b.id === id
          ? { ...b, ...updates, updatedAt: new Date().toISOString() }
          : b,
      ),
    })),

  // Upgrade plan action - creates invoice and updates billing
  upgradePlan: (tenantId, newPlan, newAmount) => {
    const state = get();
    const billing = state.billings.find((b) => b.tenant_id === tenantId);
    const plan = state.subscriptionPlans.find((p) => p.slug === newPlan);

    if (!billing || !plan) return null;

    const now = new Date();
    const invoiceNumber = `#${String(state.invoices.length + 1).padStart(3, "0")} - ${now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;

    // Create new invoice for the upgrade
    const newInvoice: BillingInvoice = {
      id: `invoice-${Date.now()}`,
      tenant_id: tenantId,
      invoiceNumber,
      planName: plan.name,
      amount: newAmount,
      status: "paid",
      dueDate: now.toISOString(),
      paidAt: now.toISOString(),
      createdAt: now.toISOString(),
    };

    // Update billing record
    const nextBillingDate = new Date(now);
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    set((state) => ({
      invoices: [newInvoice, ...state.invoices],
      billings: state.billings.map((b) =>
        b.tenant_id === tenantId
          ? {
              ...b,
              plan: newPlan,
              monthlyAmount: newAmount,
              lastPaymentDate: now.toISOString(),
              lastPaymentAmount: newAmount,
              nextBillingDate: nextBillingDate.toISOString(),
              updatedAt: now.toISOString(),
            }
          : b,
      ),
    }));

    return newInvoice;
  },

  addInvoice: (invoice) =>
    set((state) => ({
      invoices: [invoice, ...state.invoices],
    })),

  addPaymentMethod: (method) =>
    set((state) => ({
      paymentMethods: [...state.paymentMethods, method],
    })),

  removePaymentMethod: (id) =>
    set((state) => ({
      paymentMethods: state.paymentMethods.filter((m) => m.id !== id),
    })),

  setDefaultPaymentMethod: (tenantId, methodId) =>
    set((state) => ({
      paymentMethods: state.paymentMethods.map((m) =>
        m.tenant_id === tenantId ? { ...m, isDefault: m.id === methodId } : m,
      ),
    })),
}));
