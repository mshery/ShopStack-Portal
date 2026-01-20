import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, ArrowRight } from "lucide-react";

interface FloatingCartButtonProps {
  cartCount: number;
  onClick: () => void;
}

/**
 * FloatingCartButton - Premium fixed position button to open cart modal
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
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClick}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-2xl shadow-2xl shadow-brand-500/30 transition-all duration-300"
        >
          {/* Animated background pulse */}
          <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Cart Icon with Badge */}
          <div className="relative">
            <ShoppingCart className="h-6 w-6" />
            <motion.div
              key={cartCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2.5 -right-2.5 h-6 w-6 bg-white text-brand-600 rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
            >
              {cartCount > 99 ? "99+" : cartCount}
            </motion.div>
          </div>

          {/* Text */}
          <div className="flex flex-col items-start">
            <span className="font-bold text-base">View Cart</span>
            <span className="text-xs text-white/80">
              {cartCount} {cartCount === 1 ? "item" : "items"}
            </span>
          </div>

          {/* Arrow */}
          <ArrowRight className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
