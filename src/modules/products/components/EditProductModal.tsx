import { useState, useMemo, useCallback } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useAuthStore } from "@/modules/auth";
import {
  useCategoriesFetch,
  useBrandsFetch,
} from "@/modules/catalog/api/queries";
import { useCreateAdjustment } from "@/modules/inventory/api/queries";
import type {
  Product,
  TenantUser,
  InventoryAdjustmentReason,
} from "@/shared/types/models";
import {
  productsApi,
  type UpdateProductInput,
} from "@/modules/products/api/productsApi";

interface EditProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: UpdateProductInput) => Promise<unknown>;
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
  onUpdate,
}: EditProductModalProps) {
  // const { updateProduct } = useProductsStore(); // Removed legacy store usage
  const { mutateAsync: createAdjustment } = useCreateAdjustment();
  // const { addAdjustment } = useInventoryStore(); // Removed legacy
  // const { addExpense } = useExpensesStore();
  // const { addTenantLog } = useActivityLogsStore();
  const { currentUser, activeTenantId } = useAuthStore();

  // Fetch categories and brands via TanStack Query (not Zustand stores)
  const { data: categories = [] } = useCategoriesFetch();
  const { data: brands = [] } = useBrandsFetch();

  const [isUploading, setIsUploading] = useState(false);

  // Filter by tenant (API should already return tenant-scoped data, but keep for safety)
  const tenantCategories = categories.filter(
    (c) => c.tenantId === activeTenantId,
  );
  const tenantBrands = brands.filter((b) => b.tenantId === activeTenantId);

  const isOwner = (currentUser as TenantUser)?.role === "owner";

  // Stepper state
  const [currentStep, setCurrentStep] = useState<Step>("info");

  const [formData, setFormData] = useState({
    name: product.name,
    sku: product.sku,
    categoryId: product.categoryId,
    brandId: product.brandId,
    unitPrice: product.unitPrice,
    imageUrl: product.imageUrl,
    productType: product.productType || "unit",
    minSaleWeight: product.minSaleWeight || 0.1,
    weightIncrement: product.weightIncrement || 0.001,
  });

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      return; // TODO: Show error
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return; // TODO: Show error
    }

    try {
      setIsUploading(true);
      const url = await productsApi.uploadImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: url }));
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Stock adjustment state (owner only)
  const [stockAction, setStockAction] = useState<StockAction>("");
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<number>(0);
  const [setStockTo, setSetStockTo] = useState<number>(product.currentStock);
  const [adjustmentNotes, setAdjustmentNotes] = useState("");

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = useCallback(async () => {
    // Prepare unified update data
    const updateData: UpdateProductInput = { ...formData };

    // Handle stock adjustment logic if needed
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

      // Only proceed with stock logic if there's an actual change or forcing correction
      if (quantityChange !== 0 || stockAction === "count_correction") {
        // Calculate cost impact
        let costImpact = 0;
        if (stockAction === "damaged" || stockAction === "theft") {
          costImpact = product.costPrice * Math.abs(quantityChange);
        }

        // Update product stock in the SAME update object
        updateData.currentStock = newStock;
        updateData.status =
          newStock <= 0
            ? "out_of_stock"
            : newStock <= product.minimumStock
              ? "low_stock"
              : "in_stock";

        // Create inventory adjustment record via API
        try {
          await createAdjustment({
            productId: product.id,
            reason: stockAction,
            quantityChange,
            costImpact,
            notes: adjustmentNotes,
          });
        } catch (error) {
          console.error("Failed to create inventory adjustment:", error);
        }
      }
    }

    // Execute SINGLE update call for Product Details (Name, Price, Current Stock)
    await onUpdate(product.id, updateData);

    onClose();
  }, [
    product,
    formData,
    isOwner,
    stockAction,
    adjustmentQuantity,
    setStockTo,
    adjustmentNotes,
    onUpdate,
    createAdjustment,
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

                  {/* Product Type Selection */}
                  <div className="col-span-2">
                    <Label className="mb-2 block">Product Type</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="productType"
                          value="unit"
                          checked={formData.productType === "unit"}
                          onChange={() => handleChange("productType", "unit")}
                          className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Unit (Piece)
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="productType"
                          value="weighted"
                          checked={formData.productType === "weighted"}
                          onChange={() =>
                            handleChange("productType", "weighted")
                          }
                          className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Weighted (Kg)
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Label>Product Image</Label>
                    <div className="flex items-center gap-4 mt-2">
                      {formData.imageUrl && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                          <img
                            src={formData.imageUrl}
                            alt="Product"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                          className="cursor-pointer"
                        />
                        {isUploading && (
                          <p className="text-xs text-brand-500 mt-1">
                            Uploading...
                          </p>
                        )}
                      </div>
                    </div>
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
                    <select
                      value={formData.categoryId}
                      onChange={(e) =>
                        handleChange("categoryId", e.target.value)
                      }
                      className="w-full h-11 px-4 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="">Select a category</option>
                      {tenantCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Brand</Label>
                    <select
                      value={formData.brandId}
                      onChange={(e) => handleChange("brandId", e.target.value)}
                      className="w-full h-11 px-4 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="">Select a brand</option>
                      {tenantBrands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>
                      {formData.productType === "weighted"
                        ? "Price per Kg ($)"
                        : "Unit Price ($)"}
                    </Label>
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
                    <Label>
                      {formData.productType === "weighted"
                        ? "Current Stock (Kg)"
                        : "Current Stock"}
                    </Label>
                    <div className="flex items-center gap-2 h-11 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                      <span className="text-gray-900 dark:text-white font-medium">
                        {product.currentStock}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {formData.productType === "weighted" ? "kg" : "units"}
                      </span>
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
                        min={
                          formData.productType === "weighted" ? "0.001" : "1"
                        }
                        step={
                          formData.productType === "weighted" ? "0.001" : "1"
                        }
                        value={adjustmentQuantity || ""}
                        onChange={(e) =>
                          setAdjustmentQuantity(parseFloat(e.target.value) || 0)
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
                        step={
                          formData.productType === "weighted" ? "0.001" : "1"
                        }
                        value={setStockTo}
                        onChange={(e) =>
                          setSetStockTo(parseFloat(e.target.value) || 0)
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
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentStep("stock");
                }}
              >
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
