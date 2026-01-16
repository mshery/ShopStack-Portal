import { useMemo, useState } from "react";
import Pagination from "@/components/common/Pagination";
import { useInventoryStore } from "@/stores/inventory.store";
import { useAuthStore } from "@/stores/auth.store";
import { useUsersStore } from "@/stores/users.store";
import { useTenantCurrency } from "@/hooks/useTenantCurrency";
import {
  ArrowDownRight,
  ArrowUpRight,
  Package,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Link2,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function InventoryPage() {
  const { inventoryAdjustments } = useInventoryStore();
  const { activeTenantId } = useAuthStore();
  const { tenantUsers } = useUsersStore();
  const { formatPrice } = useTenantCurrency();

  const [currentPage, setCurrentPage] = useState(1);

  // Filter adjustments for current tenant
  const tenantAdjustments = useMemo(() => {
    return inventoryAdjustments
      .filter((adj) => adj.tenant_id === activeTenantId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [inventoryAdjustments, activeTenantId]);

  // Pagination
  const totalPages = Math.ceil(tenantAdjustments.length / ITEMS_PER_PAGE);
  const paginatedAdjustments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return tenantAdjustments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [tenantAdjustments, currentPage]);

  // Helper to get user name
  const getUserName = (userId: string) => {
    return tenantUsers.find((u) => u.id === userId)?.name || "Unknown";
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get badge styles for reason
  const getReasonBadge = (reason: string) => {
    const styles: Record<
      string,
      { bg: string; text: string; icon?: React.ReactNode }
    > = {
      damaged: {
        bg: "bg-orange-50 dark:bg-orange-500/10",
        text: "text-orange-600 dark:text-orange-400",
        icon: <AlertTriangle className="w-3 h-3" />,
      },
      theft: {
        bg: "bg-red-50 dark:bg-red-500/10",
        text: "text-red-600 dark:text-red-400",
        icon: <AlertTriangle className="w-3 h-3" />,
      },
      count_correction: {
        bg: "bg-amber-50 dark:bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
        icon: <RotateCcw className="w-3 h-3" />,
      },
      return: {
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        icon: <ArrowDownRight className="w-3 h-3" />,
      },
      restock: {
        bg: "bg-blue-50 dark:bg-blue-500/10",
        text: "text-blue-600 dark:text-blue-400",
        icon: <Package className="w-3 h-3" />,
      },
      expired: {
        bg: "bg-gray-100 dark:bg-gray-500/10",
        text: "text-gray-600 dark:text-gray-400",
      },
      other: {
        bg: "bg-gray-100 dark:bg-gray-500/10",
        text: "text-gray-600 dark:text-gray-400",
      },
    };
    return (
      styles[reason] || {
        bg: "bg-gray-100 dark:bg-gray-500/10",
        text: "text-gray-600 dark:text-gray-400",
      }
    );
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalCostImpact = tenantAdjustments.reduce(
      (sum, adj) => sum + adj.costImpact,
      0,
    );
    const totalLosses = tenantAdjustments
      .filter((adj) => adj.costImpact > 0)
      .reduce((sum, adj) => sum + adj.costImpact, 0);
    const totalGains = Math.abs(
      tenantAdjustments
        .filter((adj) => adj.costImpact < 0)
        .reduce((sum, adj) => sum + adj.costImpact, 0),
    );

    return { totalCostImpact, totalLosses, totalGains };
  }, [tenantAdjustments]);

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Stock Movements
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Track adjustments, returns, corrections, and losses
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Adjustments */}
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Adjustments
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {tenantAdjustments.length}
          </p>
        </div>

        {/* Net Cost Impact */}
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.totalCostImpact >= 0
                  ? "bg-red-50 dark:bg-red-500/10"
                  : "bg-emerald-50 dark:bg-emerald-500/10"
                }`}
            >
              {stats.totalCostImpact >= 0 ? (
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              ) : (
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Net Cost Impact
          </p>
          <p
            className={`text-2xl font-bold mt-1 ${stats.totalCostImpact >= 0
                ? "text-red-600 dark:text-red-400"
                : "text-emerald-600 dark:text-emerald-400"
              }`}
          >
            {stats.totalCostImpact >= 0 ? "-" : "+"}
            {formatPrice(Math.abs(stats.totalCostImpact))}
          </p>
        </div>

        {/* Total Losses */}
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Losses
          </p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {formatPrice(stats.totalLosses)}
          </p>
        </div>

        {/* Total Gains */}
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Gains
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatPrice(stats.totalGains)}
          </p>
        </div>
      </div>

      {/* Adjustments Table */}
      <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Impact
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  By
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {paginatedAdjustments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-gray-500 dark:text-gray-400"
                  >
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="font-medium">No inventory adjustments yet</p>
                    <p className="text-sm mt-1">
                      Adjustments will appear here when stock is modified
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedAdjustments.map((adjustment) => {
                  const reasonStyle = getReasonBadge(adjustment.reason);
                  return (
                    <tr
                      key={adjustment.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {formatDate(adjustment.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {adjustment.productName}
                        </div>
                        {adjustment.notes && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs truncate">
                            {adjustment.notes}
                          </div>
                        )}
                        {adjustment.relatedExpenseId && (
                          <div className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 mt-1.5">
                            <Link2 className="w-3 h-3" />
                            <span>Linked expense</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg ${reasonStyle.bg} ${reasonStyle.text}`}
                        >
                          {reasonStyle.icon}
                          {adjustment.reason.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 text-sm font-bold rounded-lg ${adjustment.quantityChange > 0
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                            }`}
                        >
                          {adjustment.quantityChange > 0 ? "+" : ""}
                          {adjustment.quantityChange}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        <span className="text-gray-400">
                          {adjustment.previousStock}
                        </span>
                        <span className="mx-1.5 text-gray-300 dark:text-gray-600">
                          →
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {adjustment.newStock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
                        <span
                          className={`font-semibold ${adjustment.costImpact > 0
                              ? "text-red-600 dark:text-red-400"
                              : adjustment.costImpact < 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-gray-500"
                            }`}
                        >
                          {adjustment.costImpact > 0
                            ? "-"
                            : adjustment.costImpact < 0
                              ? "+"
                              : ""}
                          {formatPrice(Math.abs(adjustment.costImpact))}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {getUserName(adjustment.createdBy)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-100 dark:border-gray-700/50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={tenantAdjustments.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
