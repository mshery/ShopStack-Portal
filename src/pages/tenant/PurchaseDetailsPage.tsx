import { Link } from "react-router-dom";
import { usePurchaseDetailsScreen } from "@/hooks/usePurchaseDetailsScreen";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { DetailPageHeader } from "@/components/common/DetailPageHeader";
import { InfoSection, InfoRow } from "@/components/common/InfoSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EditPurchaseModal from "@/components/tenant/EditPurchaseModal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  FileText,
  Package,
  DollarSign,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { formatDateTime } from "@/utils/format";
import { useTenantCurrency } from "@/hooks/useTenantCurrency";

export default function PurchaseDetailsPage() {
  const { status, vm, actions } = usePurchaseDetailsScreen();
  const { formatPrice } = useTenantCurrency();

  // Error/Not found state
  if (status === "error" || !vm.purchase) {
    return (
      <>
        <PageBreadcrumb pageTitle="Purchase Order Details" />
        <div className="flex flex-col items-center justify-center h-96">
          <FileText className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Purchase Order Not Found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The purchase order you're looking for doesn't exist or has been
            removed.
          </p>
          <Link to="/tenant/purchases">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Purchases
            </Button>
          </Link>
        </div>
      </>
    );
  }

  const { purchase, vendor, items, totals } = vm;

  const getStatusBadge = () => {
    switch (purchase.status) {
      case "received":
        return (
          <Badge
            variant="outline"
            className="gap-1.5 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Received
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="gap-1.5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
          >
            <Clock className="h-3.5 w-3.5" />
            Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="gap-1.5 bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
          >
            <XCircle className="h-3.5 w-3.5" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{purchase.status}</Badge>;
    }
  };

  const purchaseIcon = <FileText className="w-10 h-10 text-brand-500" />;

  return (
    <>
      <PageBreadcrumb pageTitle="Purchase Order Details" />

      {/* Header with back button, title, status, and actions */}
      <DetailPageHeader
        backTo="/tenant/purchases"
        backLabel="Back to Purchases"
        title={purchase.purchaseNumber}
        status={getStatusBadge()}
        image={purchaseIcon}
        actions={[
          { label: "Edit", icon: Pencil, onClick: actions.openEdit },
          {
            label: "Delete",
            icon: Trash2,
            onClick: actions.openDelete,
            variant: "danger",
          },
        ]}
      />

      {/* Notes section if available */}
      {purchase.notes && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Notes:{" "}
            </span>
            {purchase.notes}
          </p>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Order Items */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-brand-500" />
              Order Items
            </h2>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-200 dark:hover:border-brand-800 transition-colors bg-gray-50/50 dark:bg-gray-800/20"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 overflow-hidden rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                      {item.product?.imageUrl ? (
                        <img
                          src={item.product?.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-7 w-7 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {formatPrice(item.costPrice)} × {item.quantity} units
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Summary, Vendor, Timeline */}
        <div className="space-y-6">
          {/* Cost Summary Card */}
          <InfoSection icon={DollarSign} title="Cost Summary" gridCols={1}>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Items
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {items.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Total Units
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {totals.units}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  Total Cost
                </span>
                <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                  {formatPrice(totals.cost)}
                </span>
              </div>
            </div>
          </InfoSection>

          {/* Vendor Card */}
          <InfoSection icon={User} title="Vendor" gridCols={1}>
            <div>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {vendor?.name || "Unknown Vendor"}
              </p>
              {vendor?.email && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {vendor.email}
                </p>
              )}
              {vendor?.phone && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {vendor.phone}
                </p>
              )}
            </div>
          </InfoSection>

          {/* Timeline Card */}
          <InfoSection icon={Calendar} title="Timeline" gridCols={1}>
            <InfoRow
              label="Purchase Date"
              value={formatDateTime(purchase.purchaseDate)}
            />
            {purchase.receivedDate && (
              <InfoRow
                label="Received Date"
                value={
                  <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {formatDateTime(purchase.receivedDate)}
                  </span>
                }
              />
            )}
            <InfoRow
              label="Created"
              value={formatDateTime(purchase.createdAt)}
            />
          </InfoSection>
        </div>
      </div>

      {/* Edit Modal */}
      {vm.isEditModalOpen && (
        <EditPurchaseModal
          purchase={purchase}
          isOpen={vm.isEditModalOpen}
          onClose={actions.closeEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={vm.isDeleteModalOpen}
        onClose={actions.closeDelete}
        onConfirm={actions.confirmDelete}
        title="Delete Purchase Order"
        message="Are you sure you want to delete this purchase order? This action cannot be undone."
        itemName={purchase.purchaseNumber}
      />
    </>
  );
}
