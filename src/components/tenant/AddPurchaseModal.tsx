import { useState, useMemo, useCallback } from "react";
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
import { useVendorsStore } from "../../stores/vendors.store";
import { useProductsStore } from "../../stores/products.store";
import { useExpensesStore } from "../../stores/expenses.store";
import { useActivityLogsStore } from "../../stores/activityLogs.store";
import { useAuthStore } from "../../stores/auth.store";
import type { PurchaseStatus } from "../../types";
import { Plus, X } from "lucide-react";

interface AddPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LineItem {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
}

export default function AddPurchaseModal({
  isOpen,
  onClose,
}: AddPurchaseModalProps) {
  const { addPurchase } = usePurchasesStore();
  const { vendors } = useVendorsStore();
  const { products } = useProductsStore();
  const { addExpense } = useExpensesStore();
  const { addTenantLog } = useActivityLogsStore();
  const { activeTenantId, currentUser } = useAuthStore();

  const [vendorId, setVendorId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<PurchaseStatus>("pending");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  const tenantVendors = useMemo(
    () => vendors.filter((v) => v.tenant_id === activeTenantId),
    [vendors, activeTenantId],
  );
  const tenantProducts = useMemo(
    () => products.filter((p) => p.tenant_id === activeTenantId),
    [products, activeTenantId],
  );

  const generateId = useCallback((prefix: string) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addLineItem = () => {
    if (tenantProducts.length > 0) {
      const firstProduct = tenantProducts[0];
      setLineItems([
        ...lineItems,
        {
          productId: firstProduct.id,
          productName: firstProduct.name,
          quantity: 1,
          costPrice: firstProduct.costPrice,
        },
      ]);
    } else {
      alert("No products found for this tenant. Please add products first.");
    }
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (
    index: number,
    field: keyof LineItem,
    value: string | number,
  ) => {
    const updated = [...lineItems];
    if (field === "productId") {
      const product = tenantProducts.find((p) => p.id === value);
      if (product) {
        updated[index] = {
          ...updated[index],
          productId: value as string,
          productName: product.name,
          costPrice: product.costPrice,
        };
      }
    } else if (field === "quantity") {
      updated[index] = {
        ...updated[index],
        quantity: Math.max(1, value as number),
      };
    } else if (field === "costPrice") {
      updated[index] = {
        ...updated[index],
        costPrice: Math.max(0, value as number),
      };
    }
    setLineItems(updated);
  };

  const totalCost = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.costPrice,
    0,
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!activeTenantId || !vendorId || lineItems.length === 0) {
        alert("Please fill in all required fields and add at least one item");
        return;
      }

      const now = new Date().toISOString();
      const userId = currentUser?.id || "system";
      const vendor = vendors.find((v) => v.id === vendorId);
      const vendorName = vendor?.name || "Unknown Vendor";

      // Add the purchase - store generates id, purchaseNumber, createdAt
      const purchaseId = addPurchase({
        tenant_id: activeTenantId,
        vendorId,
        items: lineItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          costPrice: item.costPrice,
          subtotal: item.quantity * item.costPrice,
        })),
        totalCost,
        status,
        purchaseDate: now,
        receivedDate: status === "received" ? now : null,
        notes,
      });

      // Generate purchase number for logging (store creates one similarly)
      const purchaseNumber = `PO-${Date.now().toString().slice(-6)}`;

      // Create purchase_order expense
      const expenseId = generateId("exp");
      addExpense({
        id: expenseId,
        tenant_id: activeTenantId,
        category: "inventory",
        expenseType: "purchase_order",
        amount: totalCost,
        description: `Purchase Order ${purchaseNumber} - ${vendorName}`,
        vendor: vendorName,
        relatedVendorId: vendorId,
        relatedProductId:
          lineItems.length === 1 ? lineItems[0].productId : null,
        relatedPurchaseId: purchaseId,
        receiptUrl: null,
        date: now,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
      });

      // Log expense creation
      addTenantLog({
        id: generateId("tlog"),
        tenant_id: activeTenantId,
        action: "expense_created",
        actorId: userId,
        targetType: "expense",
        targetId: expenseId,
        details: {
          category: "inventory",
          expenseType: "purchase_order",
          amount: totalCost,
          vendorName,
          purchaseNumber,
        },
        createdAt: now,
      });

      // Log purchase creation
      addTenantLog({
        id: generateId("tlog"),
        tenant_id: activeTenantId,
        action: "purchase_created",
        actorId: userId,
        targetType: "purchase",
        targetId: purchaseId,
        details: {
          purchaseNumber,
          totalCost,
          vendorName,
          itemCount: lineItems.length,
        },
        createdAt: now,
      });

      // If status is "received", also log vendor_payment
      if (status === "received") {
        const vendorPaymentId = generateId("exp");
        addExpense({
          id: vendorPaymentId,
          tenant_id: activeTenantId,
          category: "vendor_payment",
          expenseType: "vendor_payment",
          amount: totalCost,
          description: `Vendor payment - ${vendorName} for ${purchaseNumber}`,
          vendor: vendorName,
          relatedVendorId: vendorId,
          relatedProductId: null,
          relatedPurchaseId: purchaseId,
          receiptUrl: null,
          date: now,
          createdBy: userId,
          createdAt: now,
          updatedAt: now,
        });

        addTenantLog({
          id: generateId("tlog"),
          tenant_id: activeTenantId,
          action: "expense_created",
          actorId: userId,
          targetType: "expense",
          targetId: vendorPaymentId,
          details: {
            category: "vendor_payment",
            expenseType: "vendor_payment",
            amount: totalCost,
            vendorName,
          },
          createdAt: now,
        });
      }

      // Reset form
      setVendorId("");
      setStatus("pending");
      setNotes("");
      setLineItems([]);
      onClose();
    },
    [
      activeTenantId,
      vendorId,
      lineItems,
      status,
      notes,
      totalCost,
      currentUser,
      vendors,
      addPurchase,
      addExpense,
      addTenantLog,
      generateId,
      onClose,
    ],
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[800px] m-4">
      <div className="relative w-full max-w-[800px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            New Purchase Order
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Create a new purchase order for inventory restocking.
          </p>
        </div>
        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="px-2 pb-3 space-y-5">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2 lg:col-span-1">
                <Label>Vendor *</Label>
                <Select value={vendorId} onValueChange={setVendorId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenantVendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 lg:col-span-1">
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
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label>Notes</Label>
                <Input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes..."
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Line Items *</Label>
                <Button
                  type="button"
                  size="sm"
                  onClick={addLineItem}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-3 items-end p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <Label className="text-xs">Product</Label>
                      <Select
                        value={item.productId}
                        onValueChange={(v) =>
                          updateLineItem(index, "productId", v)
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tenantProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 1,
                          )
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="w-28">
                      <Label className="text-xs">Cost Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.costPrice}
                        onChange={(e) =>
                          updateLineItem(
                            index,
                            "costPrice",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="w-28">
                      <Label className="text-xs">Subtotal</Label>
                      <div className="h-9 flex items-center text-sm font-semibold">
                        ${(item.quantity * item.costPrice).toFixed(2)}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      className="h-9 w-9 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {lineItems.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No items added. Click "Add Item" to start.
                  </p>
                )}
              </div>

              {lineItems.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Total Cost</div>
                    <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                      ${totalCost.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Info about expenses that will be created */}
            {lineItems.length > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <strong>Note:</strong> A purchase order expense of{" "}
                  <span className="font-semibold">${totalCost.toFixed(2)}</span>{" "}
                  will be recorded.
                  {status === "received" && (
                    <> Additionally, a vendor payment will be logged.</>
                  )}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={lineItems.length === 0}>
              Create Purchase Order
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
