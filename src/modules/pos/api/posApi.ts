/**
 * POS API
 *
 * API client for Sales, Refunds, Receipts, and Held Orders.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpClient } from "@/core/api/httpClient";
import { endpoints } from "@/core/config/endpoints";
import type { ApiResponse, PaginatedResponse } from "@/shared/types/api";

// ============================================
// TYPES
// ============================================

export interface SalesFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  cashierId?: string;
  customerId?: string;
}

export interface Sale {
  id: string;
  number: string;
  subtotal: string;
  tax: string;
  grandTotal: string;
  discount: {
    type: "percentage" | "fixed";
    value: number;
    reason?: string;
  } | null;
  paymentMethod: "cash" | "card" | "split";
  customerId: string | null;
  cashierUserId: string;
  customer: { id: string; name: string } | null;
  cashier: { id: string; name: string };
  items: SaleItem[];
  payment: Payment | null;
  refunds: Refund[];
  createdAt: string;
  updatedAt: string;
  _count?: { items: number; refunds: number };
}

export interface SaleItem {
  id: string;
  productId: string;
  nameSnapshot: string;
  unitPriceSnapshot: string;
  costPriceSnapshot: string;
  quantity: number;
  subtotal: string;
}

export interface Payment {
  id: string;
  method: string;
  amountTendered: string;
  changeGiven: string;
  cardDetails: { brand: string; last4: string; authCode?: string } | null;
}

export interface Refund {
  id: string;
  refundNumber: string;
  refundTotal: string;
  reason: string;
  refundedItems: RefundItem[];
  originalSaleId: string;
  originalSale?: { id: string; number: string; grandTotal: string };
  processor?: { id: string; name: string };
  createdAt: string;
}

export interface RefundItem {
  productId: string;
  productName: string;
  quantity: number;
  refundAmount: number;
}

export interface RefundsFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface Receipt {
  receiptNumber: string;
  createdAt: string;
  business: { name: string; address: string; phone: string };
  sale: { number: string; date: string; cashier: string; customer: string };
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  subtotal: number;
  discount: number | null;
  tax: number;
  grandTotal: number;
  payment: { method: string; amountTendered: number; changeGiven: number };
  refunds: Refund[];
}

export interface HeldOrder {
  id: string;
  cart: CartItem[];
  customerId: string | null;
  discount: {
    type: "percentage" | "fixed";
    value: number;
    reason?: string;
  } | null;
  heldAt: string;
  heldBy: string;
  heldByName: string;
  customerName: string | null;
  itemCount: number;
  cartTotal: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface ResumedHeldOrder {
  id: string;
  cart: Array<
    CartItem & {
      currentPrice: number;
      priceChanged: boolean;
      inStock: boolean;
      availableStock: number;
    }
  >;
  customerId: string | null;
  discount: {
    type: "percentage" | "fixed";
    value: number;
    reason?: string;
  } | null;
  heldAt: string;
}

export interface CreateSaleInput {
  customerId?: string;
  items: Array<{ productId: string; quantity: number }>;
  paymentMethod: "cash" | "card" | "split";
  discount?: { type: "percentage" | "fixed"; value: number; reason?: string };
  amountTendered?: number;
  cardDetails?: { brand: string; last4: string; authCode?: string };
}

export interface CreateRefundInput {
  originalSaleId: string;
  items: RefundItem[];
  reason: string;
}

export interface CreateHeldOrderInput {
  cart: CartItem[];
  customerId?: string;
  discount?: { type: "percentage" | "fixed"; value: number; reason?: string };
}

export interface TodaysSummary {
  salesCount: number;
  totalRevenue: number;
  totalTax: number;
}

// ============================================
// API
// ============================================

// Helpers
const transformSaleItem = (item: any): SaleItem => ({
  ...item,
  quantity: Number(item.quantity),
});

const transformSale = (sale: any): Sale => ({
  ...sale,
  items: sale.items?.map(transformSaleItem) || [],
  // Ensure other numeric fields if needed, but interface says string for totals
});

const transformRefundItem = (item: any): RefundItem => ({
  ...item,
  quantity: Number(item.quantity),
  refundAmount: Number(item.refundAmount),
});

const transformRefund = (refund: any): Refund => ({
  ...refund,
  refundedItems: refund.refundedItems?.map(transformRefundItem) || [],
});

const transformReceipt = (receipt: any): Receipt => ({
  ...receipt,
  subtotal: Number(receipt.subtotal),
  tax: Number(receipt.tax),
  grandTotal: Number(receipt.grandTotal),
  discount: receipt.discount ? Number(receipt.discount) : null,
  items:
    receipt.items?.map((item: any) => ({
      ...item,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
    })) || [],
  payment: {
    ...receipt.payment,
    amountTendered: Number(receipt.payment?.amountTendered || 0),
    changeGiven: Number(receipt.payment?.changeGiven || 0),
  },
});

export const posApi = {
  // Sales
  getSales: async (params?: SalesFilters): Promise<PaginatedResponse<Sale>> => {
    const res = await httpClient.get<ApiResponse<PaginatedResponse<any>>>(
      endpoints.tenant.sales.list,
      { params },
    );
    return {
      ...res.data.data,
      items: res.data.data.items.map(transformSale),
    };
  },

  getSale: async (id: string): Promise<Sale> => {
    const res = await httpClient.get<ApiResponse<any>>(
      endpoints.tenant.sales.byId(id),
    );
    return transformSale(res.data.data);
  },

  createSale: async (data: CreateSaleInput): Promise<Sale> => {
    const res = await httpClient.post<ApiResponse<any>>(
      endpoints.tenant.sales.list,
      data,
    );
    return transformSale(res.data.data);
  },

  getTodaysSummary: async (): Promise<TodaysSummary> => {
    const res = await httpClient.get<ApiResponse<TodaysSummary>>(
      endpoints.tenant.sales.today,
    );
    return res.data.data;
  },

  // Refunds
  getRefunds: async (
    params?: RefundsFilters,
  ): Promise<PaginatedResponse<Refund>> => {
    const res = await httpClient.get<ApiResponse<PaginatedResponse<any>>>(
      endpoints.tenant.refunds.list,
      { params },
    );
    return {
      ...res.data.data,
      items: res.data.data.items.map(transformRefund),
    };
  },

  getRefund: async (id: string): Promise<Refund> => {
    const res = await httpClient.get<ApiResponse<any>>(
      endpoints.tenant.refunds.byId(id),
    );
    return transformRefund(res.data.data);
  },

  processRefund: async (data: CreateRefundInput): Promise<Refund> => {
    const res = await httpClient.post<ApiResponse<any>>(
      endpoints.tenant.refunds.list,
      data,
    );
    return transformRefund(res.data.data);
  },

  // Receipts
  getReceiptBySale: async (saleId: string): Promise<Receipt> => {
    const res = await httpClient.get<ApiResponse<any>>(
      endpoints.tenant.receipts.bySale(saleId),
    );
    return transformReceipt(res.data.data);
  },

  getReceiptByNumber: async (number: string): Promise<Receipt> => {
    const res = await httpClient.get<ApiResponse<any>>(
      endpoints.tenant.receipts.byNumber(number),
    );
    return transformReceipt(res.data.data);
  },

  // Held Orders
  getHeldOrders: async (): Promise<HeldOrder[]> => {
    const res = await httpClient.get<ApiResponse<HeldOrder[]>>(
      endpoints.tenant.heldOrders.list,
    );
    return res.data.data;
  },

  getHeldOrder: async (id: string): Promise<HeldOrder> => {
    const res = await httpClient.get<ApiResponse<HeldOrder>>(
      endpoints.tenant.heldOrders.byId(id),
    );
    return res.data.data;
  },

  createHeldOrder: async (data: CreateHeldOrderInput): Promise<HeldOrder> => {
    const res = await httpClient.post<ApiResponse<HeldOrder>>(
      endpoints.tenant.heldOrders.list,
      data,
    );
    return res.data.data;
  },

  resumeHeldOrder: async (id: string): Promise<ResumedHeldOrder> => {
    const res = await httpClient.get<ApiResponse<ResumedHeldOrder>>(
      endpoints.tenant.heldOrders.resume(id),
    );
    return res.data.data;
  },

  deleteHeldOrder: async (id: string): Promise<void> => {
    await httpClient.delete(endpoints.tenant.heldOrders.byId(id));
  },
};

export default posApi;
