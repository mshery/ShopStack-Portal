import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { formatCurrency } from "@/shared/utils/format";
import type { Product } from "@/shared/types/models";

interface WeightInputModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (product: Product, weight: number) => void;
}

export function WeightInputModal({
  product,
  isOpen,
  onClose,
  onConfirm,
}: WeightInputModalProps) {
  const [weight, setWeight] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!product) return;

    const weightValue = parseFloat(weight);

    if (isNaN(weightValue) || weightValue <= 0) {
      setError("Please enter a valid weight");
      return;
    }

    const minWeight = product.minSaleWeight || 0.001;
    if (weightValue < minWeight) {
      setError(`Minimum weight is ${minWeight} kg`);
      return;
    }

    if (weightValue > product.currentStock) {
      setError(`Only ${product.currentStock} kg available`);
      return;
    }

    onConfirm(product, weightValue);
    onClose();
  };

  if (!product) return null;

  const numericWeight = parseFloat(weight) || 0;
  const totalPrice = numericWeight * product.unitPrice;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Enter Weight: ${product.name}`}
      className="max-w-md w-full m-4"
    >
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Label>Weight (kg)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.001"
              min="0" // Allow typing 0.x
              placeholder="0.000"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                setError(null);
              }}
              className="text-lg font-medium"
              autoFocus
            />
            <div className="flex items-center justify-center px-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 font-medium">
              kg
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Unit Price</p>
            <p className="font-medium">
              {formatCurrency(product.unitPrice)} / kg
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Price</p>
            <p className="text-xl font-bold text-brand-600 dark:text-brand-400">
              {formatCurrency(totalPrice)}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!weight || parseFloat(weight) <= 0}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </Modal>
  );
}
