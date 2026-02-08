import { useState, useCallback } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { X } from "lucide-react";
import { useCreateExpense } from "../api/queries";
import { useAuthStore } from "@/modules/auth"; // For userType check if needed
import type { ExpenseCategory, ExpenseType } from "@/shared/types/models";

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
  const createMutation = useCreateExpense();
  const { activeTenantId } = useAuthStore();

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
    setFormData((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: any = { [field]: value };

      // Auto-select corresponding expense type
      if (field === "category") {
        if (value === "vendor_payment") {
          updates.expenseType = "vendor_payment";
        } else if (value === "inventory") {
          // Default to operational for inventory (purchases),
          // user can manually select "inventory_loss" if needed
          updates.expenseType = "operational";
        }
      }
      return { ...prev, ...updates };
    });

    // Clear error when field is modified
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

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
    if (!activeTenantId) {
      setErrors((prev) => ({ ...prev, form: "Session error. Please reload." }));
      return;
    }

    createMutation.mutate(
      {
        category: formData.category,
        expenseType: formData.expenseType,
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        vendor: formData.vendor.trim() || undefined,
        // API handles createdBy and tenantId from context/token
        date: new Date(formData.date).toISOString(),
      },
      {
        onSuccess: () => {
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
        },
      },
    );
  }, [validate, formData, activeTenantId, createMutation, onClose, today]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[600px] m-4"
      showCloseButton={false}
    >
      <div className="relative w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11 custom-scrollbar">
        {/* Custom Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>
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
          {errors.form && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 rounded-lg text-sm">
              {errors.form}
            </div>
          )}

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
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Adding..." : "Add Expense"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
