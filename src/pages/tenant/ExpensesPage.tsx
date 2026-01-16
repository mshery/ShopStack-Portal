import { useMemo, useState } from "react";
import Pagination from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import AddExpenseModal from "@/components/tenant/AddExpenseModal";
import { useExpensesStore } from "@/stores/expenses.store";
import { useAuthStore } from "@/stores/auth.store";
import { useVendorsStore } from "@/stores/vendors.store";
import { useProductsStore } from "@/stores/products.store";
import { usePurchasesStore } from "@/stores/purchases.store";
import { useTenantCurrency } from "@/hooks/useTenantCurrency";
import type { TenantUser } from "@/types";
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

const ITEMS_PER_PAGE = 10;

export default function ExpensesPage() {
  const { expenses } = useExpensesStore();
  const { activeTenantId, currentUser } = useAuthStore();
  const { vendors } = useVendorsStore();
  const { products } = useProductsStore();
  const { purchases } = usePurchasesStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const isOwner = (currentUser as TenantUser)?.role === "owner";
  const { formatPrice } = useTenantCurrency();

  // Filter expenses for current tenant
  const tenantExpenses = useMemo(() => {
    return expenses
      .filter((e) => e.tenant_id === activeTenantId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, activeTenantId]);

  // Pagination
  const totalPages = Math.ceil(tenantExpenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return tenantExpenses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [tenantExpenses, currentPage]);

  // Helper to get vendor name
  const getVendorName = (vendorId: string | null) => {
    if (!vendorId) return null;
    return vendors.find((v) => v.id === vendorId)?.name || null;
  };

  // Helper to get product name
  const getProductName = (productId: string | null) => {
    if (!productId) return null;
    return products.find((p) => p.id === productId)?.name || null;
  };

  // Helper to get purchase number
  const getPurchaseNumber = (purchaseId: string | null) => {
    if (!purchaseId) return null;
    return purchases.find((p) => p.id === purchaseId)?.purchaseNumber || null;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get badge styles for expense type
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

  // Calculate stats
  const stats = useMemo(() => {
    const totalAmount = tenantExpenses.reduce((sum, e) => sum + e.amount, 0);
    const inventoryLosses = tenantExpenses
      .filter((e) => e.expenseType === "inventory_loss")
      .reduce((sum, e) => sum + e.amount, 0);
    const vendorPayments = tenantExpenses
      .filter((e) => e.expenseType === "vendor_payment")
      .reduce((sum, e) => sum + e.amount, 0);

    return { totalAmount, inventoryLosses, vendorPayments };
  }, [tenantExpenses]);

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
          {isOwner && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2 bg-brand-500 hover:bg-brand-600"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
          )}
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
              {tenantExpenses.length}
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
              {formatPrice(stats.totalAmount)}
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
              {formatPrice(stats.inventoryLosses)}
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
              {formatPrice(stats.vendorPayments)}
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
                {paginatedExpenses.length === 0 ? (
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
                  paginatedExpenses.map((expense) => {
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
                          {formatDate(expense.date)}
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
                                  {getProductName(expense.relatedProductId)}
                                </span>
                              )}
                              {expense.relatedVendorId && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300">
                                  <Truck className="w-3 h-3" />
                                  {getVendorName(expense.relatedVendorId)}
                                </span>
                              )}
                              {expense.relatedPurchaseId && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300">
                                  <FileText className="w-3 h-3" />
                                  {getPurchaseNumber(expense.relatedPurchaseId)}
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
          {totalPages > 1 && (
            <div className="border-t border-gray-100 dark:border-gray-700/50">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={tenantExpenses.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
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
