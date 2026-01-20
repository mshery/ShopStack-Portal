import { useMemo } from "react";
import { useAuthStore } from "@/modules/auth";
import { useUsersStore } from "@/modules/tenant";
import { useProductsStore } from "@/modules/products";
import { usePOSStore } from "@/modules/pos";
import type { AsyncStatus } from "@/shared/types/models";

/**
 * useTenantDashboardLogic - Tenant dashboard screen hook
 */
export function useTenantDashboardLogic() {
  const { activeTenantId } = useAuthStore();
  const { tenantUsers } = useUsersStore();
  const { products } = useProductsStore();
  const { sales } = usePOSStore();

  const status: AsyncStatus = "success";

  const vm = useMemo(() => {
    if (!activeTenantId) return null;

    const users = tenantUsers.filter((u) => u.tenant_id === activeTenantId);
    const tenantProducts = products.filter(
      (p) => p.tenant_id === activeTenantId,
    );
    const lowStockProducts = tenantProducts.filter(
      (p) => p.status === "low_stock" || p.status === "out_of_stock",
    );
    const tenantSales = sales.filter((s) => s.tenant_id === activeTenantId);

    const totalRevenue = tenantSales.reduce((sum, s) => sum + s.grandTotal, 0);
    const today = new Date().toISOString().split("T")[0];
    const todaySales = tenantSales.filter((s) => s.createdAt.startsWith(today));
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.grandTotal, 0);

    return {
      userCount: users.length,
      productCount: tenantProducts.length,
      lowStockCount: lowStockProducts.length,
      totalRevenue,
      todayRevenue,
      todaySaleCount: todaySales.length,
      recentSales: tenantSales.slice(-5).reverse(),
      topLowStock: lowStockProducts.slice(0, 5),
    };
  }, [activeTenantId, tenantUsers, products, sales]);

  const actions = useMemo(() => ({}), []);

  return { status, vm, actions };
}
