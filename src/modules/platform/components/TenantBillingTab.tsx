import { useMemo } from "react";
import { useBillingsStore } from "@/modules/billing";
import { Badge } from "@/shared/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/shared/components/ui/table";
import { CreditCard, Calendar, Receipt } from "lucide-react";
import type { BillingInvoice, BillingStatus } from "@/shared/types/models";

interface TenantBillingTabProps {
    tenantId: string;
}

export function TenantBillingTab({ tenantId }: TenantBillingTabProps) {
    const { billings, invoices } = useBillingsStore();

    const billing = useMemo(
        () => billings.find((b) => b.tenant_id === tenantId),
        [billings, tenantId],
    );

    const tenantInvoices = useMemo(
        () =>
            invoices
                .filter((inv) => inv.tenant_id === tenantId)
                .sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                ),
        [invoices, tenantId],
    );

    if (!billing) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <CreditCard className="h-12 w-12 mb-4 text-gray-300" />
                <p>No billing information available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Billing Summary Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <BillingCard
                    icon={<CreditCard className="h-5 w-5 text-brand-600" />}
                    title="Current Plan"
                    value={billing.plan.charAt(0).toUpperCase() + billing.plan.slice(1)}
                    subtitle={`$${billing.monthlyAmount}/month`}
                    status={billing.status}
                />
                <BillingCard
                    icon={<Calendar className="h-5 w-5 text-success-600" />}
                    title="Next Billing Date"
                    value={
                        billing.nextBillingDate
                            ? new Date(billing.nextBillingDate).toLocaleDateString()
                            : "N/A"
                    }
                    subtitle={billing.billingCycle}
                />
                <BillingCard
                    icon={<Receipt className="h-5 w-5 text-warning-600" />}
                    title="Last Payment"
                    value={
                        billing.lastPaymentAmount
                            ? `$${billing.lastPaymentAmount.toFixed(2)}`
                            : "No payments yet"
                    }
                    subtitle={
                        billing.lastPaymentDate
                            ? new Date(billing.lastPaymentDate).toLocaleDateString()
                            : ""
                    }
                />
            </div>

            {/* Invoice History */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Invoice History
                </h3>
                {tenantInvoices.length > 0 ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="border-gray-100 border-y">
                                <TableRow>
                                    <TableCell
                                        isHeader
                                        className="px-4 py-3 font-medium text-gray-500 text-sm"
                                    >
                                        Invoice #
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-4 py-3 font-medium text-gray-500 text-sm"
                                    >
                                        Amount
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-4 py-3 font-medium text-gray-500 text-sm"
                                    >
                                        Status
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-4 py-3 font-medium text-gray-500 text-sm"
                                    >
                                        Due Date
                                    </TableCell>
                                    <TableCell
                                        isHeader
                                        className="px-4 py-3 font-medium text-gray-500 text-sm"
                                    >
                                        Paid At
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100">
                                {tenantInvoices.map((invoice) => (
                                    <InvoiceRow key={invoice.id} invoice={invoice} />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="py-8 text-center text-gray-500">
                        No invoices found
                    </div>
                )}
            </div>
        </div>
    );
}

function BillingCard({
    icon,
    title,
    value,
    subtitle,
    status,
}: {
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle: string;
    status?: BillingStatus;
}) {
    const statusColors: Record<BillingStatus, "success" | "warning" | "error" | "info"> = {
        active: "success",
        trial: "info",
        past_due: "warning",
        cancelled: "error",
    };

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                    {icon}
                </div>
                <span className="text-sm text-gray-600">{title}</span>
            </div>
            <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-gray-900">{value}</p>
                {status && (
                    <Badge color={statusColors[status]} variant="light" size="sm">
                        {status.replace("_", " ")}
                    </Badge>
                )}
            </div>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
    );
}

function InvoiceRow({ invoice }: { invoice: BillingInvoice }) {
    const statusColors: Record<string, "success" | "warning" | "error"> = {
        paid: "success",
        pending: "warning",
        failed: "error",
    };

    return (
        <TableRow className="hover:bg-gray-50">
            <TableCell className="px-4 py-3 font-mono text-sm text-gray-900">
                {invoice.invoiceNumber}
            </TableCell>
            <TableCell className="px-4 py-3 font-medium text-gray-900">
                ${invoice.amount.toFixed(2)}
            </TableCell>
            <TableCell className="px-4 py-3">
                <Badge color={statusColors[invoice.status]} variant="light" size="sm">
                    {invoice.status}
                </Badge>
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-600">
                {new Date(invoice.dueDate).toLocaleDateString()}
            </TableCell>
            <TableCell className="px-4 py-3 text-sm text-gray-600">
                {invoice.paidAt
                    ? new Date(invoice.paidAt).toLocaleDateString()
                    : "—"}
            </TableCell>
        </TableRow>
    );
}
