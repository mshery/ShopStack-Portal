import { memo, useMemo, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Package, Plus, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/shared/utils/format";
import type { Product, CartItem } from "@/shared/types/models";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { WeightInputModal } from "./WeightInputModal";

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
 * ProductGrid - professional POS tiles.
 *
 * Design intent: this surface is the cashier's workspace, not a marketing
 * card grid. Tiles are uniform, dense, and serious. No coloured letter
 * avatars or pastel placeholders — those read as a school project, not a
 * point-of-sale.
 *
 * Visual hierarchy per tile:
 *   1. Product name (the thing they're looking for)
 *   2. Price (the second thing)
 *   3. Stock + cart state (peripheral; quick scan only)
 *
 * Selected state is decisive — a solid brand background with white text
 * — rather than a thin border the eye has to hunt for.
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

  type StockTone = "out" | "low" | "ok";
  const getStockTone = (stock: number): StockTone => {
    if (stock === 0) return "out";
    if (stock <= 5) return "low";
    return "ok";
  };

  const stockDotClass = (tone: StockTone) =>
    tone === "out"
      ? "bg-red-500"
      : tone === "low"
        ? "bg-amber-500"
        : "bg-emerald-500";

  // Loading skeleton — matches the actual tile silhouette so the swap
  // doesn't reflow the grid.
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 no-scrollbar">
        <div className="p-4 md:p-6">
          <div className="mb-5">
            <Skeleton className="h-4 w-32" />
          </div>

          <div
            className={`grid gap-2 ${
              viewMode === "grid"
                ? "grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-5"
                : "grid-cols-1"
            }`}
          >
            {Array.from({ length: 12 }).map((_, i) =>
              viewMode === "grid" ? (
                <div
                  key={i}
                  className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
                >
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="mt-2 h-3 w-1/2" />
                  <div className="mt-6 flex items-center justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-5 rounded" />
                  </div>
                </div>
              ) : (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <Skeleton className="h-16 w-16 shrink-0 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-6 w-20 shrink-0" />
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
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950 no-scrollbar">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
            <ShoppingBag className="h-7 w-7 text-gray-400" />
          </div>
          <p className="text-base font-semibold text-gray-900 dark:text-white">
            No products found
          </p>
          <p className="mt-1 max-w-xs text-sm text-gray-500 dark:text-gray-400">
            {selectedCategory
              ? "Try selecting a different category."
              : search
                ? `No results for "${search}".`
                : "Add products to get started."}
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
        className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 no-scrollbar scroll-smooth"
      >
        <div className="p-4 md:p-6">
          {/* Results count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <span className="text-gray-900 dark:text-gray-100">
                {displayCount.toLocaleString()}
              </span>{" "}
              {displayCount === 1 ? "product" : "products"}
              {selectedCategory && (
                <span className="text-gray-400 dark:text-gray-500">
                  {" "}
                  · {selectedCategory}
                </span>
              )}
            </p>
          </div>

          {/* Grid View — professional, dense, text-forward tiles. */}
          {viewMode === "grid" && (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory || "all"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="grid grid-cols-2 xs:grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 2xl:grid-cols-5 pb-20 md:pb-0"
              >
                {products.map((product) => {
                  const inCart = cartProductIds.has(product.id);
                  const cartQuantity = getCartQuantity(product.id);
                  const stockTone = getStockTone(product.currentStock);
                  const isOutOfStock = stockTone === "out";

                  return (
                    <motion.button
                      key={product.id}
                      type="button"
                      layout
                      whileTap={isOutOfStock ? undefined : { scale: 0.985 }}
                      onClick={() => handleProductClick(product)}
                      disabled={isOutOfStock}
                      aria-label={`Add ${product.name} to cart`}
                      aria-pressed={inCart}
                      className={`group relative flex h-full flex-col rounded-lg border text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 ${
                        isOutOfStock
                          ? "cursor-not-allowed border-gray-200 bg-white opacity-50 dark:border-gray-800 dark:bg-gray-900"
                          : inCart
                            ? "border-brand-600 bg-brand-600 text-white shadow-sm dark:border-brand-500 dark:bg-brand-600"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:bg-gray-850"
                      }`}
                    >
                      {/* Cart quantity — top-right, sits inside the tile
                          when selected (solid brand bg) or as a small chip
                          when not. */}
                      {inCart && (
                        <span className="absolute right-2 top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded bg-white/20 px-1 text-[11px] font-bold tabular-nums text-white">
                          ×{cartQuantity}
                        </span>
                      )}

                      <div className="flex flex-1 flex-col p-3">
                        {/* Name — the dominant element */}
                        <h3
                          className={`line-clamp-2 text-sm font-semibold leading-snug ${
                            inCart
                              ? "text-white"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {product.name}
                        </h3>

                        {/* SKU — quiet, monospace, only when not selected */}
                        {product.sku && !inCart && (
                          <p className="mt-0.5 text-[11px] font-mono text-gray-400 dark:text-gray-500">
                            {product.sku}
                          </p>
                        )}

                        {/* Spacer pushes the price row to the bottom */}
                        <div className="flex-1" />

                        {/* Stock — tiny dot + count, top of bottom row */}
                        <div className="mt-3 flex items-center gap-1.5">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              inCart ? "bg-white/70" : stockDotClass(stockTone)
                            }`}
                            aria-hidden
                          />
                          <span
                            className={`text-[11px] font-medium tabular-nums ${
                              inCart
                                ? "text-white/80"
                                : stockTone === "out"
                                  ? "text-red-600 dark:text-red-400"
                                  : stockTone === "low"
                                    ? "text-amber-700 dark:text-amber-400"
                                    : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {isOutOfStock
                              ? "Out of stock"
                              : `${product.currentStock} in stock`}
                          </span>
                        </div>

                        {/* Price + add affordance */}
                        <div className="mt-1.5 flex items-baseline justify-between gap-2">
                          <span
                            className={`text-base font-bold tabular-nums ${
                              inCart
                                ? "text-white"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {formatCurrency(product.unitPrice)}
                            {product.productType === "weighted" && (
                              <span
                                className={`ml-0.5 text-[10px] font-normal ${
                                  inCart
                                    ? "text-white/70"
                                    : "text-gray-400 dark:text-gray-500"
                                }`}
                              >
                                /kg
                              </span>
                            )}
                          </span>
                          {!inCart && !isOutOfStock && (
                            <Plus
                              className="h-4 w-4 text-gray-400 transition-colors group-hover:text-brand-600 dark:text-gray-500 dark:group-hover:text-brand-400"
                              aria-hidden
                            />
                          )}
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
                transition={{ duration: 0.12 }}
                className="space-y-2"
              >
                {products.map((product) => {
                  const inCart = cartProductIds.has(product.id);
                  const cartQuantity = getCartQuantity(product.id);
                  const stockTone = getStockTone(product.currentStock);
                  const isOutOfStock = stockTone === "out";

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleProductClick(product)}
                      disabled={isOutOfStock}
                      aria-label={`Add ${product.name} to cart`}
                      aria-pressed={inCart}
                      className={`group flex w-full items-center gap-4 rounded-lg border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 ${
                        isOutOfStock
                          ? "cursor-not-allowed border-gray-200 bg-white opacity-50 dark:border-gray-800 dark:bg-gray-900"
                          : inCart
                            ? "border-brand-600 bg-brand-600 text-white dark:border-brand-500"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:bg-gray-850"
                      }`}
                    >
                      {/* Image (optional) */}
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md ${
                            inCart
                              ? "bg-white/15"
                              : "bg-gray-100 dark:bg-gray-800"
                          }`}
                        >
                          <Package
                            className={`h-5 w-5 ${
                              inCart
                                ? "text-white/70"
                                : "text-gray-400 dark:text-gray-600"
                            }`}
                            aria-hidden
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`truncate text-sm font-semibold ${
                              inCart
                                ? "text-white"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {product.name}
                          </h3>
                          {inCart && (
                            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded bg-white/20 px-1 text-[11px] font-bold tabular-nums text-white">
                              ×{cartQuantity}
                            </span>
                          )}
                        </div>
                        <div
                          className={`mt-0.5 flex items-center gap-3 text-[11px] ${
                            inCart
                              ? "text-white/70"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {product.sku && (
                            <span className="font-mono">{product.sku}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                inCart
                                  ? "bg-white/70"
                                  : stockDotClass(stockTone)
                              }`}
                              aria-hidden
                            />
                            {isOutOfStock
                              ? "Out of stock"
                              : `${product.currentStock} in stock`}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="shrink-0 text-right">
                        <div
                          className={`text-base font-bold tabular-nums ${
                            inCart
                              ? "text-white"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {formatCurrency(product.unitPrice)}
                        </div>
                        {product.productType === "weighted" && (
                          <div
                            className={`text-[10px] ${
                              inCart
                                ? "text-white/70"
                                : "text-gray-400 dark:text-gray-500"
                            }`}
                          >
                            per kg
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Weight Input Modal */}
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
