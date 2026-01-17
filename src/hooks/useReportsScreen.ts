import { useMemo } from "react";
import { usePOSStore } from "@/stores/pos.store";
import { useProductsStore } from "@/stores/products.store";
import type { AsyncStatus } from "@/types";

/**
 * Reports Screen Hook
 * Provides analytics and reporting data
 */
export function useReportsScreen() {
  const { sales, refunds } = usePOSStore();
  const { products } = useProductsStore();

  const status: AsyncStatus = "success";

  // Calculate analytics
  const vm = useMemo(() => {
    // Sales metrics
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.grandTotal, 0);
    const totalRefunds = refunds.reduce(
      (sum, refund) => sum + refund.refundTotal,
      0,
    );
    const netRevenue = totalRevenue - totalRefunds;

    // Profit calculation
    const totalProfit = sales.reduce((sum, sale) => {
      const saleProfit = sale.lineItems.reduce((itemSum, item) => {
        const profit = item.subtotal - item.costPriceSnapshot * item.quantity;
        return itemSum + profit;
      }, 0);
      return sum + saleProfit;
    }, 0);

    const profitMargin =
      totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Inventory metrics
    const totalProducts = products.length;
    const inStockProducts = products.filter(
      (p) => p.status === "in_stock",
    ).length;
    const lowStockProducts = products.filter(
      (p) => p.status === "low_stock",
    ).length;
    const outOfStockProducts = products.filter(
      (p) => p.status === "out_of_stock",
    ).length;

    const totalInventoryValue = products.reduce(
      (sum, p) => sum + p.currentStock * p.costPrice,
      0,
    );
    const totalRetailValue = products.reduce(
      (sum, p) => sum + p.currentStock * p.unitPrice,
      0,
    );

    // Best sellers by quantity
    const productSales = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();
    sales.forEach((sale) => {
      sale.lineItems.forEach((item) => {
        const existing = productSales.get(item.productId) || {
          name: item.nameSnapshot,
          quantity: 0,
          revenue: 0,
        };
        productSales.set(item.productId, {
          name: item.nameSnapshot,
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.subtotal,
        });
      });
    });

    const bestSellers = Array.from(productSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Payment method breakdown - Cash only
    const cashSales = sales.length; // All sales are cash
    const cashRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);

    // Monthly sales (last 12 months)
    const monthlySales = new Map<string, number>();
    const monthlyProfit = new Map<string, number>();

    sales.forEach((sale) => {
      const month = new Date(sale.createdAt).toISOString().slice(0, 7); // YYYY-MM
      monthlySales.set(month, (monthlySales.get(month) || 0) + sale.grandTotal);

      const saleProfit = sale.lineItems.reduce((sum, item) => {
        return sum + (item.subtotal - item.costPriceSnapshot * item.quantity);
      }, 0);
      monthlyProfit.set(month, (monthlyProfit.get(month) || 0) + saleProfit);
    });

    return {
      // Sales metrics
      totalSales: sales.length,
      totalRevenue,
      totalRefunds,
      netRevenue,
      totalProfit,
      profitMargin,

      // Inventory metrics
      totalProducts,
      inStockProducts,
      lowStockProducts,
      outOfStockProducts,
      totalInventoryValue,
      totalRetailValue,
      potentialProfit: totalRetailValue - totalInventoryValue,

      // Best sellers
      bestSellers,

      // Payment methods - Cash only
      cashSales,
      cashRevenue,

      // Monthly data
      monthlySales: Array.from(monthlySales.entries())
        .map(([month, revenue]) => ({
          month,
          revenue,
          profit: monthlyProfit.get(month) || 0,
        }))
        .sort((a, b) => a.month.localeCompare(b.month)),
    };
  }, [sales, refunds, products]);

  return { status, vm };
}
