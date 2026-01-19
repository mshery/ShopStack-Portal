import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useExpensesStore } from "@/stores/expenses.store";
import { useAuthStore } from "@/stores/auth.store";
import { useVendorsStore } from "@/stores/vendors.store";
import { useProductsStore } from "@/stores/products.store";
import { usePurchasesStore } from "@/stores/purchases.store";
import type { ExpenseCategory, ExpenseType } from "@/types";

export default function AddExpensePage() {
  const navigate = useNavigate();
  const { addExpense } = useExpensesStore();
  const { activeTenantId, currentUser } = useAuthStore();
  const { vendors } = useVendorsStore();
  const { products } = useProductsStore();
  const { purchases } = usePurchasesStore();

  const [formData, setFormData] = useState({
    category: "other" as ExpenseCategory,
    expenseType: "operational" as ExpenseType,
    amount: "",
    description: "",
    vendor: "",
    relatedVendorId: "",
    relatedProductId: "",
    relatedPurchaseId: "",
    receiptUrl: "",
    date: new Date().toISOString().split("T")[0], // Today's date
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeTenantId || !currentUser) return;

    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }

    if (!formData.description.trim()) {
      alert("Please enter a description");
      return;
    }

    // Validate conditional fields
    if (
      (formData.expenseType === "purchase_order" ||
        formData.expenseType === "vendor_payment") &&
      !formData.relatedVendorId
    ) {
      alert("Please select a vendor for this expense type");
      return;
    }

    if (
      (formData.expenseType === "inventory_loss" ||
        formData.expenseType === "purchase_order") &&
      !formData.relatedProductId
    ) {
      alert("Please select a product for this expense type");
      return;
    }

    if (
      (formData.expenseType === "purchase_order" ||
        formData.expenseType === "vendor_payment") &&
      !formData.relatedPurchaseId
    ) {
      alert("Please select a purchase order for this expense type");
      return;
    }

    // Create expense
    addExpense({
      tenant_id: activeTenantId,
      category: formData.category,
      expenseType: formData.expenseType,
      amount: parseFloat(formData.amount),
      description: formData.description,
      vendor: formData.vendor || null,
      relatedVendorId: formData.relatedVendorId || null,
      relatedProductId: formData.relatedProductId || null,
      relatedPurchaseId: formData.relatedPurchaseId || null,
      receiptUrl: formData.receiptUrl || null,
      date: formData.date,
      createdBy: currentUser.id,
    });

    // Navigate back to expenses page
    navigate("/tenant/expenses");
  };

  // Filter data for current tenant
  const tenantVendors = vendors.filter((v) => v.tenant_id === activeTenantId);
  const tenantProducts = products.filter((p) => p.tenant_id === activeTenantId);
  const tenantPurchases = purchases.filter(
    (p) => p.tenant_id === activeTenantId,
  );

  // Determine which conditional fields to show
  const showVendorField =
    formData.expenseType === "purchase_order" ||
    formData.expenseType === "vendor_payment";
  const showProductField =
    formData.expenseType === "inventory_loss" ||
    formData.expenseType === "purchase_order";
  const showPurchaseField =
    formData.expenseType === "purchase_order" ||
    formData.expenseType === "vendor_payment";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Add Expense
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Record a new business expense
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Expense Category *</Label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                >
                  <option value="rent">Rent</option>
                  <option value="utilities">Utilities</option>
                  <option value="salaries">Salaries</option>
                  <option value="supplies">Supplies</option>
                  <option value="marketing">Marketing</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="insurance">Insurance</option>
                  <option value="taxes">Taxes</option>
                  <option value="inventory">Inventory</option>
                  <option value="vendor_payment">Vendor Payment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label>Expense Type *</Label>
                <select
                  value={formData.expenseType}
                  onChange={(e) => handleChange("expenseType", e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                >
                  <option value="operational">Operational</option>
                  <option value="purchase_order">Purchase Order</option>
                  <option value="inventory_loss">Inventory Loss</option>
                  <option value="vendor_payment">Vendor Payment</option>
                </select>
              </div>

              <div>
                <Label>Amount *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label>Description *</Label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[80px]"
                  placeholder="Enter expense description..."
                  required
                />
              </div>

              <div>
                <Label>Vendor Name (Optional)</Label>
                <Input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => handleChange("vendor", e.target.value)}
                  placeholder="e.g., Office Depot"
                />
              </div>

              <div>
                <Label>Receipt URL (Optional)</Label>
                <Input
                  type="url"
                  value={formData.receiptUrl}
                  onChange={(e) => handleChange("receiptUrl", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Conditional Relations */}
          {(showVendorField || showProductField || showPurchaseField) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Related Records
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {showVendorField && (
                  <div>
                    <Label>Related Vendor *</Label>
                    <select
                      value={formData.relatedVendorId}
                      onChange={(e) =>
                        handleChange("relatedVendorId", e.target.value)
                      }
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    >
                      <option value="">Select vendor...</option>
                      {tenantVendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {showProductField && (
                  <div>
                    <Label>Related Product *</Label>
                    <select
                      value={formData.relatedProductId}
                      onChange={(e) =>
                        handleChange("relatedProductId", e.target.value)
                      }
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    >
                      <option value="">Select product...</option>
                      {tenantProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {showPurchaseField && (
                  <div>
                    <Label>Related Purchase Order *</Label>
                    <select
                      value={formData.relatedPurchaseId}
                      onChange={(e) =>
                        handleChange("relatedPurchaseId", e.target.value)
                      }
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    >
                      <option value="">Select purchase order...</option>
                      {tenantPurchases.map((purchase) => (
                        <option key={purchase.id} value={purchase.id}>
                          {purchase.purchaseNumber} - $
                          {purchase.totalCost.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/tenant/expenses")}
            >
              Cancel
            </Button>
            <Button type="submit">Add Expense</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
