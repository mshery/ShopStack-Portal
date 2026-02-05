import { memo, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Package, Plus, Check, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/shared/utils/format";
import type { Product, CartItem } from "@/shared/types/models";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface ProductGridProps {
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  viewMode?: "grid" | "list";
  totalFilteredCount?: number;
  selectedCategory?: string | null;
  search?: string;
  isLoading?: boolean;
  getCategoryName?: (categoryId: string) => string;
}

/**
 * ProductGrid - Premium product cards with modern design
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
}: ProductGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [products]);

  const cartProductIds = useMemo(
    () => new Set(cart.map((item) => item.productId)),
    [cart],
  );

  const getCartQuantity = (productId: string): number => {
    const item = cart.find((i) => i.productId === productId);
    return item?.quantity ?? 0;
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return {
        label: "Out of Stock",
        bg: "bg-red-50 dark:bg-red-900/20",
        text: "text-red-600 dark:text-red-400",
        dot: "bg-red-500",
      };
    if (stock <= 5)
      return {
        label: `Only ${stock} left`,
        bg: "bg-amber-50 dark:bg-amber-900/20",
        text: "text-amber-600 dark:text-amber-400",
        dot: "bg-amber-500",
      };
    return {
      label: `${stock} in stock`,
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500",
    };
  };

  // Loading skeleton - Premium shimmer effect
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 no-scrollbar">
        <div className="p-4 md:p-6">
          {/* Results count skeleton */}
          <div className="mb-5">
            <Skeleton className="h-4 w-32" />
          </div>

          <div
            className={`grid gap-4 md:gap-5 ${
              viewMode === "grid"
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                : "grid-cols-1"
            }`}
          >
            {Array.from({ length: 12 }).map((_, i) =>
              viewMode === "grid" ? (
                // Grid view skeleton - matches product card exactly
                <div
                  key={i}
                  className="rounded-2xl bg-white dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-700"
                >
                  {/* Image placeholder */}
                  <Skeleton className="aspect-square w-full rounded-none" />

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Stock badge */}
                    <Skeleton className="h-6 w-20 rounded-full" />

                    {/* Title */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>

                    {/* SKU */}
                    <Skeleton className="h-3 w-16" />

                    {/* Price */}
                    <Skeleton className="h-6 w-24" />

                    {/* Add to cart button */}
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </div>
                </div>
              ) : (
                // List view skeleton
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                >
                  {/* Image */}
                  <Skeleton className="w-20 h-20 rounded-xl shrink-0" />

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </div>

                  {/* Price */}
                  <Skeleton className="h-6 w-20 shrink-0" />

                  {/* Button */}
                  <Skeleton className="h-12 w-24 rounded-xl shrink-0" />
                </div>
              ),
            )}
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
          <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
            <ShoppingBag className="h-10 w-10 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-gray-700 dark:text-gray-200 font-semibold text-lg">
            No products found
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1.5 max-w-xs">
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
        <div className="mb-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-gray-800 dark:text-gray-100">
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
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory || "all"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-2 gap-4 md:gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
              {products.map((product) => {
                const inCart = cartProductIds.has(product.id);
                const cartQuantity = getCartQuantity(product.id);
                const stockStatus = getStockStatus(product.currentStock);
                const isOutOfStock = product.currentStock === 0;

                return (
                  <motion.div
                    key={product.id}
                    layout
                    className={`group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-xl hover:shadow-gray-200/60 dark:shadow-gray-950/50 dark:hover:shadow-gray-950/80 border border-gray-100 dark:border-gray-700 ${
                      isOutOfStock ? "opacity-60" : ""
                    }`}
                  >
                    {/* Cart Badge */}
                    {inCart && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/40 ring-2 ring-white dark:ring-gray-800">
                          <span className="text-xs font-bold">
                            {cartQuantity}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Product Image */}
                    <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-16 w-16 text-gray-200 dark:text-gray-700" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col flex-1 p-4">
                      {/* Stock Badge */}
                      <div className="mb-2.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${stockStatus.bg} ${stockStatus.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${stockStatus.dot}`}
                          />
                          {stockStatus.label}
                        </span>
                      </div>

                      <div className="flex-1 mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-sm leading-snug">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">
                          {product.sku}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(product.unitPrice)}
                        </span>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => onAddToCart(product)}
                        disabled={isOutOfStock}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                          inCart
                            ? "bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98] shadow-lg shadow-brand-500/25"
                            : isOutOfStock
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                              : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 active:scale-[0.98]"
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
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory || "all"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {products.map((product) => {
                const inCart = cartProductIds.has(product.id);
                const cartQuantity = getCartQuantity(product.id);
                const stockStatus = getStockStatus(product.currentStock);
                const isOutOfStock = product.currentStock === 0;

                return (
                  <div
                    key={product.id}
                    className={`group flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 hover:shadow-lg hover:shadow-gray-200/50 dark:shadow-gray-950/50 dark:hover:shadow-gray-950/80 border border-gray-100 dark:border-gray-700 transition-all ${
                      isOutOfStock ? "opacity-60" : ""
                    }`}
                  >
                    {/* Product Image */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 flex-shrink-0">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-200 dark:text-gray-700" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400 font-mono">
                              {product.sku}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${stockStatus.bg} ${stockStatus.text}`}
                            >
                              <span
                                className={`w-1 h-1 rounded-full ${stockStatus.dot}`}
                              />
                              {stockStatus.label}
                            </span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right flex-shrink-0">
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(product.unitPrice)}
                          </span>
                          {inCart && (
                            <div className="text-xs font-medium text-brand-600 dark:text-brand-400 mt-0.5">
                              {cartQuantity}× in cart
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => onAddToCart(product)}
                      disabled={isOutOfStock}
                      className={`flex-shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                        inCart
                          ? "bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98]"
                          : isOutOfStock
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                            : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 active:scale-[0.98]"
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {inCart ? "Add" : isOutOfStock ? "N/A" : "Add"}
                      </span>
                    </button>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
});
