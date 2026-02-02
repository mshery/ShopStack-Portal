import { useMemo } from "react";
import { useReportsFetch } from "../api/queries";
import type { AsyncStatus } from "@/shared/types/models";

/**
 * Reports Screen Hook
 * Provides analytics and reporting data from server
 */
export function useReportsScreen() {
  const { data, isLoading, isError } = useReportsFetch();

  const status: AsyncStatus = isLoading
    ? "loading"
    : isError
      ? "error"
      : "success";

  const vm = useMemo(() => {
    if (!data) {
      return {
        totalSales: 0,
        totalRevenue: 0,
        totalRefunds: 0,
        netRevenue: 0,
        totalProfit: 0,
        profitMargin: 0,
        totalProducts: 0,
        inStockProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        totalInventoryValue: 0,
        totalRetailValue: 0,
        potentialProfit: 0,
        bestSellers: [],
        cashSales: 0,
        cashRevenue: 0,
        monthlySales: [],
      };
    }
    return data;
  }, [data]);

  return { status, vm };
}
