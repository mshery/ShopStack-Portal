import type { HeldOrder, CartItem, Discount } from "@/shared/types/models";
import { generateId } from "@/shared/utils/normalize";
import { useAuditStore } from "@/modules/products/store/audit.store";

/**
 * Creates a held order from cart
 */
export function createHeldOrder(
  cart: CartItem[],
  customerId: string | null,
  discount: Discount | null,
  userId: string,
): HeldOrder {
  const orderId = generateId("held-order");

  return {
    id: orderId,
    cart: [...cart],
    customerId,
    discount,
    heldAt: new Date().toISOString(),
    heldBy: userId,
  };
}

/**
 * Logs order hold audit event
 */
export function logOrderHold(
  order: HeldOrder,
  userId: string,
  tenantId: string,
): void {
  useAuditStore.getState().addLog({
    tenant_id: tenantId,
    action: "order_held",
    entityType: "held_order",
    entityId: order.id,
    userId,
    userName: "User",
    before: null,
    after: { order },
    metadata: {
      itemCount: order.cart.length,
      customerId: order.customerId || "walk-in",
      hasDiscount: !!order.discount,
    },
  });
}

/**
 * Logs order recall audit event
 */
export function logOrderRecall(
  order: HeldOrder,
  tenantId: string,
): void {
  useAuditStore.getState().addLog({
    tenant_id: tenantId,
    action: "order_recalled",
    entityType: "held_order",
    entityId: order.id,
    userId: "system",
    userName: "System",
    before: { order },
    after: null,
    metadata: {
      itemCount: order.cart.length,
      heldBy: order.heldBy,
    },
  });
}
