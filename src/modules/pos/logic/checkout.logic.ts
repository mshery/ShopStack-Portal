import type {
  Sale,
  Receipt,
  SaleLineItem,
  Discount,
} from "@/shared/types/models";
import { generateId } from "@/shared/utils/normalize";
import { useProductsStore } from "@/modules/products/store/products.store";
import { useAuditStore } from "@/modules/products/store/audit.store";

/**
 * Creates a sale and receipt from sale data
 */
export function createSale(
  saleData: Omit<Sale, "id" | "number" | "createdAt" | "updatedAt">,
  currentDiscount: Discount | null,
): { sale: Sale; receipt: Receipt } {
  const saleId = generateId("sale");
  const saleNumber = `SALE-${Date.now().toString().slice(-6)}`;
  const receiptId = generateId("receipt");
  const receiptNumber = `RCP-${Date.now().toString().slice(-8)}`;

  const sale: Sale = {
    ...saleData,
    id: saleId,
    number: saleNumber,
    discount: currentDiscount,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const receipt: Receipt = {
    id: receiptId,
    saleId,
    receiptNumber,
    tenant_id: saleData.tenant_id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { sale, receipt };
}

/**
 * Reduces inventory for sold items
 */
export function reduceInventory(lineItems: SaleLineItem[]): void {
  const { updateStock } = useProductsStore.getState();
  lineItems.forEach((item) => {
    updateStock(item.productId, -item.quantity);
  });
}

/**
 * Logs sale completion audit event
 */
export function logSaleCompletion(
  sale: Sale,
  cashierUserId: string,
): void {
  useAuditStore.getState().addLog({
    tenant_id: sale.tenant_id,
    action: "sale_completed",
    entityType: "sale",
    entityId: sale.id,
    userId: cashierUserId,
    userName: "Cashier",
    before: null,
    after: { sale },
    metadata: {
      saleNumber: sale.number,
      itemCount: sale.lineItems.length,
      grandTotal: sale.grandTotal,
      paymentMethod: sale.paymentMethod,
      customerId: sale.customerId,
    },
  });
}

/**
 * Logs discount application audit event
 */
export function logDiscountApplication(
  sale: Sale,
  discount: Discount,
  cashierUserId: string,
): void {
  useAuditStore.getState().addLog({
    tenant_id: sale.tenant_id,
    action: "discount_applied",
    entityType: "sale",
    entityId: sale.id,
    userId: cashierUserId,
    userName: "Cashier",
    before: null,
    after: { discount },
    metadata: {
      discountType: discount.type,
      discountValue: discount.value,
      reason: discount.reason,
    },
  });
}
