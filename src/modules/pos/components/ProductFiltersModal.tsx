import { useState, useCallback, useMemo, useEffect } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { RotateCcw, Check } from "lucide-react";

// Local filter type for the modal
export interface ModalFilters {
  category?: string | null;
  brand?: string | null;
  stockStatus?: "all" | "in_stock" | "low_stock" | "out_of_stock";
  minPrice?: number;
  maxPrice?: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface Brand {
  id: string;
  name: string;
}

interface ProductFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ModalFilters;
  onApply: (filters: ModalFilters) => void;
  categories: Category[];
  brands: Brand[];
  priceBounds: { min: number; max: number };
}

const STOCK_STATUS_OPTIONS = [
  { value: "all", label: "All Stock Levels" },
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
] as const;

const getDefaultFilters = (): ModalFilters => ({
  category: undefined,
  brand: undefined,
  stockStatus: undefined,
  minPrice: undefined,
  maxPrice: undefined,
});

export function ProductFiltersModal({
  open,
  onOpenChange,
  filters,
  onApply,
  categories,
  brands,
  priceBounds,
}: ProductFiltersModalProps) {
  // Local state for filter values (changes applied on "Apply" click)
  const [localFilters, setLocalFilters] = useState<ModalFilters>(filters);

  // Sync local state when modal opens
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line
      setLocalFilters(filters);
    }
  }, [open, filters]);

  const handleReset = useCallback(() => {
    setLocalFilters(getDefaultFilters());
  }, []);

  const handleApply = useCallback(() => {
    onApply(localFilters);
    onOpenChange(false);
  }, [localFilters, onApply, onOpenChange]);

  const updateFilter = useCallback(
    <K extends keyof ModalFilters>(key: K, value: ModalFilters[K]) => {
      setLocalFilters((prev: ModalFilters) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (localFilters.category) count++;
    if (localFilters.brand) count++;
    if (localFilters.stockStatus && localFilters.stockStatus !== "all") count++;
    if (localFilters.minPrice !== undefined) count++;
    if (localFilters.maxPrice !== undefined) count++;
    return count;
  }, [localFilters]);

  // Standard select input class from EditProductModal
  const selectClassName =
    "w-full h-11 px-4 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500";

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      className="max-w-[700px] m-4"
      showCloseButton={true}
    >
      <div className="relative w-full max-w-[700px] rounded-3xl bg-white dark:bg-gray-900 overflow-hidden">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="mb-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Filter Products
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Refine your product search by category, brand, stock, or price.
          </p>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 lg:p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
            {/* Category */}
            <div className="col-span-2 lg:col-span-1">
              <Label className="mb-2 block">Category</Label>
              <select
                value={localFilters.category || "all"}
                onChange={(e) =>
                  updateFilter(
                    "category",
                    e.target.value === "all" ? undefined : e.target.value,
                  )
                }
                className={selectClassName}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div className="col-span-2 lg:col-span-1">
              <Label className="mb-2 block">Brand</Label>
              <select
                value={localFilters.brand || "all"}
                onChange={(e) =>
                  updateFilter(
                    "brand",
                    e.target.value === "all" ? undefined : e.target.value,
                  )
                }
                className={selectClassName}
              >
                <option value="all">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Status */}
            <div className="col-span-2">
              <Label className="mb-2 block">Stock Status</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STOCK_STATUS_OPTIONS.map((option) => {
                  const isSelected =
                    (localFilters.stockStatus || "all") === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        updateFilter(
                          "stockStatus",
                          option.value === "all" ? undefined : option.value,
                        )
                      }
                      className={`px-2 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                        isSelected
                          ? "bg-brand-500 text-white border-brand-600 shadow-sm"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="col-span-2">
              <Label className="mb-2 block">Price Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    Rs
                  </span>
                  <Input
                    type="number"
                    placeholder={`Min: ${priceBounds.min}`}
                    value={localFilters.minPrice ?? ""}
                    onChange={(e) =>
                      updateFilter(
                        "minPrice",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className="pl-8"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    Rs
                  </span>
                  <Input
                    type="number"
                    placeholder={`Max: ${priceBounds.max}`}
                    value={localFilters.maxPrice ?? ""}
                    onChange={(e) =>
                      updateFilter(
                        "maxPrice",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 lg:p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Filters
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} className="min-w-[140px]">
              <Check className="w-4 h-4 mr-2" />
              {activeFiltersCount > 0
                ? `Apply (${activeFiltersCount})`
                : "Apply Filters"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ProductFiltersModal;
