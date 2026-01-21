import { useMemo, useCallback } from "react";
import { useAuthStore } from "@/modules/auth";
import { useTenantsStore } from "@/modules/platform";
import { usePOSStore } from "@/modules/pos";
import type { AsyncStatus, RefundLineItem } from "@/shared/types/models";
import { createRefund, restoreInventory } from "../logic/refund.logic";

/**
 * useSalesHistoryLogic - Sales history screen hook
 */
export function useSalesHistoryLogic() {
  const { activeTenantId, currentUser } = useAuthStore();
  const { sales, refunds, addRefund } = usePOSStore();
  const { tenants } = useTenantsStore();

  const status: AsyncStatus = "success";

  const tenantSales = useMemo(() => {
    if (!activeTenantId) return [];
    return sales.filter((s) => s.tenant_id === activeTenantId).reverse(); // Newest first
  }, [activeTenantId, sales]);

  const tenantRefunds = useMemo(() => {
    if (!activeTenantId) return [];
    return refunds.filter((r) => r.tenant_id === activeTenantId).reverse();
  }, [activeTenantId, refunds]);

  // Check order limits
  const orderStats = useMemo(() => {
    if (!activeTenantId) {
      return { canAddMore: true, maxOrders: Infinity, currentCount: 0 };
    }

    const tenant = tenants.find((t) => t.id === activeTenantId);
    const maxOrders = tenant?.maxOrders ?? 100;
    const currentCount = tenantSales.length;

    return {
      canAddMore: currentCount < maxOrders,
      maxOrders,
      currentCount,
    };
  }, [activeTenantId, tenants, tenantSales]);

  const profitStats = useMemo(() => {
    let totalProfit = 0;
    let totalCost = 0;

    tenantSales.forEach((sale) => {
      // Check if this sale was refunded
      const isRefunded = tenantRefunds.some(
        (r) => r.originalSaleId === sale.id,
      );
      if (isRefunded) return;

      sale.lineItems.forEach((item) => {
        const itemCost = (item.costPriceSnapshot || 0) * item.quantity;
        const itemRevenue = item.subtotal;
        totalCost += itemCost;
        totalProfit += itemRevenue - itemCost;
      });
    });

    const margin =
      totalProfit > 0 ? (totalProfit / (totalProfit + totalCost)) * 100 : 0;

    return { totalProfit, totalCost, margin };
  }, [tenantSales, tenantRefunds]);

  const vm = useMemo(
    () => ({
      sales: tenantSales,
      refunds: tenantRefunds,
      totalSales: tenantSales.length,
      totalRevenue: tenantSales.reduce((sum, s) => sum + s.grandTotal, 0),
      totalRefunds: tenantRefunds.reduce((sum, r) => sum + r.refundTotal, 0),
      totalProfit: profitStats.totalProfit,
      margin: profitStats.margin,
      activeTenantId,
      currentUser,
      orderStats,
    }),
    [
      tenantSales,
      tenantRefunds,
      profitStats,
      activeTenantId,
      currentUser,
      orderStats,
    ],
  );

  const handleRefund = useCallback(
    (saleId: string, items: RefundLineItem[], reason: string) => {
      if (!activeTenantId || !currentUser) return;

      // Create refund using logic module
      const refund = createRefund(
        saleId,
        items,
        reason,
        currentUser.id,
        activeTenantId,
      );

      // Add to store
      addRefund(refund);

      // Restore inventory (logic module handles this)
      restoreInventory(items);

      return refund.id;
    },
    [activeTenantId, currentUser, addRefund],
  );

  const actions = useMemo(
    () => ({
      refund: handleRefund,
    }),
    [handleRefund],
  );

  return { status, vm, actions };
}
