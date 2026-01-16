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

  const vm = useMemo(
    () => ({
      metrics,
      recentLogs,
    }),
    [metrics, recentLogs],
  );

  const actions = useMemo(
    () => ({
      // Add refresh logic if needed
    }),
    [],
  );

  return { status: "success" as DashboardStatus, vm, actions };
}
