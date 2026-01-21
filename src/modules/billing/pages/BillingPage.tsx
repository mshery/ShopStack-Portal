import { useState } from "react";
import { Check, X, Download, Eye, ChevronLeft, ChevronRight, CreditCard, Calendar, Receipt, Pencil, Plus, FileText } from "lucide-react";
import PageBreadcrumb from "@/shared/components/feedback/PageBreadcrumb";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Modal } from "@/shared/components/ui/Modal";
import { useBillingScreen, useBillingUpgrade, useBillingsStore } from "@/modules/billing";
import { useTenantsStore } from "@/modules/tenant";
import { useAuthStore } from "@/modules/auth";
import { EditBillingAddressModal } from "@/modules/billing/components/EditBillingAddressModal";
import { PaymentMethodModal } from "@/modules/billing/components/PaymentMethodModal";
import type { BillingPaymentMethod, PlanFeature, BillingInvoice, InvoiceStatus, SubscriptionPlan, BillingAddress } from "@/shared/types/models";

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
    const { addPaymentMethod, removePaymentMethod, setDefaultPaymentMethod } = useBillingsStore();
    const { updateTenantSettings } = useTenantsStore();
    const { activeTenantId } = useAuthStore();

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [upgradeSuccess, setUpgradeSuccess] = useState(false);
    const [upgradeError, setUpgradeError] = useState<string | null>(null);
    const [isUpgrading, setIsUpgrading] = useState(false);

    // Address modal state
    const [showAddressModal, setShowAddressModal] = useState(false);

    // Payment method modal state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [editingPaymentMethod, setEditingPaymentMethod] = useState<BillingPaymentMethod | null>(null);

    const handleUpgradeClick = (plan: SubscriptionPlan) => {
        setSelectedPlan(plan);
        setShowUpgradeModal(true);
        setUpgradeError(null);
    };

    const handleConfirmUpgrade = () => {
        if (!selectedPlan) return;

        setIsUpgrading(true);

        // Simulate brief delay for UX
        setTimeout(() => {
            const result = upgradeHook.actions.upgrade(selectedPlan.slug);

            if (result.success) {
                setUpgradeSuccess(true);
                setShowUpgradeModal(false);
                // Hide success message after 5 seconds
                setTimeout(() => setUpgradeSuccess(false), 5000);
            } else {
                setUpgradeError(result.error ?? "Unknown error occurred");
            }

            setIsUpgrading(false);
        }, 500);
    };

    // Handle billing address save
    const handleAddressSave = (address: BillingAddress) => {
        if (!activeTenantId) return;
        updateTenantSettings(activeTenantId, { billingAddress: address });
    };

    // Handle payment method save
    const handlePaymentMethodSave = (data: Partial<BillingPaymentMethod>) => {
        if (!activeTenantId) return;

        if (editingPaymentMethod) {
            // For edit, we'd update the existing method
            // For now, we'll just close the modal
        } else {
            // Add new payment method
            const newMethod: BillingPaymentMethod = {
                id: `pm-${Date.now()}`,
                tenant_id: activeTenantId,
                type: data.type ?? "card",
                last4: data.last4 ?? "0000",
                brand: data.brand,
                expiryMonth: data.expiryMonth,
                expiryYear: data.expiryYear,
                email: data.email,
                isDefault: data.isDefault ?? false,
                createdAt: new Date().toISOString(),
            };
            addPaymentMethod(newMethod);

            if (data.isDefault) {
                setDefaultPaymentMethod(activeTenantId, newMethod.id);
            }
        }
        setEditingPaymentMethod(null);
    };

    // Handle delete payment method
    const handleDeletePaymentMethod = (methodId: string) => {
        removePaymentMethod(methodId);
    };

    // Handle make default payment method
    const handleMakeDefault = (methodId: string) => {
        if (!activeTenantId) return;
        setDefaultPaymentMethod(activeTenantId, methodId);
    };

    if (status === "loading") {
        return (
            <>
                <PageBreadcrumb pageTitle="Billing" />
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
                </div>
            </>
        );
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

    const { billing, currentPlan, billingAddress, paymentMethods, invoices, ordersUsed, ordersLimit, pagination, canUpgrade } = vm;
    const ordersPercentage = Math.min((ordersUsed / ordersLimit) * 100, 100);

    return (
        <>
            <PageBreadcrumb pageTitle="Billing" />

            {/* Success Notification */}
            {upgradeSuccess && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p className="font-medium text-green-800 dark:text-green-200">Plan Upgraded Successfully!</p>
                        <p className="text-sm text-green-600 dark:text-green-400">Your new plan is now active. An invoice has been generated.</p>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {/* Plan Details & Billing Info Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Plan Details Card */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Plan Details</h2>

                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Plan Info */}
                            <div className="flex-1 space-y-4 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
                                        <CreditCard className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Current Plan</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {currentPlan?.name ?? billing.plan.charAt(0).toUpperCase() + billing.plan.slice(1)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                        <Receipt className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Limits</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {ordersLimit.toLocaleString()} Orders
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
                                        <span className="text-green-600 dark:text-green-400 font-semibold">$</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Cost</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            ${billing.monthlyAmount.toFixed(2)}<span className="text-sm font-normal text-gray-500">/month</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Renewal Date</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {billing.nextBillingDate
                                                ? new Date(billing.nextBillingDate).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })
                                                : "N/A"}
                                        </p>
                                    </div>
                                </div>

                                {/* Orders Usage */}
                                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Orders</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {ordersUsed.toLocaleString()} of {ordersLimit.toLocaleString()} orders used
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
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Plan Benefits</h3>
                                <ul className="space-y-3">
                                    {(currentPlan?.features ?? []).map((feature: PlanFeature, index: number) => (
                                        <li key={index} className="flex items-center gap-3">
                                            {feature.included ? (
                                                <Check className="h-4 w-4 text-brand-500" />
                                            ) : (
                                                <X className="h-4 w-4 text-gray-400" />
                                            )}
                                            <span className={feature.included ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"}>
                                                {feature.name}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Action Buttons */}
                                <div className="flex gap-3 mt-6">
                                    <Button variant="outline" className="flex-1">
                                        Cancel Subscription
                                    </Button>
                                    {canUpgrade && upgradeHook.vm.availableUpgrades.length > 0 && (
                                        <Button
                                            className="flex-1 bg-brand-500 hover:bg-brand-600"
                                            onClick={() => handleUpgradeClick(upgradeHook.vm.availableUpgrades[0])}
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
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Billing Info</h2>

                        {billingAddress ? (
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Name</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{billingAddress.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Street</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white text-right max-w-[180px]">{billingAddress.street}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">City/State</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{billingAddress.city}, {billingAddress.state}, {billingAddress.zipCode}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Country</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{billingAddress.country}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Zip/Postal code</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{billingAddress.zipCode}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Town/City</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{billingAddress.city}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">VAT Number</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{billingAddress.vatNumber ?? "—"}</span>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full mt-4 gap-2"
                                    onClick={() => setShowAddressModal(true)}
                                >
                                    <Pencil className="h-4 w-4" />
                                    Update Billing Address
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                <p>No billing address configured</p>
                                <Button
                                    variant="outline"
                                    className="mt-4 gap-2"
                                    onClick={() => setShowAddressModal(true)}
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Billing Address
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Methods</h2>
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
                                onEdit={() => {
                                    setEditingPaymentMethod(method);
                                    setShowPaymentModal(true);
                                }}
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
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invoices</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Access all your previous invoices.</p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Download className="h-4 w-4" />
                            Download All
                        </Button>
                    </div>

                    {invoices.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">Name</th>
                                            <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">Date</th>
                                            <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">Price</th>
                                            <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">Plan</th>
                                            <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">Status</th>
                                            <th className="text-right text-sm font-medium text-gray-500 dark:text-gray-400 pb-3">Action</th>
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
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => actions.goToPage(page)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === pagination.currentPage
                                                ? "bg-brand-500 text-white"
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
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

                    {upgradeError && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            {upgradeError}
                        </div>
                    )}

                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Current Plan</span>
                            <span className="font-medium text-gray-900 dark:text-white">{currentPlan?.name ?? 'Starter'}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">New Plan</span>
                            <span className="font-medium text-brand-600 dark:text-brand-400">{selectedPlan?.name}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Monthly Price</span>
                            <span className="font-semibold text-gray-900 dark:text-white">${selectedPlan?.monthlyPrice.toFixed(2)}/month</span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-gray-600 dark:text-gray-400">New Limits</span>
                            <span className="text-sm text-gray-900 dark:text-white">
                                {selectedPlan?.limits.maxOrders.toLocaleString()} orders/month
                            </span>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        You will be charged ${selectedPlan?.monthlyPrice.toFixed(2)} immediately and your plan will be upgraded. An invoice will be generated.
                    </p>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowUpgradeModal(false)}
                            disabled={isUpgrading}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-brand-500 hover:bg-brand-600"
                            onClick={handleConfirmUpgrade}
                            disabled={isUpgrading}
                        >
                            {isUpgrading ? 'Processing...' : 'Confirm Upgrade'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Billing Address Modal */}
            <EditBillingAddressModal
                key={showAddressModal ? "address-open" : "address-closed"}
                isOpen={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                address={billingAddress}
                onSave={handleAddressSave}
            />

            {/* Payment Method Modal */}
            <PaymentMethodModal
                key={editingPaymentMethod ? `edit-${editingPaymentMethod.id}` : (showPaymentModal ? "add-new" : "closed")}
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

function PaymentMethodCard({ method, onEdit, onDelete, onMakeDefault }: PaymentMethodCardProps) {
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="flex items-start gap-4">
                {method.type === "card" && method.brand === "mastercard" && <MastercardLogo />}
                {method.type === "card" && method.brand === "visa" && <VisaLogo />}
                {method.type === "paypal" && <PaypalLogo />}

                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                            {method.type === "card" && method.brand
                                ? method.brand.charAt(0).toUpperCase() + method.brand.slice(1)
                                : method.type === "paypal" ? "Paypal" : "Card"}
                        </p>
                        {method.isDefault && (
                            <Badge color="success" variant="light" size="sm">
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
        unpaid: "error",
    };

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
            <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                {new Date(invoice.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                })}
            </td>
            <td className="py-4 text-sm font-medium text-gray-900 dark:text-white">
                ${invoice.amount.toFixed(2)}
            </td>
            <td className="py-4 text-sm text-gray-600 dark:text-gray-400">
                {invoice.planName}
            </td>
            <td className="py-4">
                <Badge color={statusColors[invoice.status]} variant="light" size="sm">
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </Badge>
            </td>
            <td className="py-4">
                <div className="flex justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <Download className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <Eye className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}
