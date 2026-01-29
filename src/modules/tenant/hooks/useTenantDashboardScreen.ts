/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { useActivityLogsStore } from "@/modules/platform/store/activityLogs.store";
import { useTenantsStore } from "@/modules/platform";
import { useUsersStore } from "@/modules/tenant";
import { useProductsStore } from "@/modules/products";
import { useCustomersStore } from "@/modules/customers";
import { useAuthStore } from "@/modules/auth";
import { usePOSStore } from "@/modules/pos";
import { useParams } from "react-router-dom";
import type {
  TenantUser,
  Product,
  TenantActivityLog,
} from "@/shared/types/models";

export type DashboardStatus = "loading" | "error" | "empty" | "success";

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

// Chart colors for sales breakdown
const CHART_COLORS = [
  "#465fff", // brand
  "#12b76a", // success
  "#f79009", // warning
  "#f04438", // error
  "#7592ff", // brand-light
  "#32d583", // success-light
];

export function useTenantDashboardScreen(): {
  status: DashboardStatus;
  vm: any;
} {
  const { tenantId: paramTenantId } = useParams<{ tenantId: string }>();
  const { activeTenantId, currentTenant } = useAuthStore();
  const { tenants } = useTenantsStore();
  const { tenantUsers: allUsers } = useUsersStore();
  const { products } = useProductsStore();
  const { tenantLogs } = useActivityLogsStore();
  const { sales: allSales } = usePOSStore();
  const { customers: tenantCustomersList } = useCustomersStore();

  const tenantId = paramTenantId || activeTenantId;

  // Use currentTenant from auth store (set during login) if available
  // Fall back to tenantsStore lookup for platform admin viewing tenant details
  const tenant = useMemo(() => {
    // First check if we have currentTenant from login (for tenant users)
    if (currentTenant && currentTenant.id === tenantId) {
      // Convert AuthTenant to Tenant-like object for compatibility
      return {
        id: currentTenant.id,
        slug: currentTenant.slug,
        companyName: currentTenant.companyName,
        status: currentTenant.status,
        features: currentTenant.features,
        settings: currentTenant.settings,
      };
    }
    // Fall back to tenantsStore for platform admin impersonation/viewing
    return tenants.find((t) => t.id === tenantId);
  }, [currentTenant, tenants, tenantId]);

  const tenantUsers = useMemo(
    () => allUsers.filter((u: TenantUser) => u.tenant_id === tenantId),
    [allUsers, tenantId],
  );

  const tenantProducts = useMemo(
    () => products.filter((p: Product) => p.tenant_id === tenantId),
    [products, tenantId],
  );

  const specificTenantLogs = useMemo(
    () => tenantLogs.filter((l: TenantActivityLog) => l.tenant_id === tenantId),
    [tenantLogs, tenantId],
  );

  const tenantSales = useMemo(
    () => allSales.filter((s: any) => s.tenant_id === tenantId),
    [allSales, tenantId],
  );

  const tenantCustomers = useMemo(
    () => tenantCustomersList.filter((c: any) => c.tenant_id === tenantId),
    [tenantCustomersList, tenantId],
  );

  const totalSalesValue = useMemo(
    () =>
      tenantSales.reduce((sum: number, sale: any) => sum + sale.grandTotal, 0),
    [tenantSales],
  );

  // Calculate sales breakdown by payment method for donut chart
  const salesBreakdown = useMemo(() => {
    const breakdownMap: Record<string, number> = {};

    tenantSales.forEach((sale: any) => {
      const method = sale.paymentMethod || "Other";
      const formattedMethod =
        method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();

      if (!breakdownMap[formattedMethod]) {
        breakdownMap[formattedMethod] = 0;
      }
      breakdownMap[formattedMethod] += sale.grandTotal;
    });

    // Convert to array and sort by value
    const sortedBreakdown = Object.entries(breakdownMap)
      .map(([label, value], index) => ({
        label,
        value,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    return sortedBreakdown;
  }, [tenantSales]);

  // Calculate product count by low stock for additional insights
  const lowStockCount = useMemo(() => {
    return tenantProducts.filter(
      (p: Product) =>
        p.currentStock <= p.minimumStock ||
        p.status === "low_stock" ||
        p.status === "out_of_stock",
    ).length;
  }, [tenantProducts]);

  const recentLogs = useMemo(() => {
    const sortedLogs = [...specificTenantLogs]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);

    // Map actor IDs to names and format details
    return sortedLogs.map((log) => {
      const actorUser = allUsers.find((u: TenantUser) => u.id === log.actorId);
      return {
        id: log.id,
        action: log.action,
        actorName: actorUser?.name || "System",
        details: formatActivityDetails(log.action, log.details),
        createdAt: log.createdAt,
      };
    });
  }, [specificTenantLogs, allUsers]);

  const metrics = useMemo(
    () => [
      {
        title: "Total Sales",
        value: totalSalesValue,
        isRawCurrency: true,
        change: { value: "11.01%", isUp: true },
        iconColor: "brand" as const,
      },
      {
        title: "Orders",
        value: tenantSales.length,
        change: { value: "9.05%", isUp: false },
        iconColor: "success" as const,
      },
      {
        title: "Customers",
        value: tenantCustomers.length,
        change: { value: "5.4%", isUp: true },
        iconColor: "warning" as const,
      },
      {
        title: "Low Stock Items",
        value: lowStockCount,
        change:
          lowStockCount > 0
            ? { value: `${lowStockCount} need reorder`, isUp: false }
            : { value: "All stocked", isUp: true },
        iconColor:
          lowStockCount > 0 ? ("error" as const) : ("success" as const),
      },
    ],
    [
      totalSalesValue,
      tenantSales.length,
      tenantCustomers.length,
      lowStockCount,
    ],
  );

  const recentOrders = useMemo(() => {
    return [...tenantSales]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [tenantSales]);

  const vm = useMemo(
    () => ({
      tenant,
      metrics,
      recentLogs,
      recentOrders,
      tenantUsers,
      tenantProducts,
      tenantSales,
      salesBreakdown,
      totalSalesValue,
    }),
    [
      tenant,
      metrics,
      recentLogs,
      recentOrders,
      tenantUsers,
      tenantProducts,
      tenantSales,
      salesBreakdown,
      totalSalesValue,
    ],
  );

  const status: DashboardStatus = tenant ? "success" : "error";

  return { status, vm };
}
