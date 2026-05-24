import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePurchaseDetailsScreen } from "../hooks/usePurchaseDetailsScreen";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  ArrowLeft,
  FileText,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Ban,
  ClipboardCheck,
  CalendarDays,
} from "lucide-react";
import { formatDateTime } from "@/shared/utils/format";
import { useTenantCurrency } from "@/modules/tenant";
import ConfirmModal from "@/shared/components/feedback/ConfirmModal";

/* -------------------------------------------------------------------------- */
/*  Status pill                                                               */
/* -------------------------------------------------------------------------- */

const STATUS_CONFIG = {
  received: {
    label: "Received",
    Icon: CheckCircle2,
    className:
      "gap-1.5 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  },
  ordered: {
    label: "Ordered",
    Icon: Truck,
    className:
      "gap-1.5 bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
  },
  pending: {
    label: "Pending",
    Icon: Clock,
    className:
      "gap-1.5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  },
  cancelled: {
    label: "Cancelled",
    Icon: XCircle,
    className:
      "gap-1.5 bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  },
} as const;

function StatusPill({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  if (!config) return <Badge variant="outline">{status}</Badge>;
  const { Icon, label, className } = config;
  return (
    <Badge variant="outline" className={className}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
}

/* -------------------------------------------------------------------------- */
/*  Skeleton                                                                  */
/* -------------------------------------------------------------------------- */

function PurchaseDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-32" />
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Timeline                                                                  */
/* -------------------------------------------------------------------------- */

type TimelineEvent = {
  label: string;
  date: string;
  state: "done" | "current" | "upcoming" | "cancelled";
};

function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative space-y-5">
      {events.map((event, idx) => {
        const isLast = idx === events.length - 1;
        const dotClass =
          event.state === "done"
            ? "bg-brand-500 ring-brand-100 dark:ring-brand-900/30"
            : event.state === "current"
              ? "bg-brand-500 ring-brand-200 dark:ring-brand-900/40 animate-pulse"
              : event.state === "cancelled"
                ? "bg-red-500 ring-red-100 dark:ring-red-900/30"
                : "bg-gray-300 ring-gray-100 dark:bg-gray-700 dark:ring-gray-800";
        const lineClass =
          event.state === "done" || event.state === "current"
            ? "bg-brand-200 dark:bg-brand-900/40"
            : "bg-gray-200 dark:bg-gray-800";
        return (
          <li key={event.label} className="relative pl-8">
            <span
              className={`absolute left-1.5 top-1.5 h-3 w-3 rounded-full ring-4 ${dotClass}`}
              aria-hidden
            />
            {!isLast && (
              <span
                className={`absolute left-[11px] top-5 bottom-[-22px] w-px ${lineClass}`}
                aria-hidden
              />
            )}
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {event.label}
            </p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {event.date}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function PurchaseDetailsPage() {
  const { status, vm, actions } = usePurchaseDetailsScreen();
  const { formatPrice } = useTenantCurrency();
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Compute timeline + total units BEFORE the early returns so hook
  // ordering stays stable. `useMemo` falls through with empty state
  // when the purchase isn't loaded yet.
  const timeline = useMemo<TimelineEvent[]>(() => {
    if (!vm.purchase) return [];
    const created: TimelineEvent = {
      label: "Order created",
      date: formatDateTime(vm.purchase.createdAt),
      state: "done",
    };
    const ordered: TimelineEvent = {
      label: "Marked as ordered",
      date: formatDateTime(vm.purchase.purchaseDate),
      state:
        vm.purchase.status === "pending"
          ? "upcoming"
          : vm.purchase.status === "cancelled"
            ? "cancelled"
            : "done",
    };
    const received: TimelineEvent = {
      label: vm.purchase.receivedDate ? "Received" : "Awaiting receipt",
      date: vm.purchase.receivedDate
        ? formatDateTime(vm.purchase.receivedDate)
        : "Not received yet",
      state:
        vm.purchase.status === "received"
          ? "done"
          : vm.purchase.status === "ordered"
            ? "current"
            : vm.purchase.status === "cancelled"
              ? "cancelled"
              : "upcoming",
    };
    return [created, ordered, received];
  }, [vm.purchase]);

  const totalUnits = useMemo(
    () =>
      vm.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [vm.items],
  );

  if (status === "loading") {
    return <PurchaseDetailsSkeleton />;
  }

  if (status === "error" || !vm.purchase) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <FileText className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Purchase order not found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          The purchase order you&apos;re looking for doesn&apos;t exist or has
          been removed.
        </p>
        <Link to="/tenant/purchases">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Purchases
          </Button>
        </Link>
      </div>
    );
  }

  const { purchase, vendor, items } = vm;
  const dateForKpi = purchase.receivedDate ?? purchase.purchaseDate;

  return (
    <div className="space-y-6">
      {/* Back link — minimal, no giant icon block. */}
      <Link
        to="/tenant/purchases"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Purchases
      </Link>

      {/* Header row — title + status on the left, actions on the right. */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {purchase.purchaseNumber}
            </h1>
            <div className="mt-1.5 flex items-center gap-2">
              <StatusPill status={purchase.status as string} />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Created {formatDateTime(purchase.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {vm.canOrder && (
            <Button
              onClick={actions.markAsOrdered}
              disabled={vm.isLoading}
              className="gap-2"
            >
              <ClipboardCheck className="h-4 w-4" />
              Mark as Ordered
            </Button>
          )}
          {vm.canReceive && (
            <Button
              onClick={actions.receive}
              disabled={vm.isLoading}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4" />
              Receive Order
            </Button>
          )}
          {vm.canCancel && (
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(true)}
              disabled={vm.isLoading}
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-900/20"
            >
              <Ban className="h-4 w-4" />
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* KPI row — Total Cost / Items / Total Units / Key Date. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Total Cost
          </p>
          <p className="mt-1.5 text-2xl font-bold text-brand-600 dark:text-brand-400">
            {formatPrice(purchase.totalCost)}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Line Items
          </p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-white">
            {items.length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Total Units
          </p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900 dark:text-white">
            {totalUnits}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {purchase.receivedDate ? "Received" : "Purchase Date"}
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            {formatDateTime(dateForKpi)}
          </p>
        </div>
      </div>

      {/* Notes — inline above items when present. */}
      {purchase.notes && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
          <span className="font-semibold">Notes: </span>
          {purchase.notes}
        </div>
      )}

      {/* Body grid — items on the left (2/3), vendor + timeline on the right. */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <section className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <header className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
              <Package className="h-5 w-5 text-brand-500" />
              Order Items
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {items.length} {items.length === 1 ? "item" : "items"} · {totalUnits} units
            </span>
          </header>

          {/* Column headers */}
          <div className="hidden sm:grid grid-cols-12 gap-3 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-right">Unit Cost</div>
            <div className="col-span-2 text-right">Quantity</div>
            <div className="col-span-2 text-right">Subtotal</div>
          </div>

          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map((item) => (
              <li
                key={item.productId}
                className="grid grid-cols-12 gap-3 items-center px-5 py-4"
              >
                <div className="col-span-12 sm:col-span-6 flex items-center gap-3 min-w-0">
                  <div className="h-11 w-11 shrink-0 rounded-lg bg-gray-50 dark:bg-gray-800 overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-700">
                    {item.product?.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {item.productName}
                    </p>
                    {item.product?.sku && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        SKU {item.product.sku}
                      </p>
                    )}
                  </div>
                </div>
                <div className="col-span-4 sm:col-span-2 text-right text-sm tabular-nums text-gray-700 dark:text-gray-300">
                  {formatPrice(item.costPrice)}
                </div>
                <div className="col-span-4 sm:col-span-2 text-right text-sm tabular-nums text-gray-700 dark:text-gray-300">
                  {Number(item.quantity)}
                </div>
                <div className="col-span-4 sm:col-span-2 text-right text-sm tabular-nums font-semibold text-gray-900 dark:text-white">
                  {formatPrice(item.subtotal)}
                </div>
              </li>
            ))}
          </ul>

          <footer className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-800">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total
            </span>
            <span className="text-xl font-bold text-brand-600 dark:text-brand-400 tabular-nums">
              {formatPrice(purchase.totalCost)}
            </span>
          </footer>
        </section>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Vendor */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
              Supplier
            </h3>
            {vendor ? (
              <Link
                to={`/tenant/vendors`}
                className="group block rounded-xl border border-transparent hover:border-brand-200 hover:bg-brand-50/30 dark:hover:border-brand-800 dark:hover:bg-brand-900/10 -mx-2 px-2 py-2 transition-colors"
              >
                <p className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-300">
                  {vendor.name}
                </p>
                {vendor.contactPerson && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {vendor.contactPerson}
                  </p>
                )}
                {vendor.email && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 truncate">
                    {vendor.email}
                  </p>
                )}
                {vendor.phone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {vendor.phone}
                  </p>
                )}
              </Link>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Vendor information unavailable.
              </p>
            )}
          </section>

          {/* Timeline */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
              Timeline
            </h3>
            <Timeline events={timeline} />
          </section>
        </aside>
      </div>

      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={async () => {
          await actions.cancel();
          setShowCancelModal(false);
        }}
        title="Cancel Purchase Order"
        message={`Are you sure you want to cancel purchase order ${purchase.purchaseNumber}? This action cannot be undone.`}
        confirmText="Cancel Order"
        variant="danger"
        isLoading={vm.isLoading}
      />
    </div>
  );
}
