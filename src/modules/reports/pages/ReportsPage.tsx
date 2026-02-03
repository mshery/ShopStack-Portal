import { useReportsScreen } from "../hooks/useReportsScreen";
import { useTenantCurrency } from "@/modules/tenant";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";
import MetricCard from "@/shared/components/dashboard/MetricCard";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/shared/components/ui/table";
import { DollarSign, TrendingUp, Package, Banknote } from "lucide-react";
import { PageSkeleton } from "@/shared/components/skeletons/PageSkeleton";
import PageBreadcrumb from "@/shared/components/feedback/PageBreadcrumb";

export default function ReportsPage() {
  const { status, vm } = useReportsScreen();
  const { formatPrice } = useTenantCurrency();

  if (status === "loading") {
    return <PageSkeleton />;
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Reports & Analytics" />

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Net Revenue"
          value={formatPrice(vm.netRevenue)}
          icon={<DollarSign className="size-6 text-brand-500" />}
        />
        <MetricCard
          title="Total Profit"
          value={formatPrice(vm.totalProfit)}
          icon={<TrendingUp className="size-6 text-emerald-500" />}
        />
        <MetricCard
          title="Profit Margin"
          value={`${vm.profitMargin.toFixed(1)}%`}
          icon={<TrendingUp className="size-6 text-indigo-500" />}
        />
        <MetricCard
          title="Total Sales"
          value={vm.totalSales.toString()}
          icon={<Package className="size-6 text-blue-500" />}
        />
      </div>

      {/* Inventory Metrics */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <CardHeader className="px-6 py-5">
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Inventory Overview
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
              Current stock status and valuation
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total Products
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {vm.totalProducts}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-600 dark:text-emerald-400">
                  In Stock
                </span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {vm.inStockProducts}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  Low Stock
                </span>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {vm.lowStockProducts}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-rose-600 dark:text-rose-400">
                  Out of Stock
                </span>
                <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                  {vm.outOfStockProducts}
                </span>
              </div>
              <div className="mt-4 border-t border-gray-200 dark:border-gray-800 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Inventory Value (Cost)
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPrice(vm.totalInventoryValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Retail Value
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPrice(vm.totalRetailValue)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">
                    Potential Profit
                  </span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatPrice(vm.potentialProfit)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods - Cash Only */}
        <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <CardHeader className="px-6 py-5">
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Payment Methods
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
              Cash payments only
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Cash Sales
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {vm.cashSales}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatPrice(vm.cashRevenue)}
                  </div>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-200 dark:border-gray-800 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Revenue
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPrice(vm.cashRevenue)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best Sellers */}
      <div className="mt-6">
        <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <CardHeader className="px-6 py-5">
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Top 10 Best Sellers
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
              Products ranked by quantity sold
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {vm.bestSellers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No sales data available
              </div>
            ) : (
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-6 py-3 font-medium text-gray-500 text-start text-xs uppercase tracking-wider"
                      >
                        Rank
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-6 py-3 font-medium text-gray-500 text-start text-xs uppercase tracking-wider"
                      >
                        Product
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-6 py-3 font-medium text-gray-500 text-start text-xs uppercase tracking-wider"
                      >
                        Quantity Sold
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-6 py-3 font-medium text-gray-500 text-start text-xs uppercase tracking-wider"
                      >
                        Revenue
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {vm.bestSellers.map((product, index) => (
                      <TableRow
                        key={index}
                        className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors"
                      >
                        <TableCell className="px-6 py-4">
                          <span className="text-sm font-bold text-brand-500">
                            #{index + 1}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {product.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {formatPrice(product.revenue)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Sales */}
      {vm.monthlySales.length > 0 && (
        <div className="mt-6">
          <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <CardHeader className="px-6 py-5">
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Monthly Performance
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                Revenue and profit by month
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-6 py-3 font-medium text-gray-500 text-start text-xs uppercase tracking-wider"
                      >
                        Month
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-6 py-3 font-medium text-gray-500 text-start text-xs uppercase tracking-wider"
                      >
                        Revenue
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-6 py-3 font-medium text-gray-500 text-start text-xs uppercase tracking-wider"
                      >
                        Profit
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-6 py-3 font-medium text-gray-500 text-start text-xs uppercase tracking-wider"
                      >
                        Margin
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {vm.monthlySales.map((month) => {
                      const margin =
                        month.revenue > 0
                          ? (month.profit / month.revenue) * 100
                          : 0;
                      return (
                        <TableRow
                          key={month.month}
                          className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors"
                        >
                          <TableCell className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {new Date(month.month + "-01").toLocaleDateString(
                                "en-US",
                                { year: "numeric", month: "long" },
                              )}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {formatPrice(month.revenue)}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                              {formatPrice(month.profit)}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {margin.toFixed(1)}%
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
