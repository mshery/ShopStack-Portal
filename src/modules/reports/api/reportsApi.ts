import { httpClient } from "@/core/api/httpClient";
import { endpoints } from "@/core/config/endpoints";
import type { ApiResponse } from "@/shared/types/api";

export interface AnalyticsData {
  // Sales
  totalSales: number;
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  totalProfit: number;
  profitMargin: number;

  // Inventory
  totalProducts: number;
  inStockProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalInventoryValue: number;
  totalRetailValue: number;
  potentialProfit: number;

  // Lists
  bestSellers: {
    name: string;
    quantity: number;
    revenue: number;
  }[];
  monthlySales: {
    month: string;
    revenue: number;
    profit: number;
  }[];

  // Cash Revenue
  cashSales: number;
  cashRevenue: number;
}

export const reportsApi = {
  getAnalytics: async (): Promise<AnalyticsData> => {
    const response = await httpClient.get<ApiResponse<AnalyticsData>>(
      endpoints.tenant.REPORTS,
    );
    return response.data.data;
  },
};
