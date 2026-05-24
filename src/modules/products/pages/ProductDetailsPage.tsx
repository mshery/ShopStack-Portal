import { Link } from "react-router-dom";
import { useProductDetailsScreen } from "../hooks/useProductDetailsScreen";
import { DetailPageSkeleton } from "@/shared/components/feedback/DetailPageSkeleton";
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
  TrendingUp,
  AlertTriangle,
  Hash,
  Scale,
  Tag,
  Building2,
  Truck,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import { useTenantCurrency } from "@/modules/tenant";
import { formatDateTime } from "@/shared/utils/format";

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function ProductDetailsPage() {
  const { status, vm, actions } = useProductDetailsScreen();
  const { formatPrice } = useTenantCurrency();

  if (status === "loading") {
    return <DetailPageSkeleton />;
  }

  if (status === "error" || !vm.product) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Package className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Product not found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The product you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link to="/tenant/products">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  const { product, vendor, categoryName, brandName, profitInfo, stockWarning } =
    vm;

  const stockPct =
    product.minimumStock > 0
      ? Math.min(
          100,
          Math.round((product.currentStock / (product.minimumStock * 4)) * 100),
        )
      : product.currentStock > 0
        ? 100
        : 0;

  const stockState: "ok" | "low" | "out" =
    product.currentStock === 0
      ? "out"
      : product.currentStock <= product.minimumStock
        ? "low"
        : "ok";

  return (
    <div className="space-y-6">
      {/* Back link — light, unobtrusive. */}
      <Link
        to="/tenant/products"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      {/* Header row — product name + chips on the left, edit/delete on the right. */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <BoxCubeIcon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {product.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <StockStatusPill state={stockState} />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                SKU{" "}
                <span className="font-mono font-medium text-gray-700 dark:text-gray-300">
                  {product.sku}
                </span>
              </span>
              {categoryName !== "Unknown" && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  · {categoryName}
                </span>
              )}
              {brandName !== "Unknown" && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  · {brandName}
                </span>
              )}
              {product.productType === "weighted" && (
                <Badge
                  variant="light"
                  color="info"
                  size="sm"
                  className="gap-1"
                >
                  <Scale className="h-3 w-3" />
                  Weighted
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-900/20"
            onClick={actions.openDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* KPI strip — Price / Cost / Profit / Stock. Tabular, dense. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Unit Price"
          value={formatPrice(product.unitPrice)}
          accent="brand"
        />
        <KpiCard
          label="Cost"
          value={formatPrice(product.costPrice)}
        />
        <KpiCard
          label="Profit per unit"
          value={formatPrice(profitInfo.margin)}
          hint={`${profitInfo.percentage}% margin`}
          accent="success"
          icon={<TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />}
        />
        <KpiCard
          label="On hand"
          value={String(product.currentStock)}
          hint={`min ${product.minimumStock}`}
          accent={stockWarning ? "warning" : "neutral"}
          icon={
            stockWarning ? (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            ) : undefined
          }
        />
      </div>

      {/* Body — image + sidebar on the left, info-dense column on the right. */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT — image + supplier + timeline */}
        <aside className="lg:col-span-5 space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-900/40 flex items-center justify-center">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <BoxCubeIcon className="h-20 w-20 text-gray-300 dark:text-gray-700" />
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <Truck className="h-3.5 w-3.5" />
              Supplier
            </h3>
            {vendor ? (
              <Link
                to="/tenant/vendors"
                className="group flex items-start justify-between rounded-xl px-2 py-2 -mx-2 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-300">
                    {vendor.name}
                  </p>
                  {vendor.contactPerson && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {vendor.contactPerson}
                    </p>
                  )}
                  {vendor.email && (
                    <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
                      {vendor.email}
                    </p>
                  )}
                  {vendor.phone && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {vendor.phone}
                    </p>
                  )}
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No supplier set. Add one from the Edit dialog.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <Calendar className="h-3.5 w-3.5" />
              Timeline
            </h3>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Created
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDateTime(product.createdAt)}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Last updated
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDateTime(product.updatedAt)}
                  </p>
                </div>
              </li>
            </ol>
          </section>
        </aside>

        {/* RIGHT — pricing, inventory health, info, description */}
        <div className="lg:col-span-7 space-y-6">
          {/* Pricing block — big numbers, simple comparison */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
              <TrendingUp className="h-5 w-5 text-brand-500" />
              Pricing
            </h2>
            <dl className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-800">
              <div className="pr-5">
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Cost
                </dt>
                <dd className="mt-1.5 text-xl font-semibold tabular-nums text-gray-700 dark:text-gray-200">
                  {formatPrice(product.costPrice)}
                </dd>
              </div>
              <div className="px-5">
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Unit price
                </dt>
                <dd className="mt-1.5 text-2xl font-bold tabular-nums text-brand-600 dark:text-brand-400">
                  {formatPrice(product.unitPrice)}
                </dd>
              </div>
              <div className="pl-5">
                <dt className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Margin
                </dt>
                <dd className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="text-xl font-semibold tabular-nums text-green-600 dark:text-green-400">
                    {profitInfo.percentage}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatPrice(profitInfo.margin)} / unit
                  </span>
                </dd>
              </div>
            </dl>
          </section>

          {/* Inventory health — current vs minimum, with a progress bar. */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                <Package className="h-5 w-5 text-brand-500" />
                Inventory
              </h2>
              <StockStatusPill state={stockState} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  On hand
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                  {product.currentStock}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Min level
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                  {product.minimumStock}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Inventory value
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                  {formatPrice(product.currentStock * product.costPrice)}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                <span>Stock health</span>
                <span>{stockPct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className={`h-full rounded-full transition-all ${
                    stockState === "out"
                      ? "bg-red-500"
                      : stockState === "low"
                        ? "bg-amber-500"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${stockPct}%` }}
                />
              </div>
              {stockState === "low" && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3 w-3" />
                  Below minimum ({product.minimumStock}). Consider reordering.
                </p>
              )}
              {stockState === "out" && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-3 w-3" />
                  Out of stock. Reorder before selling more.
                </p>
              )}
            </div>
          </section>

          {/* Info grid — meta. */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
              <Tag className="h-5 w-5 text-brand-500" />
              Product info
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={Hash} label="SKU" value={product.sku} mono />
              <InfoRow icon={Tag} label="Category" value={categoryName} />
              <InfoRow icon={Building2} label="Brand" value={brandName} />
              <InfoRow
                icon={Package}
                label="Product type"
                value={
                  product.productType === "weighted"
                    ? "Weighted"
                    : "Unit (Piece)"
                }
              />
            </dl>
            {product.description && (
              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Description
                </p>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {product.description}
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modals */}
      {vm.isEditModalOpen && (
        <EditProductModal
          product={product}
          isOpen={vm.isEditModalOpen}
          onClose={actions.closeEdit}
          onUpdate={actions.updateProduct}
        />
      )}
      <DeleteConfirmationModal
        isOpen={vm.isDeleteModalOpen}
        onClose={actions.closeDelete}
        onConfirm={actions.confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        itemName={product.name}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function StockStatusPill({ state }: { state: "ok" | "low" | "out" }) {
  if (state === "ok") {
    return (
      <Badge
        color="success"
        variant="light"
        size="sm"
        className="gap-1"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        In stock
      </Badge>
    );
  }
  if (state === "low") {
    return (
      <Badge
        color="warning"
        variant="light"
        size="sm"
        className="gap-1"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Low stock
      </Badge>
    );
  }
  return (
    <Badge color="error" variant="light" size="sm" className="gap-1">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      Out of stock
    </Badge>
  );
}

type KpiAccent = "brand" | "success" | "warning" | "neutral";

function KpiCard({
  label,
  value,
  hint,
  accent = "neutral",
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: KpiAccent;
  icon?: React.ReactNode;
}) {
  const valueClass =
    accent === "brand"
      ? "text-brand-600 dark:text-brand-400"
      : accent === "success"
        ? "text-green-600 dark:text-green-400"
        : "text-gray-900 dark:text-white";
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </p>
        {icon}
      </div>
      <p className={`mt-1.5 text-2xl font-bold tabular-nums ${valueClass}`}>
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p
          className={`mt-0.5 truncate text-sm font-medium text-gray-900 dark:text-white ${
            mono ? "font-mono" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
