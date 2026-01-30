import { Link } from "react-router-dom";
import { useProductDetailsScreen } from "../hooks/useProductDetailsScreen";
import PageBreadcrumb from "@/shared/components/feedback/PageBreadcrumb";
import { DetailPageHeader } from "@/shared/components/feedback/DetailPageHeader";
import {
  InfoSection,
  InfoRow,
  StatDisplay,
} from "@/shared/components/feedback/InfoSection";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import EditProductModal from "../components/EditProductModal";
import DeleteConfirmationModal from "@/shared/components/feedback/DeleteConfirmationModal";
import { BoxCubeIcon } from "@/shared/components/ui/Icons";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Package,
  DollarSign,
  TrendingUp,
  Calendar,
  Info,
} from "lucide-react";
import { useTenantCurrency } from "@/modules/tenant";

export default function ProductDetailsPage() {
  const { status, vm, actions } = useProductDetailsScreen();
  const { formatPrice } = useTenantCurrency();

  // Loading state - show skeleton
  if (status === "loading") {
    return (
      <>
        <PageBreadcrumb pageTitle="Product Details" />
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error/Not found state
  if (status === "error" || !vm.product) {
    return (
      <>
        <PageBreadcrumb pageTitle="Product Details" />
        <div className="flex flex-col items-center justify-center h-96">
          <Package className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/tenant/products">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
      </>
    );
  }

  const { product, vendor, categoryName, brandName, profitInfo, stockWarning } =
    vm;

  const statusBadge = (
    <Badge
      color={
        product.status === "in_stock"
          ? "success"
          : product.status === "low_stock"
            ? "warning"
            : "error"
      }
      variant="light"
    >
      {product.status.replace("_", " ")}
    </Badge>
  );

  const productImage = product.imageUrl ? (
    <img
      src={product.imageUrl}
      alt={product.name}
      className="w-full h-full object-cover"
    />
  ) : (
    <BoxCubeIcon className="w-12 h-12 text-gray-400" />
  );

  return (
    <>
      <PageBreadcrumb pageTitle="Product Details" />

      {/* Header with back button, title, status, and actions */}
      <DetailPageHeader
        backTo="/tenant/products"
        backLabel="Back to Products"
        title={product.name}
        subtitle={`SKU: ${product.sku}`}
        status={statusBadge}
        image={productImage}
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

      {/* Description section if available */}
      {product.description && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-gray-600 dark:text-gray-400">
            {product.description}
          </p>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Product details */}
        <div className="lg:col-span-2">
          <InfoSection icon={Info} title="Product Information">
            <InfoRow label="Category" value={categoryName} />
            <InfoRow label="Brand" value={brandName} />
            <InfoRow
              label="Vendor"
              value={vendor?.name || "No vendor assigned"}
            />
            <InfoRow
              label="Created"
              value={new Date(product.createdAt).toLocaleDateString()}
            />
          </InfoSection>
        </div>

        {/* Right column - Pricing & Stock */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <InfoSection icon={DollarSign} title="Pricing" gridCols={1}>
            <StatDisplay
              label="Unit Price"
              value={formatPrice(product.unitPrice)}
              highlight
            />
            <InfoRow
              label="Cost Price"
              value={formatPrice(product.costPrice)}
            />
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Profit Margin
                </span>
              </div>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatPrice(profitInfo.margin)} ({profitInfo.percentage}%)
              </p>
            </div>
          </InfoSection>

          {/* Stock Card */}
          <InfoSection icon={Package} title="Inventory" gridCols={1}>
            <StatDisplay
              label="Current Stock"
              value={`${product.currentStock} units`}
            />
            <InfoRow
              label="Minimum Stock Level"
              value={`${product.minimumStock} units`}
            />
            {stockWarning && (
              <div className="p-3 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
                <p className="text-sm font-medium text-warning-700 dark:text-warning-400">
                  ⚠️ Stock level is at or below minimum threshold
                </p>
              </div>
            )}
          </InfoSection>

          {/* Timeline Card */}
          <InfoSection icon={Calendar} title="Timeline" gridCols={1}>
            <InfoRow
              label="Created"
              value={new Date(product.createdAt).toLocaleString()}
            />
            <InfoRow
              label="Last Updated"
              value={new Date(product.updatedAt).toLocaleString()}
            />
          </InfoSection>
        </div>
      </div>

      {/* Edit Modal */}
      {vm.isEditModalOpen && (
        <EditProductModal
          product={product}
          isOpen={vm.isEditModalOpen}
          onClose={actions.closeEdit}
          onUpdate={actions.updateProduct}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={vm.isDeleteModalOpen}
        onClose={actions.closeDelete}
        onConfirm={actions.confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        itemName={product.name}
      />
    </>
  );
}
