import { useMemo } from "react";
import { useDashboardStatsFetch } from "../api/queries";
import { formatCurrency } from "@/shared/utils/format";

export type DashboardStatus = "loading" | "error" | "empty" | "success";

/**
 * Platform Dashboard Screen Hook
 *
 * Fetches all dashboard data from API via centralized /platform/stats endpoint.
 * The stats API provides all aggregated data needed for the dashboard:
 * - metrics (tenant count, user count, etc.)
 * - recentActivity (logs)
 * - planDistribution (for pie chart)
 * - tenantGrowth (for area chart)
 */
export function usePlatformDashboardScreen() {
  // Fetch aggregated stats - this is the ONLY API call needed for the dashboard
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useDashboardStatsFetch();

  const metrics = useMemo(() => {
    if (!stats) return [];
    return stats.metrics.map((m) => ({
      ...m,
      value:
        typeof m.value === "number" && m.title.includes("Revenue")
          ? formatCurrency(m.value)
          : m.value,
    }));
  }, [stats]);

  const recentLogs = useMemo(() => stats?.recentActivity || [], [stats]);
  const planDistribution = useMemo(
    () => stats?.planDistribution || [],
    [stats],
  );
  const tenantGrowth = useMemo(() => stats?.tenantGrowth || [], [stats]);

  const status: DashboardStatus = statsLoading
    ? "loading"
    : statsError
      ? "error"
      : !stats
        ? "empty"
        : "success";

  // View Model - only includes data from stats API
  const vm = useMemo(
    () => ({
      metrics,
      recentLogs,
      planDistribution,
      tenantGrowth,
    }),
    [metrics, recentLogs, planDistribution, tenantGrowth],
  );

  const actions = useMemo(() => ({}), []);

  return { status, vm, actions };
}
