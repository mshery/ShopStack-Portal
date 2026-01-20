import { memo, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  Plus,
  ShoppingCart,
  Check,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/utils/format";
import type { Product, CartItem } from "@/types";

interface ProductGridProps {
  /** Pre-filtered and paginated products to display */
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  viewMode?: "grid" | "list";
  /** Total filtered count for display (may differ from products.length due to pagination) */
  totalFilteredCount?: number;
  /** Active category name for empty state message */
  selectedCategory?: string | null;
  /** Search query for empty state message */
  search?: string;
  /** Whether data is currently loading */
  isLoading?: boolean;
  /** Category name lookup function */
  getCategoryName?: (categoryId: string) => string;
}

/**
 * ProductGrid - Professional POS product display with grid and list views
 *
 * Optimized for large datasets:
 * - Products are pre-filtered and paginated by parent component
 * - Uses memo for preventing unnecessary re-renders
 * - Minimal internal state
 */
export const ProductGrid = memo(function ProductGrid({
  products,
  cart,
  onAddToCart,
  viewMode = "grid",
  totalFilteredCount,
  selectedCategory,
  search = "",
  isLoading = false,
  getCategoryName = (id) => id,
}: ProductGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to top when products set changes (pagination or filter change)
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [products]);

  // Create a Set for O(1) cart lookups
  const cartProductIds = useMemo(
    () => new Set(cart.map((item) => item.productId)),
    [cart]
  );

  const getCartQuantity = (productId: string): number => {
    const item = cart.find((i) => i.productId === productId);
    return item?.quantity ?? 0;
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return {
        label: "Out of Stock",
        color: "bg-red-500",
        textColor: "text-red-600",
      };
    if (stock <= 5)
      return {
        label: `${stock} Left`,
        color: "bg-amber-500",
        textColor: "text-amber-600",
      };
    return {
      label: `${stock} Stock`,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
    };
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 no-scrollbar">
        <div className="p-4 md:p-6">
          <div
            className={`grid gap-3 sm:gap-4 ${viewMode === "grid"
              ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5"
              : "grid-cols-1"
              }`}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
                <div className="p-3 md:p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 no-scrollbar">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
            <Package className="h-10 w-10 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">
            No products found
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            {selectedCategory
              ? `Try selecting a different category`
              : search
                ? `No results for "${search}"`
                : "Add products to get started"}
          </p>
        </div>
      </div>
    );
  }

  const displayCount = totalFilteredCount ?? products.length;

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 no-scrollbar scroll-smooth"
    >
      <div className="p-4 md:p-6">
        {/* Results count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {displayCount.toLocaleString()}
            </span>{" "}
            products
            {selectedCategory && (
              <span className="text-gray-400 dark:text-gray-500">
                {" "}
                in {selectedCategory}
              </span>
            )}
          </p>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory || 'all'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 col-span-full"
              >
                {products.map((product) => {
                  const inCart = cartProductIds.has(product.id);
                  const cartQuantity = getCartQuantity(product.id);
                  const stockStatus = getStockStatus(product.currentStock);
                  const isOutOfStock = product.currentStock === 0;

                  return (
                    <div
                      key={product.id}
                      className={`group relative flex flex-col rounded-xl bg-white dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all ${isOutOfStock ? "opacity-75" : ""
                        }`}
                    >
                      {/* Stock Badge */}
                      <div className="absolute top-2 left-2 z-10">
                        <div
                          className={`px-2 py-1 rounded-md ${stockStatus.color} text-white text-xs font-semibold flex items-center gap-1`}
                        >
                          {product.currentStock <= 5 &&
                            product.currentStock > 0 && (
                              <AlertTriangle className="w-3 h-3" />
                            )}
                          {stockStatus.label}
                        </div>
                      </div>

                      {/* In Cart Indicator */}
                      {inCart && (
                        <div className="absolute top-2 right-2 z-10">
                          <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center">
                            <span className="text-xs font-bold">
                              {cartQuantity}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Product Image */}
                      <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center dark:bg-gray-700">
                            <Package className="h-12 w-12 text-gray-300 dark:text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex flex-col flex-1 p-3 md:p-4">
                        <div className="flex-1 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 text-sm">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                            {product.description}
                          </p>
                        </div>

                        {/* Price and SKU */}
                        <div className="flex items-end justify-between mb-3">
                          <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(product.unitPrice)}
                          </span>
                          <span className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 font-mono">
                            {product.sku}
                          </span>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          onClick={() => onAddToCart(product)}
                          disabled={isOutOfStock}
                          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${inCart
                            ? "bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98]"
                            : isOutOfStock
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                              : "bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600 active:scale-[0.98]"
                            }`}
                        >
                          {inCart ? (
                            <>
                              <Check className="w-4 h-4" />
                              Add More
                            </>
                          ) : isOutOfStock ? (
                            "Out of Stock"
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Add to Cart
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory || 'all'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-2"
              >
                {products.map((product) => {
                  const inCart = cartProductIds.has(product.id);
                  const cartQuantity = getCartQuantity(product.id);
                  const stockStatus = getStockStatus(product.currentStock);
                  const isOutOfStock = product.currentStock === 0;

                  return (
                    <div
                      key={product.id}
                      className={`group flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all ${isOutOfStock ? "opacity-75" : ""
                        }`}
                    >
                      {/* Product Image */}
                      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-300 dark:text-gray-500" />
                          </div>
                        )}
                        {/* Stock badge */}
                        <div className="absolute bottom-0.5 left-0.5 right-0.5">
                          <div
                            className={`px-1.5 py-0.5 rounded ${stockStatus.color} text-white text-[9px] font-semibold text-center`}
                          >
                            {stockStatus.label}
                          </div>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm md:text-base">
                              {product.name}
                            </h3>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                              {product.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                {product.sku}
                              </span>
                              <span className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500">
                                {getCategoryName(product.categoryId)}
                              </span>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right flex-shrink-0">
                            <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                              {formatCurrency(product.unitPrice)}
                            </span>
                            {inCart && (
                              <div className="flex items-center justify-end gap-1 mt-0.5">
                                <ShoppingCart className="w-3 h-3 text-brand-500" />
                                <span className="text-xs font-medium text-brand-600">
                                  {cartQuantity}×
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => onAddToCart(product)}
                        disabled={isOutOfStock}
                        className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-3 md:px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${inCart
                          ? "bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98]"
                          : isOutOfStock
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                            : "bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600 active:scale-[0.98]"
                          }`}
                      >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">
                          {inCart ? "Add" : isOutOfStock ? "N/A" : "Add"}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
});
