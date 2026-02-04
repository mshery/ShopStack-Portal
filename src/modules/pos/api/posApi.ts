/**
 * POS API
 *
 * API client for Sales, Refunds, Receipts, and Held Orders.
 */

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

export const posApi = {
  // Sales
  getSales: async (params?: SalesFilters): Promise<PaginatedResponse<Sale>> => {
    const res = await httpClient.get<ApiResponse<PaginatedResponse<Sale>>>(
      endpoints.tenant.sales.list,
      { params },
    );
    return res.data.data;
  },

  getSale: async (id: string): Promise<Sale> => {
    const res = await httpClient.get<ApiResponse<Sale>>(
      endpoints.tenant.sales.byId(id),
    );
    return res.data.data;
  },

  createSale: async (data: CreateSaleInput): Promise<Sale> => {
    const res = await httpClient.post<ApiResponse<Sale>>(
      endpoints.tenant.sales.list,
      data,
    );
    return res.data.data;
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
    const res = await httpClient.get<ApiResponse<PaginatedResponse<Refund>>>(
      endpoints.tenant.refunds.list,
      { params },
    );
    return res.data.data;
  },

  getRefund: async (id: string): Promise<Refund> => {
    const res = await httpClient.get<ApiResponse<Refund>>(
      endpoints.tenant.refunds.byId(id),
    );
    return res.data.data;
  },

  processRefund: async (data: CreateRefundInput): Promise<Refund> => {
    const res = await httpClient.post<ApiResponse<Refund>>(
      endpoints.tenant.refunds.list,
      data,
    );
    return res.data.data;
  },

  // Receipts
  getReceiptBySale: async (saleId: string): Promise<Receipt> => {
    const res = await httpClient.get<ApiResponse<Receipt>>(
      endpoints.tenant.receipts.bySale(saleId),
    );
    return res.data.data;
  },

  getReceiptByNumber: async (number: string): Promise<Receipt> => {
    const res = await httpClient.get<ApiResponse<Receipt>>(
      endpoints.tenant.receipts.byNumber(number),
    );
    return res.data.data;
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
