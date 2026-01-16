import { useSalesHistoryLogic } from "@/logic/pos/useSalesHistoryLogic";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Pagination from "@/components/common/Pagination";
import { CreditCard, Banknote, Undo2 } from "lucide-react";
import { formatDateTime } from "@/utils/format";
import { useTenantCurrency } from "@/hooks/useTenantCurrency";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import type { Sale } from "@/types";

const ITEMS_PER_PAGE = 10;

export default function SalesHistoryPage() {
  const { vm, actions } = useSalesHistoryLogic();
  const { formatPrice } = useTenantCurrency();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [refundsPage, setRefundsPage] = useState(1);

  const handleRefundSale = async (sale: Sale) => {
    if (
      confirm(
        `Are you sure you want to refund order #${sale.number}? This will restore stock for all items.`,
      )
    ) {
      setIsProcessing(sale.id);
      const refundItems = sale.lineItems.map((item) => ({
        productId: item.productId,
        productName: item.nameSnapshot,
        quantity: item.quantity,
        refundAmount: item.subtotal,
      }));

      actions.refund(sale.id, refundItems, "Customer Return");
      setIsProcessing(null);
    }
  };

  // Pagination for orders
  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return vm.sales.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [vm.sales, currentPage]);

  const totalOrderPages = Math.ceil(vm.sales.length / ITEMS_PER_PAGE);

  // Pagination for refunds
  const paginatedRefunds = useMemo(() => {
    const startIndex = (refundsPage - 1) * ITEMS_PER_PAGE;
    return vm.refunds.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [vm.refunds, refundsPage]);

  const totalRefundPages = Math.ceil(vm.refunds.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Orders
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Completed sales and transaction records
          </p>
        </div>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-4">
          <TabsTrigger value="orders">
            All Orders ({vm.sales.length})
          </TabsTrigger>
          <TabsTrigger value="refunds">
            Refunds & Returns ({vm.refunds.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <CardHeader className="px-6 py-5">
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Order History
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                View all completed sales
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {vm.sales.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    title="No orders yet"
                    description="Completed orders will appear here"
                  />
                </div>
              ) : (
                <>
                  <div className="max-w-full overflow-x-auto">
                    <Table>
                      <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                          <TableCell
                            isHeader
                            className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider"
                          >
                            Order ID
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider"
                          >
                            Customer
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider"
                          >
                            Payment
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider"
                          >
                            Total
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider"
                          >
                            Status
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-end text-xs uppercase tracking-wider"
                          >
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {paginatedSales.map((sale) => {
                          const isRefunded = vm.refunds.some(
                            (r) => r.originalSaleId === sale.id,
                          );

                          return (
                            <TableRow
                              key={sale.id}
                              className={`hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors ${isRefunded ? "opacity-50 grayscale" : ""}`}
                            >
                              <TableCell className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="text-xs font-mono font-bold text-brand-500 uppercase">
                                    #{sale.number || sale.id.split("-").pop()}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-medium mt-0.5">
                                    {formatDateTime(sale.createdAt)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-4">
                                <Badge
                                  variant="outline"
                                  className="text-[10px] py-0"
                                >
                                  {sale.customerId === "walk-in"
                                    ? "Walk-in"
                                    : "Customer"}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-6 py-4">
                                <div className="flex items-center gap-1.5 text-sm uppercase font-semibold text-gray-500 dark:text-gray-400">
                                  {sale.paymentMethod === "CASH" ? (
                                    <Banknote className="h-3.5 w-3.5 text-emerald-600" />
                                  ) : (
                                    <CreditCard className="h-3.5 w-3.5 text-brand-500" />
                                  )}
                                  {sale.paymentMethod}
                                </div>
                              </TableCell>
                              <TableCell className="px-6 py-4 font-bold dark:text-white">
                                {formatPrice(sale.grandTotal)}
                              </TableCell>
                              <TableCell className="px-6 py-4">
                                <Badge
                                  variant="outline"
                                  className={
                                    isRefunded
                                      ? "bg-rose-50 text-rose-700 border-rose-200"
                                      : "bg-green-50 text-green-700 border-green-200"
                                  }
                                >
                                  {isRefunded ? "Refunded" : "Completed"}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-6 py-4 text-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1.5 text-xs hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-900/20"
                                  onClick={() => handleRefundSale(sale)}
                                  disabled={
                                    isProcessing === sale.id || isRefunded
                                  }
                                >
                                  <Undo2 className="h-3 w-3" />
                                  {isRefunded ? "Refunded" : "Refund"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  {/* Pagination */}
                  {totalOrderPages > 1 && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalOrderPages}
                        totalItems={vm.sales.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds">
          <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <CardHeader className="px-6 py-5">
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Refund Records
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                History of customer returns and refunds
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {vm.refunds.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    title="No refunds yet"
                    description="When you process returns, they will appear here"
                  />
                </div>
              ) : (
                <>
                  <div className="max-w-full overflow-x-auto">
                    <Table>
                      <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                          <TableCell
                            isHeader
                            className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider"
                          >
                            Refund ID
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider"
                          >
                            Amount
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider"
                          >
                            Reason
                          </TableCell>
                          <TableCell
                            isHeader
                            className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider"
                          >
                            Date
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {paginatedRefunds.map((refund) => (
                          <TableRow
                            key={refund.id}
                            className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors"
                          >
                            <TableCell className="px-6 py-4">
                              <span className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400 uppercase">
                                #
                                {refund.refundNumber ||
                                  refund.id.split("-").pop()}
                              </span>
                            </TableCell>
                            <TableCell className="px-6 py-4 font-bold text-rose-600 dark:text-rose-400">
                              -{formatPrice(refund.refundTotal)}
                            </TableCell>
                            <TableCell className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {refund.reason}
                            </TableCell>
                            <TableCell className="px-6 py-4 text-xs font-medium dark:text-gray-300">
                              {formatDateTime(refund.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {/* Pagination */}
                  {totalRefundPages > 1 && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                      <Pagination
                        currentPage={refundsPage}
                        totalPages={totalRefundPages}
                        totalItems={vm.refunds.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setRefundsPage}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
