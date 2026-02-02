import { useState, useMemo, useCallback } from "react";
import { useAuthStore } from "@/modules/auth";
import {
  type AsyncStatus,
  type RefundLineItem,
  type Sale,
  type Refund,
} from "@/shared/types/models";
import {
  useSalesFetch,
  useRefundsFetch,
  useProcessRefund,
} from "../api/queries";
import { type Sale as ApiSale, type Refund as ApiRefund } from "../api/posApi";

/**
 * useSalesHistoryLogic - Sales history screen hook
 * Implements server-side pagination for both Orders and Refunds
 */
export function useSalesHistoryLogic() {
  const { activeTenantId, currentUser } = useAuthStore();

  // Pagination State
  const [ordersPage, setOrdersPage] = useState(1);
  const [refundsPage, setRefundsPage] = useState(1);
  const [limit] = useState(10);

  const processRefundMutation = useProcessRefund();

  // 1. Fetch Sales (Orders)
  const {
    data: salesData,
    isLoading: isLoadingSales,
    error: salesError,
  } = useSalesFetch({
    page: ordersPage,
    limit,
    // Add sorting/filtering here if needed
  });

  // 2. Fetch Refunds
  const {
    data: refundsData,
    isLoading: isLoadingRefunds,
    error: refundsError,
  } = useRefundsFetch({
    page: refundsPage,
    limit,
  });

  const status: AsyncStatus =
    isLoadingSales || isLoadingRefunds
      ? "loading"
      : salesError || refundsError
        ? "error"
        : "success";

  // Map API Sales to Shared Model
  const tenantSales = useMemo(() => {
    if (!salesData?.items) return [];

    return salesData.items.map(
      (s: ApiSale): Sale => ({
        ...s,
        tenant_id: activeTenantId || "",
        customerId: s.customerId || "",
        subtotal: Number(s.subtotal),
        tax: Number(s.tax),
        grandTotal: Number(s.grandTotal),
        paymentMethod: (s.paymentMethod?.toUpperCase() ||
          "CASH") as Sale["paymentMethod"],
        discount: s.discount
          ? { ...s.discount, reason: s.discount.reason || "" }
          : null,
        lineItems: (s.items || []).map((i) => ({
          ...i,
          unitPriceSnapshot: Number(i.unitPriceSnapshot),
          costPriceSnapshot: Number(i.costPriceSnapshot),
          subtotal: Number(i.subtotal),
        })),
      }),
    );
  }, [salesData, activeTenantId]);

  // Map API Refunds to Shared Model
  const tenantRefunds = useMemo(() => {
    if (!refundsData?.items) return [];

    return refundsData.items.map(
      (r: ApiRefund): Refund => ({
        id: r.id,
        tenant_id: activeTenantId || "",
        originalSaleId: r.originalSaleId,
        refundNumber: r.refundNumber,
        refundedItems: r.refundedItems.map((ri) => ({
          ...ri,
          // Ensure compatibility if types differ slightly
        })),
        refundTotal: Number(r.refundTotal),
        reason: r.reason,
        processedBy: currentUser?.id || "",
        createdAt: r.createdAt,
        updatedAt: r.createdAt, // fallback
      }),
    );
  }, [refundsData, activeTenantId, currentUser]);

  // Order limits override (mock/placeholder)
  const orderStats = useMemo(
    () => ({
      canAddMore: true,
      maxOrders: 100,
      currentCount: salesData?.pagination.total || 0,
    }),
    [salesData],
  );

  const vm = useMemo(
    () => ({
      sales: tenantSales,
      refunds: tenantRefunds,

      // Data Metrics
      totalSales: salesData?.pagination.total || 0,
      totalRefunds: refundsData?.pagination.total || 0,

      activeTenantId,
      currentUser,
      orderStats,

      // Pagination Metadata for UI checks
      ordersPagination: {
        page: ordersPage,
        totalPages: salesData?.pagination.totalPages || 1,
        totalItems: salesData?.pagination.total || 0,
        limit,
      },
      refundsPagination: {
        page: refundsPage,
        totalPages: refundsData?.pagination.totalPages || 1,
        totalItems: refundsData?.pagination.total || 0,
        limit,
      },
    }),
    [
      tenantSales,
      tenantRefunds,
      salesData,
      refundsData,
      activeTenantId,
      currentUser,
      orderStats,
      ordersPage,
      refundsPage,
      limit,
    ],
  );

  const handleRefund = useCallback(
    async (saleId: string, items: RefundLineItem[], reason: string) => {
      if (!activeTenantId || !currentUser) return;

      try {
        const refund = await processRefundMutation.mutateAsync({
          originalSaleId: saleId,
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            refundAmount: item.refundAmount,
          })),
          reason,
        });
        return refund.id;
      } catch (e) {
        console.error("Refund failed", e);
        throw e;
      }
    },
    [activeTenantId, currentUser, processRefundMutation],
  );

  const actions = useMemo(
    () => ({
      setOrdersPage,
      setRefundsPage,
      refund: handleRefund,
    }),
    [handleRefund],
  );

  return { status, vm, actions };
}
