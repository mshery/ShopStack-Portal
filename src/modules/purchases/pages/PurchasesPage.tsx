import { usePurchasesScreen } from "@/modules/purchases/hooks/usePurchasesScreen";
import { useTenantCurrency } from "@/modules/tenant";
import type { Purchase } from "@/shared/types/models";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/shared/components/ui/table";
import { Plus, FileText, CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { useState } from "react";
import { formatDateTime } from "@/shared/utils/format";
import AddPurchaseModal from "../components/AddPurchaseModal";
import { Link } from "react-router-dom";
import { TableSkeleton } from "@/shared/components/skeletons/TableSkeleton";
import PageBreadcrumb from "@/shared/components/feedback/PageBreadcrumb";
import Pagination from "@/shared/components/feedback/Pagination";

export default function PurchasesPage() {
  const { status, vm, actions } = usePurchasesScreen();
  const { formatPrice } = useTenantCurrency();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Helper to get vendor name (using store for now as it's likely cached/available,
  // or we could fetch efficiently. For list view, ideally the API returns vendor name)
  // The API DOES return vendor object in the list items!

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "received":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Received
          </Badge>
        );
      case "ordered":
        return (
          <Badge
            variant="outline"
            className="bg-orange-50 text-orange-700 border-orange-200"
          >
            Ordered
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Purchase Orders" />
        <TableSkeleton rows={10} columns={5} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="p-8">
        <EmptyState
          title="Something went wrong"
          description="Failed to load purchases. Please try again."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Purchase Orders
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage supplier orders and procurement
          </p>
        </div>
        <Button
          className="gap-2 rounded-xl bg-brand-600 hover:bg-brand-700"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New Purchase Order
        </Button>
      </div>

      <Card className="rounded-2xl border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <CardContent className="p-0">
          {vm.isEmpty ? (
            <div className="p-8">
              <EmptyState
                title="No purchases recorded"
                description="Manage your stock by creating purchase orders"
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="border-y border-gray-100 dark:border-gray-800">
                    <TableRow>
                      <TableCell
                        isHeader
                        className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider whitespace-nowrap"
                      >
                        PO Number
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider"
                      >
                        Vendor
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider"
                      >
                        Total Cost
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider"
                      >
                        Status
                      </TableCell>
                      <TableCell
                        isHeader
                        className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider"
                      >
                        Date
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vm.purchases.map((purchase) => (
                      <TableRow
                        key={purchase.id}
                        className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] cursor-pointer"
                      >
                        <TableCell className="px-6 py-4">
                          <Link
                            to={`/tenant/purchases/${purchase.id}`}
                            className="flex items-center gap-2"
                          >
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="font-bold text-brand-600 dark:text-brand-400">
                              {purchase.purchaseNumber}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Link to={`/tenant/purchases/${purchase.id}`}>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {(
                                purchase as Purchase & {
                                  vendor?: { name: string };
                                }
                              ).vendor?.name || "Unknown Vendor"}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Link
                            to={`/tenant/purchases/${purchase.id}`}
                            className="font-bold text-gray-900 dark:text-white"
                          >
                            {formatPrice(purchase.totalCost)}
                          </Link>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Link
                            to={`/tenant/purchases/${purchase.id}`}
                            className="inline-block"
                          >
                            {getStatusBadge(purchase.status)}
                          </Link>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Link
                            to={`/tenant/purchases/${purchase.id}`}
                            className="text-xs text-gray-500"
                          >
                            <div className="flex flex-col">
                              <span>
                                {formatDateTime(purchase.purchaseDate)}
                              </span>
                              {purchase.receivedDate && (
                                <span className="text-[10px] text-green-600 dark:text-green-500 flex items-center gap-0.5">
                                  <CheckCircle2 className="h-2 w-2" /> Received:{" "}
                                  {formatDateTime(purchase.receivedDate)}
                                </span>
                              )}
                            </div>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {vm.pagination.totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                  <Pagination
                    currentPage={vm.pagination.page}
                    totalPages={vm.pagination.totalPages}
                    totalItems={vm.pagination.total}
                    itemsPerPage={10}
                    onPageChange={actions.setPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Purchase Modal */}
      {isAddModalOpen && (
        <AddPurchaseModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            /* invalidate query handled in modal if refactored, or here */
          }}
        />
      )}
    </div>
  );
}
