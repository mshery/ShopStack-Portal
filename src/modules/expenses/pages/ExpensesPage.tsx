import { useState } from "react";
import Pagination from "@/shared/components/feedback/Pagination";
import { Button } from "@/shared/components/ui/button";
import AddExpenseModal from "../components/AddExpenseModal";
import { useExpensesScreen } from "../hooks/useExpensesScreen";
import { useTenantCurrency } from "@/modules/tenant";
import {
  Receipt,
  DollarSign,
  AlertTriangle,
  Building2,
  Plus,
  Package,
  Truck,
  FileText,
} from "lucide-react";
import { PageSkeleton } from "@/shared/components/skeletons/PageSkeleton";

export default function ExpensesPage() {
  const { status, vm, actions } = useExpensesScreen();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { formatPrice } = useTenantCurrency();

  if (status === "loading") {
    return <PageSkeleton />;
  }

  // Helper to get expense type badge styles
  const getExpenseTypeBadge = (expenseType: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      operational: {
        bg: "bg-blue-50 dark:bg-blue-500/10",
        text: "text-blue-600 dark:text-blue-400",
      },
      purchase_order: {
        bg: "bg-purple-50 dark:bg-purple-500/10",
        text: "text-purple-600 dark:text-purple-400",
      },
      inventory_loss: {
        bg: "bg-red-50 dark:bg-red-500/10",
        text: "text-red-600 dark:text-red-400",
      },
      vendor_payment: {
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
      },
    };
    return (
      styles[expenseType] || {
        bg: "bg-gray-100 dark:bg-gray-500/10",
        text: "text-gray-600 dark:text-gray-400",
      }
    );
  };

  if (status === "error" && !vm.expenses.length)
    return (
      <div className="p-6 text-center text-red-500">
        Error loading expenses. Please try refreshing.
      </div>
    );

  const getSummaryValue = (type: string, categoryFallback?: string) => {
    const typeStat = vm.summary.byType.find((s) => s.expenseType === type);
    const typeAmount = typeStat?._sum.amount || 0;

    // If we have a type match, use it.
    // If not (0), and we have a category fallback, check that.
    // This helps catch misclassified expenses (e.g. Category "Vendor Payment" but Type "Operational")
    if (typeAmount === 0 && categoryFallback) {
      const catStat = vm.summary.byCategory.find(
        (s) => s.category === categoryFallback,
      );
      return catStat?._sum.amount || 0;
    }

    return typeAmount;
  };

  return (
    <>
      <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Expenses
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Operational costs, vendor payments, and inventory losses
            </p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2 bg-brand-500 hover:bg-brand-600"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Expenses Count */}
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Expenses
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {vm.summary.totalCount}
            </p>
          </div>

          {/* Total Amount */}
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Amount
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatPrice(vm.summary.totalAmount)}
            </p>
          </div>

          {/* Inventory Losses */}
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Inventory Losses
            </p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {formatPrice(getSummaryValue("inventory_loss", "Inventory Loss"))}
            </p>
          </div>

          {/* Vendor Payments */}
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Vendor Payments
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {formatPrice(getSummaryValue("vendor_payment", "vendor_payment"))}
            </p>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Links
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {vm.isEmpty ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center text-gray-500 dark:text-gray-400"
                    >
                      <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p className="font-medium">No expenses recorded</p>
                      <p className="text-sm mt-1">
                        Click "Add Expense" to record your first expense
                      </p>
                    </td>
                  </tr>
                ) : (
                  vm.expenses.map((expense) => {
                    const typeBadge = getExpenseTypeBadge(expense.expenseType);
                    const hasRelations =
                      expense.relatedProductId ||
                      expense.relatedVendorId ||
                      expense.relatedPurchaseId;

                    return (
                      <tr
                        key={expense.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-white text-sm">
                            {expense.description}
                          </div>
                          {expense.vendor && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <Building2 className="w-3 h-3" />
                              <span>{expense.vendor}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          <span className="capitalize">
                            {expense.category.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg ${typeBadge.bg} ${typeBadge.text}`}
                          >
                            {expense.expenseType.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {hasRelations ? (
                            <div className="flex flex-wrap gap-2">
                              {expense.relatedProductId && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300">
                                  <Package className="w-3 h-3" />
                                  Product
                                </span>
                              )}
                              {expense.relatedVendorId && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300">
                                  <Truck className="w-3 h-3" />
                                  Vendor
                                </span>
                              )}
                              {expense.relatedPurchaseId && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300">
                                  <FileText className="w-3 h-3" />
                                  PO
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <span className="text-base font-bold text-gray-900 dark:text-white">
                            {formatPrice(expense.amount)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {vm.totalPages > 1 && (
            <div className="border-t border-gray-100 dark:border-gray-700/50">
              <Pagination
                currentPage={vm.currentPage}
                totalPages={vm.totalPages}
                totalItems={vm.totalItems}
                itemsPerPage={vm.itemsPerPage}
                onPageChange={actions.setPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}
