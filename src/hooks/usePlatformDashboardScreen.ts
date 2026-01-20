import { useMemo } from "react";
import { useActivityLogsStore } from "../stores/activityLogs.store";
import { useTenantsStore } from "../stores/tenants.store";
import { useUsersStore } from "../stores/users.store";
import { usePOSStore } from "../stores/pos.store";
import { formatCurrency } from "../utils/format";

export type DashboardStatus = "loading" | "error" | "empty" | "success";

export function usePlatformDashboardScreen() {
  const { platformLogs } = useActivityLogsStore();
  const { tenants } = useTenantsStore();
  const { platformUsers } = useUsersStore();
  const { sales } = usePOSStore();

  const totalRevenue = useMemo(() => {
    return sales.reduce((sum, sale) => sum + sale.grandTotal, 0);
  }, [sales]);

  const metrics = useMemo(
    () => [
      {
        title: "Total Tenants",
        value: tenants.length,
        change: { value: "12%", isUp: true },
      },
      {
        title: "Active Users",
        value: platformUsers.length,
        change: { value: "5.4%", isUp: true },
      },
      {
        title: "Total Revenue",
        value: formatCurrency(totalRevenue),
        change: { value: "8.2%", isUp: true },
      },
    ],
    [tenants.length, platformUsers.length, totalRevenue],
  );

  const recentLogs = useMemo(() => {
    return [...platformLogs]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [platformLogs]);

  const planDistribution = useMemo(() => {
    const counts = tenants.reduce(
      (acc, tenant) => {
        acc[tenant.plan] = (acc[tenant.plan] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [tenants]);

  const tenantGrowth = useMemo(() => {
    const growth = tenants
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      .reduce(
        (acc, tenant, index) => {
          const date = new Date(tenant.createdAt).toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          });
          // Simplistic growth chart: incremental count
          acc.push({ name: date, count: index + 1 });
          return acc;
        },
        [] as { name: string; count: number }[],
      );

    return growth;
  }, [tenants]);

  const vm = useMemo(
    () => ({
      metrics,
      recentLogs,
      planDistribution,
      tenantGrowth,
    }),
    [metrics, recentLogs, planDistribution, tenantGrowth],
  );

  const actions = useMemo(
    () => ({
      // Add refresh logic if needed
    }),
    [],
  );

  return { status: "success" as DashboardStatus, vm, actions };
}
