import seedData from "@/data/seed.json";
import type { SeedData } from "@/types";
import { useTenantsStore } from "@/stores/tenants.store";
import { useUsersStore } from "@/stores/users.store";
import { useProductsStore } from "@/stores/products.store";
import { useCustomersStore } from "@/stores/customers.store";
import { usePOSStore } from "@/stores/pos.store";
import { useActivityLogsStore } from "@/stores/activityLogs.store";
import { useVendorsStore } from "@/stores/vendors.store";
import { usePurchasesStore } from "@/stores/purchases.store";
import { useExpensesStore } from "@/stores/expenses.store";
import { useInventoryStore } from "@/stores/inventory.store";

/**
 * Initialize all stores with seed data.
 * Called once on app start.
 *
 * This is the ONLY place where seed data is loaded.
 * All downstream code uses normalized store data.
 */
export function initializeStores(): void {
  const data = seedData as unknown as SeedData;

  // Load tenants
  useTenantsStore.getState().setTenants(data.tenants ?? []);

  // Load users
  useUsersStore.getState().setPlatformUsers(data.platformUsers ?? []);
  useUsersStore.getState().setTenantUsers(data.users ?? []);

  // Load products
  useProductsStore.getState().setProducts(data.products ?? []);

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
    posStore.setShifts(rawPos.shifts ?? []);

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
    posStore.setShifts([]);
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
    users: useUsersStore.getState().tenantUsers,
    products: useProductsStore.getState().products,
    customers: useCustomersStore.getState().customers,
    vendors: useVendorsStore.getState().vendors,
    purchases: usePurchasesStore.getState().purchases,
    expenses: useExpensesStore.getState().expenses,
    inventoryAdjustments: useInventoryStore.getState().inventoryAdjustments,
    pos: {
      registers: usePOSStore.getState().registers,
      shifts: usePOSStore.getState().shifts,
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
