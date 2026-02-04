import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useVendorsFetch } from "@/modules/vendors/api/queries";
import { useCreatePurchase } from "@/modules/purchases/api/queries";
import { Plus, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { AsyncProductSelect } from "@/modules/products/components/AsyncProductSelect";
import type { Product } from "@/modules/products/api/productsApi";
import { useTenantCurrency } from "@/modules/tenant";

interface AddPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
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
  onSuccess,
}: AddPurchaseModalProps) {
  // Data Fetching
  const { data: vendors = [] } = useVendorsFetch();
  const { formatPrice } = useTenantCurrency();

  const createPurchaseMutation = useCreatePurchase();

  const [vendorId, setVendorId] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        productId: "",
        productName: "",
        quantity: 1,
        costPrice: 0,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index: number, product: Product) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      productId: product.id,
      productName: product.name,
      costPrice: Number(product.costPrice),
    };
    setLineItems(updated);
  };

  const updateLineItem = (
    index: number,
    field: keyof LineItem,
    value: string | number,
  ) => {
    const updated = [...lineItems];
    if (field === "quantity") {
      updated[index] = {
        ...updated[index],
        quantity: Math.max(1, Number(value)),
      };
    } else if (field === "costPrice") {
      updated[index] = {
        ...updated[index],
        costPrice: Math.max(0, Number(value)),
      };
    }
    setLineItems(updated);
  };

  const totalCost = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.costPrice,
    0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vendorId || lineItems.length === 0) {
      toast.error("Please select a vendor and add at least one item");
      return;
    }

    if (lineItems.some((item) => !item.productId)) {
      toast.error("Please select a product for all items");
      return;
    }

    setIsSubmitting(true);
    try {
      await createPurchaseMutation.mutateAsync({
        vendorId,
        items: lineItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          costPrice: item.costPrice,
        })),
        notes,
      });

      toast.success("Purchase order created successfully");

      // Reset form
      setVendorId(undefined);
      setNotes("");
      setLineItems([]);

      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Failed to create purchase order");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 lg:col-span-1">
                {/* Status is always pending on create via API typically, or we let backend handle default */}
                <div className="flex flex-col gap-2">
                  <Label>Status</Label>
                  <div className="h-10 flex items-center px-3 rounded-md border border-gray-200 bg-gray-50 text-gray-500 text-sm">
                    Pending (Draft)
                  </div>
                </div>
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
                      <AsyncProductSelect
                        value={item.productId}
                        onSelect={(product) =>
                          handleProductSelect(index, product)
                        }
                      />
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
                        {formatPrice(item.quantity * item.costPrice)}
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
                      {formatPrice(totalCost)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={lineItems.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Purchase Order"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
