import { usePurchasesStore } from "@/modules/purchases";
import { useVendorsStore } from "@/modules/vendors";
import { useAuthStore } from "@/modules/auth";
import { useTenantCurrency } from "@/modules/tenant";
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
import { Plus, FileText, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { useMemo, useState } from "react";
import { formatDateTime } from "@/shared/utils/format";
import AddPurchaseModal from "../components/AddPurchaseModal";
import EditPurchaseModal from "../components/EditPurchaseModal";
import DeleteConfirmationModal from "@/shared/components/feedback/DeleteConfirmationModal";
import type { Purchase } from "@/shared/types/models";
import { Link } from "react-router-dom";

export default function PurchasesPage() {
  const { purchases, removePurchase } = usePurchasesStore();
  const { vendors } = useVendorsStore();
  const { activeTenantId } = useAuthStore();
  const { formatPrice } = useTenantCurrency();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null,
  );
  const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(
    null,
  );

  const tenantPurchases = useMemo(() => {
    return purchases.filter((p) => p.tenant_id === activeTenantId).reverse();
  }, [purchases, activeTenantId]);

  const getVendorName = (vendorId: string) => {
    return vendors.find((v) => v.id === vendorId)?.name || "Unknown Vendor";
  };

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
          {tenantPurchases.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No purchases recorded"
                description="Manage your stock by creating purchase orders"
              />
            </div>
          ) : (
            <Table>
              <TableHeader className="border-y border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-start text-xs uppercase tracking-wider"
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
                  <TableCell
                    isHeader
                    className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-end text-xs uppercase tracking-wider"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenantPurchases.map((purchase) => (
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
                          {getVendorName(purchase.vendorId)}
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
                          <span>{formatDateTime(purchase.purchaseDate)}</span>
                          {purchase.receivedDate && (
                            <span className="text-[10px] text-green-600 dark:text-green-500 flex items-center gap-0.5">
                              <CheckCircle2 className="h-2 w-2" /> Received:{" "}
                              {formatDateTime(purchase.receivedDate)}
                            </span>
                          )}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedPurchase(purchase);
                          }}
                          className="p-2 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                          title="Edit purchase"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPurchaseToDelete(purchase);
                          }}
                          className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete purchase"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Purchase Modal */}
      <AddPurchaseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Purchase Modal */}
      {selectedPurchase && (
        <EditPurchaseModal
          purchase={selectedPurchase}
          isOpen={!!selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!purchaseToDelete}
        onClose={() => setPurchaseToDelete(null)}
        onConfirm={() => {
          if (purchaseToDelete) {
            removePurchase(purchaseToDelete.id);
          }
        }}
        title="Delete Purchase Order"
        message="Are you sure you want to delete this purchase order? This action cannot be undone."
        itemName={purchaseToDelete?.purchaseNumber}
      />
    </div>
  );
}
