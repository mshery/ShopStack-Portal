import { useState, useCallback } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { usePurchasesStore } from "../../stores/purchases.store";
import { useExpensesStore } from "../../stores/expenses.store";
import { useActivityLogsStore } from "../../stores/activityLogs.store";
import { useVendorsStore } from "../../stores/vendors.store";
import { useAuthStore } from "../../stores/auth.store";
import type { Purchase, PurchaseStatus } from "../../types";

interface EditPurchaseModalProps {
  purchase: Purchase;
  isOpen: boolean;
  onClose: () => void;
}

// Inner component that resets when purchase.id changes via key prop
function EditPurchaseModalInner({
  purchase,
  isOpen,
  onClose,
}: EditPurchaseModalProps) {
  const { updatePurchase } = usePurchasesStore();
  const { addExpense } = useExpensesStore();
  const { addTenantLog } = useActivityLogsStore();
  const { vendors } = useVendorsStore();
  const { currentUser } = useAuthStore();

  // Initialize state from props - no effect needed since key resets component
  const [status, setStatus] = useState<PurchaseStatus>(purchase.status);
  const [notes, setNotes] = useState(purchase.notes);

  const generateId = useCallback((prefix: string) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const handleSave = useCallback(() => {
    const now = new Date().toISOString();
    const userId = currentUser?.id || "system";
    const wasReceived = purchase.status === "received";
    const isNowReceived = status === "received";

    // Update purchase
    updatePurchase(purchase.id, {
      status,
      notes,
      receivedDate: status === "received" ? purchase.receivedDate || now : null,
    });

    // Log vendor_payment expense when status changes TO "received"
    if (!wasReceived && isNowReceived) {
      const vendor = vendors.find((v) => v.id === purchase.vendorId);
      const vendorName = vendor?.name || "Unknown Vendor";
      const expenseId = generateId("exp");

      // Create vendor_payment expense
      addExpense({
        id: expenseId,
        tenant_id: purchase.tenant_id,
        category: "vendor_payment",
        expenseType: "vendor_payment",
        amount: purchase.totalCost,
        description: `Vendor payment - ${vendorName} for ${purchase.purchaseNumber}`,
        vendor: vendorName,
        relatedVendorId: purchase.vendorId,
        relatedProductId: null,
        relatedPurchaseId: purchase.id,
        receiptUrl: null,
        date: now,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
      });

      // Log expense creation
      addTenantLog({
        id: generateId("tlog"),
        tenant_id: purchase.tenant_id,
        action: "expense_created",
        actorId: userId,
        targetType: "expense",
        targetId: expenseId,
        details: {
          category: "vendor_payment",
          expenseType: "vendor_payment",
          amount: purchase.totalCost,
          vendorName,
          purchaseNumber: purchase.purchaseNumber,
        },
        createdAt: now,
      });

      // Log purchase received
      addTenantLog({
        id: generateId("tlog"),
        tenant_id: purchase.tenant_id,
        action: "purchase_received",
        actorId: userId,
        targetType: "purchase",
        targetId: purchase.id,
        details: {
          purchaseNumber: purchase.purchaseNumber,
          totalCost: purchase.totalCost,
          vendorName,
        },
        createdAt: now,
      });
    }

    onClose();
  }, [
    purchase,
    status,
    notes,
    currentUser,
    vendors,
    updatePurchase,
    addExpense,
    addTenantLog,
    generateId,
    onClose,
  ]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] m-4">
      <div className="relative w-full max-w-[600px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Purchase Order
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update purchase order status and notes.
          </p>
        </div>
        <form
          className="flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="px-2 pb-3">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5">
              <div>
                <Label>Purchase Order Number</Label>
                <Input
                  type="text"
                  value={purchase.purchaseNumber}
                  disabled
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>

              <div>
                <Label>Total Cost</Label>
                <Input
                  type="text"
                  value={`$${purchase.totalCost.toFixed(2)}`}
                  disabled
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>

              <div>
                <Label>Status *</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as PurchaseStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {purchase.status !== "received" && status === "received" && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    A vendor payment expense will be created when saved.
                  </p>
                )}
              </div>

              <div>
                <Label>Notes</Label>
                <Input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes..."
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

// Wrapper component that uses key to reset inner component when purchase changes
export default function EditPurchaseModal(props: EditPurchaseModalProps) {
  return <EditPurchaseModalInner key={props.purchase.id} {...props} />;
}
