import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Clock, User as UserIcon, Trash2 } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import type { HeldOrder } from "@/types";

interface HoldOrdersPanelProps {
  heldOrders: HeldOrder[];
  onRecallOrder: (orderId: string) => void;
  onDeleteHeldOrder: (orderId: string) => void;
  onClose: () => void;
}

/**
 * HoldOrdersPanel - Panel for viewing and recalling held orders
 *
 * Displays list of held orders with recall and delete actions
 */
export function HoldOrdersPanel({
  heldOrders,
  onRecallOrder,
  onDeleteHeldOrder,
  onClose,
}: HoldOrdersPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4 bg-gradient-to-r from-white to-brand-50/50 dark:from-gray-900 dark:to-brand-900/20">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Held Orders
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {heldOrders.length} {heldOrders.length === 1 ? "order" : "orders"}{" "}
              on hold
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-10 w-10 p-0 rounded-xl"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
          {heldOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                <Clock className="h-10 w-10 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                No held orders
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Orders you hold will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {heldOrders.map((order) => {
                const total = order.cart.reduce(
                  (sum, item) => sum + item.subtotal,
                  0,
                );
                const itemCount = order.cart.reduce(
                  (sum, item) => sum + item.quantity,
                  0,
                );

                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="group relative rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className="gap-1 px-2 py-0.5 text-xs border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-400"
                          >
                            <Clock className="h-3 w-3" />
                            {new Date(order.heldAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Badge>
                          {order.customerId && (
                            <Badge
                              variant="outline"
                              className="gap-1 px-2 py-0.5 text-xs"
                            >
                              <UserIcon className="h-3 w-3" />
                              Customer
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {itemCount} {itemCount === 1 ? "item" : "items"}
                          </p>
                          <p className="text-lg font-bold bg-gradient-to-r from-brand-600 to-brand-500 dark:from-brand-400 dark:to-brand-300 bg-clip-text text-transparent">
                            {formatCurrency(total)}
                          </p>
                          {order.discount && (
                            <p className="text-xs text-green-600 dark:text-green-400">
                              Discount:{" "}
                              {order.discount.type === "percentage"
                                ? `${order.discount.value}%`
                                : formatCurrency(order.discount.value)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => onRecallOrder(order.id)}
                          className="h-9 bg-gradient-to-r from-brand-500 to-brand-600 hover:shadow-lg hover:shadow-brand-500/30"
                        >
                          Recall
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteHeldOrder(order.id)}
                          className="h-9 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
