import type { Refund, RefundLineItem } from "@/shared/types/models";
import { generateId } from "@/shared/utils/normalize";
import { useProductsStore } from "@/modules/products/store/products.store";

/**
 * Creates a refund record
 */
export function createRefund(
  originalSaleId: string,
  items: RefundLineItem[],
  reason: string,
  processedBy: string,
  tenantId: string,
): Refund {
  const refundId = generateId("refund");
  const refundNumber = `REF-${Date.now().toString().slice(-6)}`;
  const refundTotal = items.reduce((sum, item) => sum + item.refundAmount, 0);

  return {
    id: refundId,
    tenant_id: tenantId,
    originalSaleId,
    refundNumber,
    refundedItems: items,
    refundTotal,
    reason,
    processedBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Restores inventory for refunded items
 */
export function restoreInventory(items: RefundLineItem[]): void {
  const { updateStock } = useProductsStore.getState();
  items.forEach((item) => {
    updateStock(item.productId, item.quantity);
  });
}
