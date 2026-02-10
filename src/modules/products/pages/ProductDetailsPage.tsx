import { Link } from "react-router-dom";
import { useProductDetailsScreen } from "../hooks/useProductDetailsScreen";
import PageBreadcrumb from "@/shared/components/feedback/PageBreadcrumb";
import { DetailPageSkeleton } from "@/shared/components/feedback/DetailPageSkeleton";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
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
  Tag,
  Layers,
  Building2,
  Truck,
  BarChart3,
  AlertTriangle,
  Clock,
  Hash,
  Scale,
} from "lucide-react";
import { useTenantCurrency } from "@/modules/tenant";

export default function ProductDetailsPage() {
  const { status, vm, actions } = useProductDetailsScreen();
  const { formatPrice } = useTenantCurrency();

  if (status === "loading") {
    return <DetailPageSkeleton />;
  }

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

  const getStatusConfig = () => {
    switch (product.status) {
      case "in_stock":
        return { color: "success" as const, label: "In Stock", icon: Package };
      case "low_stock":
        return {
          color: "warning" as const,
          label: "Low Stock",
          icon: AlertTriangle,
        };
      case "out_of_stock":
        return {
          color: "error" as const,
          label: "Out of Stock",
          icon: Package,
        };
      default:
        return {
          color: "light" as const,
          label: product.status,
          icon: Package,
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <>
      <PageBreadcrumb pageTitle="Product Details" />

      {/* Back Button Row */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/tenant/products">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={actions.openEdit}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={actions.openDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Current Stock */}
        <div
          className={`rounded-xl border p-4 ${
            stockWarning
              ? "border-warning-200 bg-warning-50/50 dark:border-warning-800 dark:bg-warning-900/20"
              : "border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                stockWarning
                  ? "bg-warning-100 dark:bg-warning-900/30"
                  : "bg-brand-50 dark:bg-brand-900/20"
              }`}
            >
              <Package
                className={`h-5 w-5 ${
                  stockWarning
                    ? "text-warning-600 dark:text-warning-400"
                    : "text-brand-600 dark:text-brand-400"
                }`}
              />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Stock
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {product.currentStock}
              </p>
            </div>
          </div>
          {stockWarning && (
            <p className="text-xs text-warning-600 dark:text-warning-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Below minimum ({product.minimumStock})
            </p>
          )}
        </div>

        {/* Cost Price */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Cost
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatPrice(product.costPrice)}
              </p>
            </div>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Profit
              </p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatPrice(profitInfo.margin)}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {profitInfo.percentage}% margin
          </p>
        </div>

        {/* Minimum Stock */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Min. Stock
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {product.minimumStock}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Product Image Section */}
          <div className="lg:col-span-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 p-8 flex items-center justify-center min-h-[280px]">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full max-w-[240px] h-auto max-h-[240px] object-contain rounded-xl shadow-lg"
              />
            ) : (
              <div className="w-40 h-40 rounded-2xl bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center">
                <BoxCubeIcon className="w-20 h-20 text-gray-300 dark:text-gray-600" />
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="lg:col-span-8 p-6 lg:p-8 flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <Badge
                color={statusConfig.color}
                variant="light"
                className="gap-1.5"
              >
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
              <Badge variant="light" color="light" className="gap-1.5">
                <Tag className="h-3 w-3" />
                {categoryName}
              </Badge>
              {product.productType === "weighted" && (
                <Badge variant="light" color="info" className="gap-1.5">
                  <Scale className="h-3 w-3" />
                  Weighted
                </Badge>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span className="flex items-center gap-1.5">
                <Hash className="h-4 w-4" />
                SKU: {product.sku}
              </span>
              {brandName !== "Unknown" && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    {brandName}
                  </span>
                </>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Price Display */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl lg:text-4xl font-bold text-brand-600 dark:text-brand-400">
                {formatPrice(product.unitPrice)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                per unit
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full sm:w-auto mb-4">
          <TabsTrigger value="details" className="gap-2">
            <Layers className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="supplier" className="gap-2">
            <Truck className="h-4 w-4" />
            Supplier
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Clock className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-brand-500" />
              Product Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <DetailItem icon={Tag} label="Category" value={categoryName} />
              <DetailItem icon={Building2} label="Brand" value={brandName} />
              <DetailItem icon={Hash} label="SKU" value={product.sku} />
              <DetailItem
                icon={Package}
                label="Product Type"
                value={
                  product.productType === "weighted"
                    ? "Weighted Product"
                    : "Unit Product"
                }
              />
              <DetailItem
                icon={DollarSign}
                label="Unit Price"
                value={formatPrice(product.unitPrice)}
                highlight
              />
              <DetailItem
                icon={DollarSign}
                label="Cost Price"
                value={formatPrice(product.costPrice)}
              />
            </div>
            {product.description && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Description
                </h4>
                <p className="text-gray-700 dark:text-gray-300">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Supplier Tab */}
        <TabsContent value="supplier">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5 text-brand-500" />
              Supplier Information
            </h3>
            {vendor ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {vendor.name}
                    </h4>
                    {vendor.contactPerson && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Contact: {vendor.contactPerson}
                      </p>
                    )}
                    {vendor.email && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {vendor.email}
                      </p>
                    )}
                    {vendor.phone && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {vendor.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Truck className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  No vendor assigned to this product
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-500" />
              Product Timeline
            </h3>
            <div className="space-y-4">
              <TimelineItem
                icon={Calendar}
                label="Created"
                date={new Date(product.createdAt).toLocaleString()}
              />
              <TimelineItem
                icon={Pencil}
                label="Last Updated"
                date={new Date(product.updatedAt).toLocaleString()}
                isLast
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

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

interface DetailItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}

function DetailItem({ icon: Icon, label, value, highlight }: DetailItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p
          className={`text-base font-semibold ${
            highlight
              ? "text-brand-600 dark:text-brand-400"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

interface TimelineItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  date: string;
  isLast?: boolean;
}

function TimelineItem({ icon: Icon, label, date, isLast }: TimelineItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="relative flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center z-10">
          <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
        </div>
        {!isLast && (
          <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 absolute top-10 left-1/2 -translate-x-1/2" />
        )}
      </div>
      <div
        className={`pb-4 ${isLast ? "" : "border-b border-gray-100 dark:border-gray-800"}`}
      >
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{date}</p>
      </div>
    </div>
  );
}
