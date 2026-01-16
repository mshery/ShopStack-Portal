import { motion } from "motion/react";
import { X, Minus, Plus, Package } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import type { CartItem } from "@/types";

interface CartItemsProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  currencySymbol: string;
}

/**
 * CartItems - With rounded corners
 */
export function CartItems({
  items,
  onUpdateQuantity,
  onRemoveItem,
}: CartItemsProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => {
        return (
          <motion.div
            key={item.productId}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="group relative bg-white rounded-xl p-3 border border-gray-100"
          >
            <div className="flex gap-3">
              {/* Product Image - Rounded */}
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 overflow-hidden">
                {item.product.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-6 w-6 text-gray-400" />
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                    {item.product.name}
                  </h4>
                  <button
                    onClick={() => onRemoveItem(item.productId)}
                    className="flex-shrink-0 p-1.5 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>

                <p className="text-xs text-gray-500 mb-2">Size 42 • Green</p>

                {/* Quantity Controls - Rounded */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onUpdateQuantity(item.productId, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5 text-gray-600" />
                    </motion.button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onUpdateQuantity(item.productId, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5 text-white" />
                    </motion.button>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Total</div>
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(item.product.unitPrice * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
