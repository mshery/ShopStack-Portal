import { useState, useCallback } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useExpensesStore } from "../../stores/expenses.store";
import { useActivityLogsStore } from "../../stores/activityLogs.store";
import { useAuthStore } from "../../stores/auth.store";
import type { ExpenseCategory, ExpenseType } from "../../types";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "rent", label: "Rent" },
  { value: "utilities", label: "Utilities" },
  { value: "salaries", label: "Salaries" },
  { value: "marketing", label: "Marketing" },
  { value: "maintenance", label: "Maintenance" },
  { value: "supplies", label: "Supplies" },
  { value: "taxes", label: "Taxes" },
  { value: "insurance", label: "Insurance" },
  { value: "inventory", label: "Inventory" },
  { value: "vendor_payment", label: "Vendor Payment" },
  { value: "other", label: "Other" },
];

const EXPENSE_TYPES: { value: ExpenseType; label: string }[] = [
  { value: "operational", label: "Operational" },
  { value: "inventory_loss", label: "Inventory Loss" },
  { value: "purchase_order", label: "Purchase Order" },
  { value: "vendor_payment", label: "Vendor Payment" },
];

export default function AddExpenseModal({
  isOpen,
  onClose,
}: AddExpenseModalProps) {
  const { addExpense } = useExpensesStore();
  const { addTenantLog } = useActivityLogsStore();
  const { currentUser, activeTenantId } = useAuthStore();

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    date: today,
    category: "other" as ExpenseCategory,
    expenseType: "operational" as ExpenseType,
    amount: "",
    description: "",
    vendor: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const generateId = useCallback((prefix: string) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.amount, formData.description, formData.date]);

  const handleSubmit = useCallback(() => {
    if (!validate()) return;

    const userId = currentUser?.id || "system";
    const tenantId = activeTenantId || "";

    const expenseId = generateId("exp");
    const amount = parseFloat(formData.amount);

    // Create expense record
    addExpense({
      tenant_id: tenantId,
      category: formData.category,
      expenseType: formData.expenseType,
      amount,
      description: formData.description.trim(),
      vendor: formData.vendor.trim() || null,
      relatedVendorId: null,
      relatedProductId: null,
      relatedPurchaseId: null,
      receiptUrl: null,
      date: new Date(formData.date).toISOString(),
      createdBy: userId,
    });

    // Log expense creation
    addTenantLog({
      id: generateId("tlog"),
      tenant_id: tenantId,
      action: "expense_created",
      actorId: userId,
      targetType: "expense",
      targetId: expenseId,
      details: {
        category: formData.category,
        expenseType: formData.expenseType,
        amount,
      },
    });

    // Reset form and close
    setFormData({
      date: today,
      category: "other",
      expenseType: "operational",
      amount: "",
      description: "",
      vendor: "",
    });
    setErrors({});
    onClose();
  }, [
    validate,
    formData,
    currentUser,
    activeTenantId,
    addExpense,
    addTenantLog,
    generateId,
    onClose,
    today,
  ]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] m-4">
      <div className="relative w-full max-w-[600px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Add Expense
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Record a new business expense.
          </p>
        </div>
        <form
          className="flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="px-2 pb-3">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              {/* Date */}
              <div className="col-span-2 lg:col-span-1">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                />
                {errors.date && (
                  <p className="text-xs text-red-500 mt-1">{errors.date}</p>
                )}
              </div>

              {/* Amount */}
              <div className="col-span-2 lg:col-span-1">
                <Label>Amount ($) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
                )}
              </div>

              {/* Category */}
              <div className="col-span-2 lg:col-span-1">
                <Label>Category *</Label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="w-full h-11 px-4 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Expense Type */}
              <div className="col-span-2 lg:col-span-1">
                <Label>Expense Type *</Label>
                <select
                  value={formData.expenseType}
                  onChange={(e) => handleChange("expenseType", e.target.value)}
                  className="w-full h-11 px-4 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {EXPENSE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="col-span-2">
                <Label>Description *</Label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Describe this expense..."
                  rows={2}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.description && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Vendor */}
              <div className="col-span-2">
                <Label>Vendor (optional)</Label>
                <Input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => handleChange("vendor", e.target.value)}
                  placeholder="Vendor or payee name"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Expense</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
