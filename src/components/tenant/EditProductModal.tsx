import { useState, useMemo, useCallback } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useProductsStore } from "../../stores/products.store";
import { useInventoryStore } from "../../stores/inventory.store";
import { useExpensesStore } from "../../stores/expenses.store";
import { useActivityLogsStore } from "../../stores/activityLogs.store";
import { useAuthStore } from "../../stores/auth.store";
import type {
  Product,
  TenantUser,
  InventoryAdjustmentReason,
} from "../../types";

interface EditProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

type StockAction = InventoryAdjustmentReason | "";
type Step = "info" | "stock";

const STOCK_ACTIONS: { value: StockAction; label: string }[] = [
  { value: "", label: "No adjustment" },
  { value: "restock", label: "Restock" },
  { value: "return", label: "Customer Return" },
  { value: "damaged", label: "Damaged" },
  { value: "theft", label: "Theft" },
  { value: "count_correction", label: "Count Correction" },
];

export default function EditProductModal({
  product,
  isOpen,
  onClose,
}: EditProductModalProps) {
  const { updateProduct } = useProductsStore();
  const { addAdjustment } = useInventoryStore();
  const { addExpense } = useExpensesStore();
  const { addTenantLog } = useActivityLogsStore();
  const { currentUser } = useAuthStore();

  const isOwner = (currentUser as TenantUser)?.role === "owner";

  // Stepper state
  const [currentStep, setCurrentStep] = useState<Step>("info");

  const [formData, setFormData] = useState({
    name: product.name,
    sku: product.sku,
    category: product.category,
    brand: product.brand,
    unitPrice: product.unitPrice,
  });

  // Stock adjustment state (owner only)
  const [stockAction, setStockAction] = useState<StockAction>("");
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<number>(0);
  const [setStockTo, setSetStockTo] = useState<number>(product.currentStock);
  const [adjustmentNotes, setAdjustmentNotes] = useState("");

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateId = useCallback((prefix: string) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const handleSave = useCallback(() => {
    const now = new Date().toISOString();
    const userId = currentUser?.id || "system";

    // Update basic product info
    updateProduct(product.id, formData);

    // Handle stock adjustment if action selected (owner only)
    if (isOwner && stockAction) {
      const previousStock = product.currentStock;
      let quantityChange = 0;
      let newStock = previousStock;

      // Compute quantity change based on action
      switch (stockAction) {
        case "restock":
        case "return":
          quantityChange = Math.abs(adjustmentQuantity);
          newStock = previousStock + quantityChange;
          break;
        case "damaged":
        case "theft":
          quantityChange = -Math.abs(adjustmentQuantity);
          newStock = Math.max(0, previousStock + quantityChange);
          break;
        case "count_correction":
          newStock = Math.max(0, setStockTo);
          quantityChange = newStock - previousStock;
          break;
        default:
          break;
      }

      // Only proceed if there's an actual change
      if (quantityChange !== 0 || stockAction === "count_correction") {
        // Calculate cost impact
        let costImpact = 0;
        if (stockAction === "damaged" || stockAction === "theft") {
          costImpact = product.costPrice * Math.abs(quantityChange);
        }

        // Update product stock
        const statusUpdate =
          newStock <= 0
            ? "out_of_stock"
            : newStock <= product.minimumStock
              ? "low_stock"
              : "in_stock";

        updateProduct(product.id, {
          currentStock: newStock,
          status: statusUpdate,
        });

        // Create expense for inventory loss (damaged/theft)
        let relatedExpenseId: string | null = null;
        if (
          (stockAction === "damaged" || stockAction === "theft") &&
          costImpact > 0
        ) {
          const expenseId = generateId("exp");
          relatedExpenseId = expenseId;

          addExpense({
            tenant_id: product.tenant_id,
            category: "inventory",
            expenseType: "inventory_loss",
            amount: costImpact,
            description: `Inventory loss - ${product.name} (${stockAction})`,
            vendor: null,
            relatedVendorId: null,
            relatedProductId: product.id,
            relatedPurchaseId: null,
            receiptUrl: null,
            date: now,
            createdBy: userId,
          });

          // Log expense creation
          addTenantLog({
            id: generateId("tlog"),
            tenant_id: product.tenant_id,
            action: "expense_created",
            actorId: userId,
            targetType: "expense",
            targetId: expenseId,
            details: {
              category: "inventory",
              expenseType: "inventory_loss",
              amount: costImpact,
              productName: product.name,
            },
          });
        }

        // Create inventory adjustment record
        const adjustmentId = generateId("inv-adj");
        addAdjustment({
          id: adjustmentId,
          tenant_id: product.tenant_id,
          productId: product.id,
          productName: product.name,
          reason: stockAction as InventoryAdjustmentReason,
          quantityChange,
          previousStock,
          newStock,
          costImpact,
          relatedExpenseId,
          notes: adjustmentNotes,
          createdBy: userId,
        });

        // Log inventory adjustment
        addTenantLog({
          id: generateId("tlog"),
          tenant_id: product.tenant_id,
          action: "inventory_adjusted",
          actorId: userId,
          targetType: "product",
          targetId: product.id,
          details: {
            productName: product.name,
            reason: stockAction,
            quantityChange,
            previousStock,
            newStock,
          },
        });
      }
    }

    onClose();
  }, [
    currentUser,
    product,
    formData,
    isOwner,
    stockAction,
    adjustmentQuantity,
    setStockTo,
    adjustmentNotes,
    updateProduct,
    addAdjustment,
    addExpense,
    addTenantLog,
    generateId,
    onClose,
  ]);

  // Memoized VM for stock action display
  const showQuantityInput = useMemo(() => {
    return stockAction !== "" && stockAction !== "count_correction";
  }, [stockAction]);

  const showSetStockInput = useMemo(() => {
    return stockAction === "count_correction";
  }, [stockAction]);

  const steps = useMemo(() => {
    const baseSteps = [{ id: "info" as Step, label: "Product Info" }];
    if (isOwner) {
      baseSteps.push({ id: "stock" as Step, label: "Adjust Stock" });
    }
    return baseSteps;
  }, [isOwner]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
      <div className="relative w-full max-w-[700px] rounded-3xl bg-white dark:bg-gray-900 overflow-hidden">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="pr-10">
            <h4 className="mb-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Product
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update product details to keep your inventory up-to-date.
            </p>
          </div>

          {/* Stepper */}
          {steps.length > 1 && (
            <div className="mt-4 flex gap-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
                    currentStep === step.id
                      ? "bg-brand-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="mr-2">{index + 1}.</span>
                  {step.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 lg:p-6 max-h-[60vh] overflow-y-auto">
          <form
            id="edit-product-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            {/* Step 1: Product Information */}
            {currentStep === "info" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2">
                    <Label>Product Name</Label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>SKU</Label>
                    <Input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => handleChange("sku", e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Category</Label>
                    <Input
                      type="text"
                      value={formData.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Brand</Label>
                    <Input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => handleChange("brand", e.target.value)}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Unit Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={(e) =>
                        handleChange("unitPrice", parseFloat(e.target.value))
                      }
                    />
                  </div>

                  {/* Current Stock - Readonly Display */}
                  <div className="col-span-2">
                    <Label>Current Stock</Label>
                    <div className="flex items-center gap-2 h-11 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                      <span className="text-gray-900 dark:text-white font-medium">
                        {product.currentStock}
                      </span>
                      <span className="text-gray-500 text-sm">units</span>
                    </div>
                    {isOwner && (
                      <p className="text-xs text-gray-500 mt-1">
                        Go to "Adjust Stock" step to modify stock levels.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Stock Adjustment (Owner Only) */}
            {currentStep === "stock" && isOwner && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Stock Action</Label>
                    <select
                      value={stockAction}
                      onChange={(e) =>
                        setStockAction(e.target.value as StockAction)
                      }
                      className="w-full h-11 px-4 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {STOCK_ACTIONS.map((action) => (
                        <option key={action.value} value={action.value}>
                          {action.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Current Stock</Label>
                    <div className="flex items-center gap-2 h-11 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                      <span className="text-gray-900 dark:text-white font-medium text-lg">
                        {product.currentStock}
                      </span>
                      <span className="text-gray-500 text-sm">units</span>
                    </div>
                  </div>

                  {showQuantityInput && (
                    <div className="col-span-2 lg:col-span-1">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={adjustmentQuantity || ""}
                        onChange={(e) =>
                          setAdjustmentQuantity(parseInt(e.target.value) || 0)
                        }
                        placeholder="Enter quantity"
                      />
                    </div>
                  )}

                  {showSetStockInput && (
                    <div className="col-span-2 lg:col-span-1">
                      <Label>Set Stock To</Label>
                      <Input
                        type="number"
                        min="0"
                        value={setStockTo}
                        onChange={(e) =>
                          setSetStockTo(parseInt(e.target.value) || 0)
                        }
                        placeholder="Enter new stock count"
                      />
                    </div>
                  )}

                  {stockAction && (
                    <div className="col-span-2">
                      <Label>Adjustment Notes</Label>
                      <textarea
                        value={adjustmentNotes}
                        onChange={(e) => setAdjustmentNotes(e.target.value)}
                        placeholder="Optional notes about this adjustment..."
                        rows={2}
                        className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  )}

                  {(stockAction === "damaged" || stockAction === "theft") &&
                    adjustmentQuantity > 0 && (
                      <div className="col-span-2">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-sm text-red-700 dark:text-red-400">
                            <strong>Cost Impact:</strong> This will create an
                            expense of{" "}
                            <span className="font-semibold">
                              $
                              {(product.costPrice * adjustmentQuantity).toFixed(
                                2,
                              )}
                            </span>{" "}
                            for inventory loss.
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Preview of stock change */}
                  {stockAction && (showQuantityInput || showSetStockInput) && (
                    <div className="col-span-2">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          <strong>Preview:</strong> Stock will change from{" "}
                          <span className="font-semibold">
                            {product.currentStock}
                          </span>{" "}
                          to{" "}
                          <span className="font-semibold">
                            {stockAction === "count_correction"
                              ? setStockTo
                              : stockAction === "restock" ||
                                  stockAction === "return"
                                ? product.currentStock + adjustmentQuantity
                                : Math.max(
                                    0,
                                    product.currentStock - adjustmentQuantity,
                                  )}
                          </span>{" "}
                          units
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 lg:p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            {currentStep === "stock" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep("info")}
              >
                ← Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            {currentStep === "info" && isOwner ? (
              <Button type="button" onClick={() => setCurrentStep("stock")}>
                Next: Adjust Stock →
              </Button>
            ) : (
              <Button type="submit" form="edit-product-form">
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
