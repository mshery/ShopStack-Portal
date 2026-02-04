import { useCallback, useMemo, useState } from "react";
import { useAuthStore } from "@/modules/auth";
import {
  useBillingFetch,
  useInvoicesFetch,
  usePaymentMethodsFetch,
  useAddPaymentMethod,
  useDeletePaymentMethod,
  useSetDefaultPaymentMethod,
} from "@/modules/tenant";
import { usePOSStore } from "@/modules/pos";
import type {
  AsyncStatus,
  BillingAddress,
  BillingInvoice,
  BillingPaymentMethod,
} from "@/shared/types/models";

/**
 * Billing Screen Hook
 *
 * Uses Real API via TanStack Query
 * Exposes actions for UI interactions
 */
export function useBillingScreen() {
  const { activeTenantId, currentTenant } = useAuthStore();
  const { sales } = usePOSStore(); // Client-side store for sales metrics

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ============ QUERIES ============

  // 1. Fetch Billing Info
  const { data: billing, isLoading: isBillingLoading } =
    useBillingFetch(!!activeTenantId);

  // 2. Fetch Invoices (Paginated)
  const {
    data: invoicesData,
    isLoading: isInvoicesLoading,
    refetch: refetchInvoices,
  } = useInvoicesFetch({
    page: currentPage,
    limit: itemsPerPage,
  });

  // 3. Fetch Payment Methods
  const {
    data: paymentMethods = [],
    isLoading: isPmLoading,
    refetch: refetchPm,
  } = usePaymentMethodsFetch(!!activeTenantId);

  // ============ MUTATIONS ============
  const addPmMutation = useAddPaymentMethod();
  const deletePmMutation = useDeletePaymentMethod();
  const setDefaultPmMutation = useSetDefaultPaymentMethod();

  // ============ STATUS ============
  const status: AsyncStatus = useMemo(() => {
    if (isBillingLoading || isInvoicesLoading || isPmLoading) return "loading";
    // If billing is null, it means no billing info found (rare but possible)
    if (!billing) return "empty";
    return "success";
  }, [isBillingLoading, isInvoicesLoading, isPmLoading, billing]);

  // ============ DERIVED DATA ============

  // Billing Address from Auth Tenant Settings
  const billingAddress = useMemo((): BillingAddress | null => {
    const raw = (
      currentTenant?.settings as { billingAddress?: Record<string, unknown> }
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
  }, [currentTenant]);

  // Orders Used (metrics)
  const ordersUsed = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return sales.filter(
      (s) =>
        s.tenant_id === activeTenantId && new Date(s.createdAt) >= startOfMonth,
    ).length;
  }, [sales, activeTenantId]);

  const currentPlan = billing?.plan;
  const ordersLimit = currentPlan?.limits.maxOrders ?? 100;

  // Pagination
  const totalPages = invoicesData?.pagination.totalPages ?? 1;

  // ============ ACTIONS ============

  const refresh = useCallback(async () => {
    await Promise.all([refetchInvoices(), refetchPm()]);
  }, [refetchInvoices, refetchPm]);

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) setCurrentPage(page);
    },
    [totalPages],
  );

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  }, [currentPage]);

  // Payment Method Actions
  // Payment Method Actions
  const addPaymentMethod = useCallback(
    async (data: {
      type: "card" | "paypal";
      brand?: string;
      last4?: string;
      expiryMonth?: number;
      expiryYear?: number;
      email?: string;
      isDefault?: boolean;
    }) => {
      await addPmMutation.mutateAsync({
        ...data,
        expiryMonth: data.expiryMonth ?? 12, // Default fallback if needed, or better let backend handle validation
        expiryYear: data.expiryYear ?? 2030,
      });
    },
    [addPmMutation],
  );

  const removePaymentMethod = useCallback(
    async (id: string) => {
      await deletePmMutation.mutateAsync(id);
    },
    [deletePmMutation],
  );

  const setDefaultPaymentMethod = useCallback(
    async (id: string) => {
      await setDefaultPmMutation.mutateAsync(id);
    },
    [setDefaultPmMutation],
  );

  // VM construction
  const vm = useMemo(
    () => ({
      billing: billing
        ? {
            ...billing,
          }
        : undefined,
      currentPlan: currentPlan
        ? {
            ...currentPlan,
            monthlyPrice: currentPlan.monthlyPrice,
            features: currentPlan.features ?? [],
          }
        : undefined,
      billingAddress,
      paymentMethods: paymentMethods as unknown as BillingPaymentMethod[],
      invoices: (invoicesData?.items ?? []) as unknown as BillingInvoice[],
      ordersUsed,
      ordersLimit,
      pagination: {
        currentPage,
        totalPages,
        totalItems: invoicesData?.pagination.total ?? 0,
      },
      canUpgrade: currentPlan?.slug === "starter",
    }),
    [
      billing,
      currentPlan,
      billingAddress,
      paymentMethods,
      invoicesData,
      ordersUsed,
      ordersLimit,
      currentPage,
      totalPages,
    ],
  );

  const actions = useMemo(
    () => ({
      refresh,
      goToPage,
      nextPage,
      prevPage,
      addPaymentMethod,
      removePaymentMethod,
      setDefaultPaymentMethod,
    }),
    [
      refresh,
      goToPage,
      nextPage,
      prevPage,
      addPaymentMethod,
      removePaymentMethod,
      setDefaultPaymentMethod,
    ],
  );

  return { status, vm, actions };
}
