import { useCallback, useMemo, useState } from "react";
import { useAuthStore } from "@/modules/auth";
import { useBillingsStore } from "@/modules/billing";
import { useTenantsStore } from "@/modules/platform";
import { usePOSStore } from "@/modules/pos";
import type { AsyncStatus, BillingAddress, BillingInvoice } from "@/shared/types/models";

/**
 * Billing Screen Hook
 *
 * Follows RULES:
 * - Returns status, vm, actions
 * - vm is UI-ready, memoized
 * - actions are stable
 */
export function useBillingScreen() {
  const { activeTenantId } = useAuthStore();
  const { billings, invoices, subscriptionPlans, paymentMethods } =
    useBillingsStore();
  const { tenants } = useTenantsStore();
  const { sales } = usePOSStore();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Get current tenant and billing
  const tenant = useMemo(
    () => tenants.find((t) => t.id === activeTenantId),
    [tenants, activeTenantId],
  );

  const billing = useMemo(
    () => billings.find((b) => b.tenant_id === activeTenantId),
    [billings, activeTenantId],
  );

  const currentPlan = useMemo(
    () => subscriptionPlans.find((p) => p.slug === billing?.plan),
    [subscriptionPlans, billing?.plan],
  );

  // Get tenant invoices sorted by date
  const tenantInvoices = useMemo(
    () =>
      invoices
        .filter((inv) => inv.tenant_id === activeTenantId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
    [invoices, activeTenantId],
  );

  // Pagination
  const totalPages = Math.ceil(tenantInvoices.length / itemsPerPage);
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return tenantInvoices.slice(startIndex, startIndex + itemsPerPage);
  }, [tenantInvoices, currentPage]);

  // Get tenant payment methods
  const tenantPaymentMethods = useMemo(
    () => paymentMethods.filter((pm) => pm.tenant_id === activeTenantId),
    [paymentMethods, activeTenantId],
  );

  // Get billing address from tenant settings
  const billingAddress = useMemo((): BillingAddress | null => {
    const raw = (
      tenant?.settings as { billingAddress?: Record<string, unknown> }
    )?.billingAddress;
    if (!raw) return null;
    return {
      name: (raw.name as string) ?? "",
      street: (raw.street as string) ?? "",
      city: (raw.city as string) ?? "",
      state: (raw.state as string) ?? "",
      zipCode: (raw.zipCode as string) ?? "",
      country: (raw.country as string) ?? "",
      vatNumber: (raw.vatNumber as string | null) ?? null,
    };
  }, [tenant]);

  // Calculate orders used this month
  const ordersUsed = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return sales.filter(
      (s) =>
        s.tenant_id === activeTenantId && new Date(s.createdAt) >= startOfMonth,
    ).length;
  }, [sales, activeTenantId]);

  const ordersLimit = currentPlan?.limits.maxOrders ?? tenant?.maxOrders ?? 100;

  // Derive status from data - no useEffect needed
  const status: AsyncStatus = useMemo(() => {
    if (billing) return "success";
    if (activeTenantId) return "empty";
    return "loading";
  }, [billing, activeTenantId]);

  // Refresh action (placeholder for future API integration)
  const refresh = useCallback(() => {
    // No-op for now - in real app, would refetch billing data
  }, []);

  // Pagination actions
  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages],
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  }, [currentPage]);

  // VM - UI-ready data
  const vm = useMemo(
    () => ({
      billing,
      currentPlan,
      billingAddress,
      paymentMethods: tenantPaymentMethods,
      invoices: paginatedInvoices as BillingInvoice[],
      ordersUsed,
      ordersLimit,
      pagination: {
        currentPage,
        totalPages,
        totalItems: tenantInvoices.length,
      },
      canUpgrade: billing?.plan === "starter",
    }),
    [
      billing,
      currentPlan,
      billingAddress,
      tenantPaymentMethods,
      paginatedInvoices,
      ordersUsed,
      ordersLimit,
      currentPage,
      totalPages,
      tenantInvoices.length,
    ],
  );

  // Actions - stable references
  const actions = useMemo(
    () => ({
      refresh,
      goToPage,
      nextPage,
      prevPage,
    }),
    [refresh, goToPage, nextPage, prevPage],
  );

  return { status, vm, actions };
}
