import { memo, useMemo, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Package, Plus, Check, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/shared/utils/format";
import type { Product, CartItem } from "@/shared/types/models";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { WeightInputModal } from "./WeightInputModal";

/**
 * Pastel tile tones for products that don't have an image yet. The
 * choice is deterministic on the product id, so the same product
 * always shows the same colour between renders / sessions and the
 * grid feels stable rather than flickery.
 */
const TILE_TONES = [
  {
    bg: "bg-brand-50 dark:bg-brand-900/40",
    text: "text-brand-600 dark:text-brand-300",
  },
  {
    bg: "bg-amber-50 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
  },
  {
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  {
    bg: "bg-sky-50 dark:bg-sky-900/30",
    text: "text-sky-700 dark:text-sky-300",
  },
  {
    bg: "bg-violet-50 dark:bg-violet-900/30",
    text: "text-violet-700 dark:text-violet-300",
  },
  {
    bg: "bg-rose-50 dark:bg-rose-900/30",
    text: "text-rose-700 dark:text-rose-300",
  },
] as const;

function productTileTone(productId: string) {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = (hash * 31 + productId.charCodeAt(i)) | 0;
  }
  return TILE_TONES[Math.abs(hash) % TILE_TONES.length] ?? TILE_TONES[0];
}

interface ProductGridProps {
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product, quantity?: number) => void;
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

  const [selectedWeightedProduct, setSelectedWeightedProduct] =
    useState<Product | null>(null);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  const handleProductClick = (product: Product) => {
    if (product.productType === "weighted") {
      setSelectedWeightedProduct(product);
      setIsWeightModalOpen(true);
    } else {
      onAddToCart(product);
    }
  };

  const handleWeightConfirm = (product: Product, weight: number) => {
    onAddToCart(product, weight);
  };

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
            className={`grid gap-2.5 ${
              viewMode === "grid"
                ? "grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-5"
                : "grid-cols-1"
            }`}
          >
            {Array.from({ length: 12 }).map((_, i) =>
              viewMode === "grid" ? (
                // Grid view skeleton — matches the new tile shape.
                <div
                  key={i}
                  className="rounded-xl overflow-hidden border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                >
                  <Skeleton className="h-28 w-full rounded-none" />
                  <div className="space-y-2 px-3 py-2.5">
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-6 w-6 rounded-full" />
                    </div>
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
    <>
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

          {/* Grid View — POS tiles. Entire tile is the click target;
              the cashier should never have to aim at a small button.
              Cards stay compact whether or not the product has an
              image so the grid never feels sparse. */}
          {viewMode === "grid" && (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory || "all"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-2 xs:grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-5 pb-20 md:pb-0"
              >
                {products.map((product) => {
                  const inCart = cartProductIds.has(product.id);
                  const cartQuantity = getCartQuantity(product.id);
                  const stockStatus = getStockStatus(product.currentStock);
                  const isOutOfStock = product.currentStock === 0;
                  const tileTone = productTileTone(product.id);

                  return (
                    <motion.button
                      key={product.id}
                      type="button"
                      layout
                      whileTap={isOutOfStock ? undefined : { scale: 0.97 }}
                      onClick={() => handleProductClick(product)}
                      disabled={isOutOfStock}
                      aria-label={`Add ${product.name} to cart`}
                      className={`group relative flex flex-col text-left rounded-xl overflow-hidden border bg-white dark:bg-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-2 dark:focus:ring-offset-gray-950 ${
                        isOutOfStock
                          ? "cursor-not-allowed opacity-50 border-gray-100 dark:border-gray-800"
                          : inCart
                            ? "border-brand-500 dark:border-brand-400 shadow-md shadow-brand-500/15"
                            : "border-gray-200 dark:border-gray-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
                      }`}
                    >
                      {/* Stock chip — top-left, compact */}
                      <span
                        className={`absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-sm ${stockStatus.bg} ${stockStatus.text}`}
                      >
                        <span
                          className={`h-1 w-1 rounded-full ${stockStatus.dot}`}
                        />
                        {stockStatus.label}
                      </span>

                      {/* Cart-quantity badge — top-right */}
                      {inCart && (
                        <div className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white ring-2 ring-white shadow-sm dark:ring-gray-900">
                          {cartQuantity}
                        </div>
                      )}

                      {/* Visual top — image if present, otherwise a
                          coloured pastel band with a single letter so
                          the grid stays vibrant even with no photos. */}
                      <div className="relative h-28 w-full overflow-hidden">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-full w-full items-center justify-center ${tileTone.bg}`}
                          >
                            <span
                              className={`text-3xl font-bold ${tileTone.text}`}
                            >
                              {product.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Body — name + price. Compact. */}
                      <div className="flex flex-1 flex-col justify-between gap-1.5 px-3 py-2.5">
                        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 dark:text-white">
                          {product.name}
                        </h3>
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-base font-bold tabular-nums text-brand-600 dark:text-brand-400">
                            {formatCurrency(product.unitPrice)}
                            {product.productType === "weighted" && (
                              <span className="ml-0.5 text-[11px] font-normal text-gray-500 dark:text-gray-400">
                                /kg
                              </span>
                            )}
                          </span>
                          {inCart ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                              <Check className="h-3 w-3" />
                              Added
                            </span>
                          ) : !isOutOfStock ? (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-600 group-hover:bg-brand-600 group-hover:text-white transition-colors dark:bg-gray-800 dark:text-gray-300">
                              <Plus className="h-3.5 w-3.5" />
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </motion.button>
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
                      className={`group flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-white dark:bg-gray-800 hover:shadow-lg hover:shadow-gray-200/50 dark:shadow-gray-950/50 dark:hover:shadow-gray-950/80 border border-gray-100 dark:border-gray-700 transition-all ${
                        isOutOfStock ? "opacity-60" : ""
                      }`}
                    >
                      {/* Product Image */}
                      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 flex-shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-6 w-6 md:h-8 md:w-8 text-gray-200 dark:text-gray-700" />
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
                            {product.productType === "weighted" && (
                              <div className="text-xs text-gray-500">
                                per kg
                              </div>
                            )}
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
                        onClick={() => handleProductClick(product)}
                        disabled={isOutOfStock}
                        className={`flex-shrink-0 flex items-center justify-center gap-2 px-3 py-2 md:px-5 md:py-3 rounded-xl text-sm font-semibold transition-all ${
                          inCart
                            ? "bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98]"
                            : isOutOfStock
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                              : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 active:scale-[0.98]"
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        <span className="hidden md:inline">
                          {inCart ? "Add" : isOutOfStock ? "N/A" : "Add"}
                        </span>
                        <span className="md:hidden">Add</span>
                      </button>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Weight Input Modal - Conditionally rendered to reset state on open */}
      {isWeightModalOpen && selectedWeightedProduct && (
        <WeightInputModal
          isOpen={true}
          onClose={() => setIsWeightModalOpen(false)}
          product={selectedWeightedProduct}
          onConfirm={handleWeightConfirm}
        />
      )}
    </>
  );
});
