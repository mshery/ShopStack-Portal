import { useMemo } from "react";
import { useTenantsStore } from "@/stores/tenants.store";
import { useUsersStore } from "@/stores/users.store";
import { usePOSStore } from "@/stores/pos.store";
import { useActivityLogsStore } from "@/stores/activityLogs.store";
import type { AsyncStatus } from "@/types";

/**
 * usePlatformDashboardLogic - Platform dashboard screen hook
 */
export function usePlatformDashboardLogic() {
  const { tenants } = useTenantsStore();
  const { tenantUsers } = useUsersStore();
  const { sales } = usePOSStore();
  const { platformLogs } = useActivityLogsStore();

  const status: AsyncStatus = "success";

  const vm = useMemo(() => {
    const activeTenants = tenants.filter((t) => t.status === "active");
    const totalUsers = tenantUsers.length;
    const totalSales = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    const recentLogs = platformLogs.slice(0, 5);

    return {
      totalTenants: tenants.length,
      activeTenants: activeTenants.length,
      totalUsers,
      totalSales,
      recentLogs,
    };
  }, [tenants, tenantUsers, sales, platformLogs]);

  const actions = useMemo(() => ({}), []);

  return { status, vm, actions };
}
