import { useState } from "react";
import {
  Check, // Imported but unused in this version if we hide upgrade success
  X,
  Download,
  // Eye,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Calendar,
  Receipt,
  // Pencil,
  Plus,
  FileText,
} from "lucide-react";
import PageBreadcrumb from "@/shared/components/feedback/PageBreadcrumb";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Modal } from "@/shared/components/ui/Modal";
import { PageSkeleton } from "@/shared/components/skeletons/PageSkeleton";
import { useBillingScreen, useBillingUpgrade } from "@/modules/billing";
import { PaymentMethodModal } from "@/modules/billing/components/PaymentMethodModal";
import type {
  BillingPaymentMethod,
  PlanFeature,
  BillingInvoice,
  InvoiceStatus,
  SubscriptionPlan,
} from "@/shared/types/models";

// Card brand logos as simple SVG components
function MastercardLogo() {
  return (
    <div className="w-12 h-8 flex items-center justify-center">
      <div className="flex">
        <div className="w-5 h-5 rounded-full bg-red-500" />
        <div className="w-5 h-5 rounded-full bg-yellow-500 -ml-2" />
      </div>
    </div>
  );
}

function VisaLogo() {
  return (
    <div className="w-12 h-8 flex items-center justify-center bg-white border border-gray-200 rounded px-1">
      <span className="text-blue-800 font-bold text-sm italic">VISA</span>
    </div>
  );
}

function PaypalLogo() {
  return (
    <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full">
      <span className="text-blue-600 font-bold text-lg">P</span>
    </div>
  );
}

export default function BillingPage() {
  const { status, vm, actions } = useBillingScreen();
  const upgradeHook = useBillingUpgrade();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  // const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  // const [upgradeError, setUpgradeError] = useState<string | null>(null);
  // const [isUpgrading, setIsUpgrading] = useState(false);

  // Address modal state - Disabled for now as API is missing
  // const [showAddressModal, setShowAddressModal] = useState(false);

  // Payment method modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] =
    useState<BillingPaymentMethod | null>(null);

  const handleUpgradeClick = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
    // setUpgradeError(null);
  };

  /*
   * Upgrade logic hidden/disabled until API supports it
   */
  const handleConfirmUpgrade = () => {
    // Placeholder
    setShowUpgradeModal(false);
  };

  // Handle payment method save
  const handlePaymentMethodSave = async (
    data: Partial<BillingPaymentMethod>,
  ) => {
    if (editingPaymentMethod) {
      // Edit not supported by API yet
      setEditingPaymentMethod(null);
      setShowPaymentModal(false);
    } else {
      // Add new payment method
      await actions.addPaymentMethod({
        type: data.type ?? "card",
        brand: data.brand,
        last4: data.last4,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        email: data.email,
        isDefault: data.isDefault,
      });
      setShowPaymentModal(false);
      actions.refresh();
    }
  };

  // Handle delete payment method
  const handleDeletePaymentMethod = async (methodId: string) => {
    if (confirm("Are you sure you want to delete this payment method?")) {
      await actions.removePaymentMethod(methodId);
      actions.refresh();
    }
  };

  // Handle make default payment method
  const handleMakeDefault = async (methodId: string) => {
    await actions.setDefaultPaymentMethod(methodId);
    actions.refresh();
  };

  if (status === "loading") {
    return <PageSkeleton />;
  }

  if (status === "empty" || !vm.billing) {
    return (
      <>
        <PageBreadcrumb pageTitle="Billing" />
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <CreditCard className="h-12 w-12 mb-4 text-gray-300" />
          <p>No billing information available</p>
        </div>
      </>
    );
  }

  const {
    billing,
    currentPlan,
    billingAddress,
    paymentMethods,
    invoices,
    ordersUsed,
    ordersLimit,
    pagination,
    canUpgrade,
  } = vm;
  const ordersPercentage = Math.min((ordersUsed / ordersLimit) * 100, 100);

  return (
    <>
      <PageBreadcrumb pageTitle="Billing" />

      <div className="space-y-6">
        {/* Plan Details & Billing Info Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plan Details Card */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Plan Details
            </h2>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Plan Info */}
              <div className="flex-1 space-y-4 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
                    <CreditCard className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Current Plan
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {currentPlan?.name ?? billing.plan.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <Receipt className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Monthly Limits
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {ordersLimit.toLocaleString()} Orders
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      Rs
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Cost
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Rs {Number(billing?.monthlyAmount ?? 0).toFixed(2)}
                      <span className="text-sm font-normal text-gray-500">
                        /month
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Renewal Date
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {billing.nextBillingDate
                        ? new Date(billing.nextBillingDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Orders Usage */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Orders
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {ordersUsed.toLocaleString()} of{" "}
                      {ordersLimit.toLocaleString()} orders used
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-brand-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${ordersPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Plan Benefits */}
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                  Plan Benefits
                </h3>
                <ul className="space-y-3">
                  {((currentPlan?.features as PlanFeature[]) ?? []).map(
                    (feature: PlanFeature, index: number) => (
                      <li key={index} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="h-4 w-4 text-brand-500" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                        <span
                          className={
                            feature.included
                              ? "text-gray-700 dark:text-gray-300"
                              : "text-gray-400 dark:text-gray-500"
                          }
                        >
                          {feature.name}
                        </span>
                      </li>
                    ),
                  )}
                </ul>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  {/* Cancel Subscription disabled for now */}
                  {/* <Button variant="outline" className="flex-1">
                    Cancel Subscription
                   </Button> */}

                  {canUpgrade &&
                    upgradeHook.vm.availableUpgrades.length > 0 && (
                      <Button
                        className="flex-1 bg-brand-500 hover:bg-brand-600"
                        onClick={() =>
                          handleUpgradeClick(
                            upgradeHook.vm.availableUpgrades[0],
                          )
                        }
                      >
                        Upgrade to {upgradeHook.vm.availableUpgrades[0].name}
                      </Button>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Billing Info Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Billing Info
            </h2>

            {billingAddress ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Name
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {billingAddress.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Street
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white text-right max-w-[180px]">
                    {billingAddress.street}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    City/State
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {billingAddress.city}, {billingAddress.state},{" "}
                    {billingAddress.zipCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Country
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {billingAddress.country}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    VAT Number
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {billingAddress.vatNumber ?? "—"}
                  </span>
                </div>

                {/* Update Address Disabled */}
                {/* <Button
                  variant="outline"
                  className="w-full mt-4 gap-2"
                  onClick={() => setShowAddressModal(true)}
                >
                  <Pencil className="h-4 w-4" />
                  Update Billing Address
                </Button> */}
                <p className="text-xs text-gray-400 mt-2 text-center">
                  To update billing address, please contact support.
                </p>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>No billing address configured</p>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Please contact support to add billing address.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Payment Methods
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                setEditingPaymentMethod(null);
                setShowPaymentModal(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add New Card
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentMethods.map((method: BillingPaymentMethod) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                // Edit disabled for now
                // onEdit={() => {
                //   setEditingPaymentMethod(method);
                //   setShowPaymentModal(true);
                // }}
                onDelete={() => handleDeletePaymentMethod(method.id)}
                onMakeDefault={() => handleMakeDefault(method.id)}
              />
            ))}
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Invoices
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Access all your previous invoices.
              </p>
            </div>
            {/* <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download All
            </Button> */}
          </div>

          {invoices.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">
                        Name
                      </th>
                      <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">
                        Date
                      </th>
                      <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">
                        Price
                      </th>
                      <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">
                        Plan
                      </th>
                      <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">
                        Status
                      </th>
                      <th className="text-right text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice: BillingInvoice) => (
                      <InvoiceRow key={invoice.id} invoice={invoice} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={actions.prevPage}
                  disabled={pagination.currentPage === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={actions.nextPage}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No invoices found</p>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Confirmation Modal */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        className="max-w-lg"
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Upgrade to {selectedPlan?.name}
          </h2>

          <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Upgrade requires confirmation.
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowUpgradeModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-brand-500 hover:bg-brand-600"
              onClick={handleConfirmUpgrade}
            >
              Confirm Upgrade
            </Button>
          </div>
        </div>
      </Modal>

      {/* Payment Method Modal */}
      <PaymentMethodModal
        key={
          editingPaymentMethod
            ? `edit-${editingPaymentMethod.id}`
            : showPaymentModal
              ? "add-new"
              : "closed"
        }
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setEditingPaymentMethod(null);
        }}
        method={editingPaymentMethod}
        onSave={handlePaymentMethodSave}
      />
    </>
  );
}

// Payment Method Card Component
interface PaymentMethodCardProps {
  method: BillingPaymentMethod;
  onEdit?: () => void;
  onDelete?: () => void;
  onMakeDefault?: () => void;
}

function PaymentMethodCard({
  method,
  onEdit,
  onDelete,
  onMakeDefault,
}: PaymentMethodCardProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <div className="flex items-start gap-4">
        {method.type === "card" && method.brand === "mastercard" && (
          <MastercardLogo />
        )}
        {method.type === "card" && method.brand === "visa" && <VisaLogo />}
        {method.type === "paypal" && <PaypalLogo />}

        {/* Default logo/icon if brand unknown */}
        {method.type === "card" &&
          !["mastercard", "visa"].includes(method.brand ?? "") && (
            <div className="w-12 h-8 flex items-center justify-center bg-gray-100 rounded border border-gray-200">
              <CreditCard className="w-5 h-5 text-gray-500" />
            </div>
          )}

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900 dark:text-white">
              {method.type === "card" && method.brand
                ? method.brand.charAt(0).toUpperCase() + method.brand.slice(1)
                : method.type === "paypal"
                  ? "Paypal"
                  : "Card"}
            </p>
            {method.isDefault && (
              <Badge
                variant="outline"
                className="text-green-600 border-green-200 bg-green-50"
              >
                <Check className="h-3 w-3 mr-1" />
                Default
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {method.type === "card"
              ? `**** **** **** ${method.last4}    Expiry ${String(method.expiryMonth).padStart(2, "0")}/${method.expiryYear}`
              : method.email}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {!method.isDefault && onMakeDefault && (
          <Button variant="outline" size="sm" onClick={onMakeDefault}>
            Make Default
          </Button>
        )}
        {onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
        )}
        {onDelete && (
          <Button variant="outline" size="sm" onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}

// Invoice Row Component
function InvoiceRow({ invoice }: { invoice: BillingInvoice }) {
  const statusColors: Record<InvoiceStatus, "success" | "warning" | "error"> = {
    paid: "success",
    pending: "warning",
    failed: "error",
    unpaid: "error", // Ensure type compat
  };

  const statusColor = statusColors[invoice.status] || "warning";

  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <td className="py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-10 bg-red-100 dark:bg-red-900/20 rounded flex items-center justify-center">
            <FileText className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Invoice {invoice.invoiceNumber}
          </span>
        </div>
      </td>
      <td className="py-4 text-sm text-gray-500 dark:text-gray-400">
        {new Date(invoice.createdAt).toLocaleDateString()}
      </td>
      <td className="py-4 text-sm font-medium text-gray-900 dark:text-white">
        Rs {invoice.amount.toFixed(2)}
      </td>
      <td className="py-4 text-sm text-gray-500 dark:text-gray-400">
        {invoice.planName}
      </td>
      <td className="py-4">
        <Badge
          color={
            statusColor === "success"
              ? "success"
              : statusColor === "error"
                ? "error"
                : "info"
          }
          variant="light"
        >
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </Badge>
      </td>
      <td className="py-4 text-right">
        <Button variant="ghost" size="sm">
          <Download className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}
