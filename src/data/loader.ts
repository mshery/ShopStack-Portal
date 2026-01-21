import seedData from "@/data/seed.json";
import type { SeedData } from "@/shared/types/models";
import { useTenantsStore } from "@/modules/platform";
import { useUsersStore } from "@/modules/tenant";
import { useProductsStore } from "@/modules/products";
import { useCategoriesStore } from "@/modules/catalog";
import { useBrandsStore } from "@/modules/catalog";
import { useCustomersStore } from "@/modules/customers";
import { usePOSStore } from "@/modules/pos";
import { useActivityLogsStore } from "@/modules/platform";
import { useVendorsStore } from "@/modules/vendors";
import { usePurchasesStore } from "@/modules/purchases";
import { useExpensesStore } from "@/modules/expenses";
import { useInventoryStore } from "@/modules/inventory";
import { useBillingsStore } from "@/modules/billing/store/billings.store";
import { usePlatformSettingsStore } from "@/modules/platform";

/**
 * Initialize all stores with seed data.
 * Called once on app start.
 *
 * This is the ONLY place where seed data is loaded.
 * All downstream code uses normalized store data.
 */
export function initializeStores(): void {
  const data = seedData as unknown as SeedData;

  // Load platform settings
  if (data.platformSettings) {
    usePlatformSettingsStore.getState().setSettings(data.platformSettings);
  }

  // Load tenants
  useTenantsStore.getState().setTenants(data.tenants ?? []);

  // Load billing data
  useBillingsStore.getState().setBillings(data.tenantBillings ?? []);
  useBillingsStore.getState().setInvoices(data.billingInvoices ?? []);
  useBillingsStore
    .getState()
    .setSubscriptionPlans(data.subscriptionPlans ?? []);
  useBillingsStore.getState().setPaymentMethods(data.paymentMethods ?? []);

  // Load users
  useUsersStore.getState().setPlatformUsers(data.platformUsers ?? []);
  useUsersStore.getState().setTenantUsers(data.users ?? []);

  // Load products
  useProductsStore.getState().setProducts(data.products ?? []);

  // Load categories
  useCategoriesStore.getState().setCategories(data.categories ?? []);

  // Load brands
  useBrandsStore.getState().setBrands(data.brands ?? []);

  // Load customers
  useCustomersStore.getState().setCustomers(data.customers ?? []);

  // Load vendors
  useVendorsStore.getState().setVendors(data.vendors ?? []);

  // Load purchases
  usePurchasesStore.getState().setPurchases(data.purchases ?? []);

  // Load expenses
  useExpensesStore.getState().setExpenses(data.expenses ?? []);

  // Load inventory adjustments
  useInventoryStore
    .getState()
    .setInventoryAdjustments(data.inventoryAdjustments ?? []);

  // Load POS data
  const posStore = usePOSStore.getState();
  const rawPos = data.pos;

  if (rawPos) {
    posStore.setRegisters(rawPos.registers ?? []);

    // Fix missing fields in sales data
    const payments = rawPos.payments ?? [];
    const sales = (rawPos.sales ?? []).map((sale) => {
      // Find associated payment to get the method
      const payment = payments.find((p) => p.saleId === sale.id);

      return {
        ...sale,
        number: sale.number ?? `SALE-${sale.id.split("-")[1] ?? Date.now()}`,
        updatedAt: sale.updatedAt ?? sale.createdAt,
        paymentMethod: sale.paymentMethod ?? payment?.method ?? "CASH",
      };
    });

    posStore.setSales(sales);
    posStore.setPayments(payments);
    posStore.setReceipts(rawPos.receipts ?? []);
    posStore.setRefunds(rawPos.refunds ?? []);
  } else {
    posStore.setRegisters([]);
    posStore.setSales([]);
    posStore.setPayments([]);
    posStore.setReceipts([]);
    posStore.setRefunds([]);
  }

  // Load activity logs
  useActivityLogsStore
    .getState()
    .setPlatformLogs(data.platformActivityLogs ?? []);
  useActivityLogsStore.getState().setTenantLogs(data.tenantActivityLogs ?? []);
}

/**
 * Export current in-memory state as JSON
 * Optional feature for downloading current state
 */
export function exportCurrentState(): SeedData {
  return {
    meta: {
      version: "1.0.0",
      seededAt: new Date().toISOString(),
    },
    platformUsers: useUsersStore.getState().platformUsers,
    platformActivityLogs: useActivityLogsStore.getState().platformLogs,
    tenants: useTenantsStore.getState().tenants,
    tenantBillings: useBillingsStore.getState().billings,
    billingInvoices: useBillingsStore.getState().invoices,
    subscriptionPlans: useBillingsStore.getState().subscriptionPlans,
    paymentMethods: useBillingsStore.getState().paymentMethods,
    platformSettings: usePlatformSettingsStore.getState().settings,
    users: useUsersStore.getState().tenantUsers,
    products: useProductsStore.getState().products,
    categories: useCategoriesStore.getState().categories,
    brands: useBrandsStore.getState().brands,
    customers: useCustomersStore.getState().customers,
    vendors: useVendorsStore.getState().vendors,
    purchases: usePurchasesStore.getState().purchases,
    expenses: useExpensesStore.getState().expenses,
    inventoryAdjustments: useInventoryStore.getState().inventoryAdjustments,
    pos: {
      registers: usePOSStore.getState().registers,
      sales: usePOSStore.getState().sales,
      payments: usePOSStore.getState().payments,
      receipts: usePOSStore.getState().receipts,
      refunds: usePOSStore.getState().refunds,
    },
    tenantActivityLogs: useActivityLogsStore.getState().tenantLogs,
  };
}

/**
 * Download current state as JSON file
 */
export function downloadStateAsJson(): void {
  const state = exportCurrentState();
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `saas-data-export-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
