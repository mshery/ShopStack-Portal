import { useMemo } from "react";
import { useDashboardStatsFetch } from "@/modules/tenant/api/queries";
import { useAuthStore } from "@/modules/auth";
import { useTenantsStore } from "@/modules/platform";
import { useUsersStore } from "@/modules/tenant";
import { useActivityLogsStore } from "@/modules/platform/store/activityLogs.store";
import { useParams } from "react-router-dom";
import type { TenantActivityLog, TenantUser } from "@/shared/types/models";

export type DashboardStatus = "loading" | "error" | "empty" | "success";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatActivityDetails = (action: string, details: any): string => {
  if (!details || typeof details !== "object") return "";

  const actionLower = action.toLowerCase();

  if (actionLower.includes("product")) {
    return details.productName || "";
  }
  if (actionLower.includes("user")) {
    return details.userName || "";
  }
  if (actionLower.includes("sale") || actionLower.includes("order")) {
    const total = details.grandTotal ? `$${details.grandTotal.toFixed(2)}` : "";
    const payment = details.paymentMethod || "";
    return payment ? `${total} (${payment})` : total;
  }
  if (actionLower.includes("tenant")) {
    return details.companyName || details.oldPlan || details.newPlan || "";
  }

  // Fallback: try to get the first meaningful value
  const values = Object.values(details).filter(
    (v) => v !== null && v !== undefined && typeof v !== "object",
  );
  return values.length > 0 ? String(values[0]) : "";
};

// Chart colors for sales breakdown map (backend returns colors but we can override or just use them)
// We'll trust backend colors or use defaults if missing

export function useTenantDashboardScreen() {
  const { tenantId: paramTenantId } = useParams<{ tenantId: string }>();
  const { activeTenantId, currentTenant } = useAuthStore();
  const { tenants } = useTenantsStore();
  const { tenantLogs } = useActivityLogsStore();
  const { tenantUsers: allUsers } = useUsersStore();

  const tenantId = paramTenantId || activeTenantId;

  // FETCH DATA FROM API
  // Use new dedicated dashboard endpoint
  const { data: stats, isLoading } = useDashboardStatsFetch();

  const tenantUsers = useMemo(
    () => allUsers.filter((u: TenantUser) => u.tenant_id === tenantId),
    [allUsers, tenantId],
  );

  const specificTenantLogs = useMemo(
    () => tenantLogs.filter((l: TenantActivityLog) => l.tenant_id === tenantId),
    [tenantLogs, tenantId],
  );

  const tenant = useMemo(() => {
    if (currentTenant && currentTenant.id === tenantId) {
      return {
        id: currentTenant.id,
        slug: currentTenant.slug,
        companyName: currentTenant.companyName,
        status: currentTenant.status,
        features: currentTenant.features,
        settings: currentTenant.settings,
      };
    }
    return tenants.find((t) => t.id === tenantId);
  }, [currentTenant, tenants, tenantId]);

  const recentLogs = useMemo(() => {
    const sortedLogs = [...specificTenantLogs]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);

    return sortedLogs.map((log) => {
      const actorUser = tenantUsers.find(
        (u: TenantUser) => u.id === log.actorId,
      );
      return {
        id: log.id,
        action: log.action,
        actorName: actorUser?.name || "System",
        details: formatActivityDetails(log.action, log.details),
        createdAt: log.createdAt,
      };
    });
  }, [specificTenantLogs, tenantUsers]);

  const vm = useMemo(() => {
    if (!stats)
      return {
        metrics: [],
        tenantSales: [],
        salesBreakdown: [],
        recentOrders: [],
        recentLogs: [],
        tenant,
        tenantUsers,
      };

    const metrics = [
      {
        title: "Total Sales",
        // Using monthly revenue as the primary "Total Sales" metric
        value: stats.month.revenue,
        isRawCurrency: true,
        change: { value: "This month", isUp: true }, // We don't have historical comparison yet, hardcode or calculate if possible
        iconColor: "brand" as const,
      },
      {
        title: "Orders",
        value: stats.month.salesCount,
        change: { value: "This month", isUp: true },
        iconColor: "success" as const,
      },
      {
        title: "Customers",
        value: stats.customers.total,
        change: { value: "Total", isUp: true },
        iconColor: "warning" as const,
      },
      {
        title: "Low Stock Items",
        value: stats.inventory.lowStockCount,
        change:
          stats.inventory.lowStockCount > 0
            ? {
                value: `${stats.inventory.lowStockCount} need reorder`,
                isUp: false,
              }
            : { value: "All stocked", isUp: true },
        iconColor:
          stats.inventory.lowStockCount > 0
            ? ("error" as const)
            : ("success" as const),
      },
    ];

    return {
      tenant,
      metrics,
      recentLogs,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recentOrders: stats.recentSales as any,
      tenantUsers,
      tenantProducts: [], // No longer needed/fetching
      tenantSales: stats.monthlySales, // Mapped directly for chart
      salesBreakdown: stats.salesBreakdown,
      totalSalesValue: stats.month.revenue, // Used for donut center
    };
  }, [stats, tenant, recentLogs, tenantUsers]);

  const status: DashboardStatus = isLoading
    ? "loading"
    : tenant
      ? "success"
      : "error";

  return { status, vm };
}
