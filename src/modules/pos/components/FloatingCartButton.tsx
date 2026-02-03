import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, ArrowRight } from "lucide-react";

interface FloatingCartButtonProps {
  cartCount: number;
  onClick: () => void;
}

/**
 * FloatingCartButton - Premium floating action button for cart
 */
export function FloatingCartButton({
  cartCount,
  onClick,
}: FloatingCartButtonProps) {
  return (
    <AnimatePresence>
      {cartCount > 0 && (
        <motion.button
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 20 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClick}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-3 px-5 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl shadow-xl shadow-gray-900/20 dark:shadow-black/20 transition-all duration-200 hover:bg-gray-800 dark:hover:bg-gray-100"
        >
          {/* Cart Icon with Badge */}
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            <motion.div
              key={cartCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 h-5 w-5 bg-brand-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold"
            >
              {cartCount > 99 ? "99+" : cartCount}
            </motion.div>
          </div>

          {/* Text */}
          <div className="flex flex-col items-start">
            <span className="font-semibold text-sm">View Cart</span>
            <span className="text-[10px] opacity-70">
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </span>
          </div>

          {/* Arrow */}
          <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
