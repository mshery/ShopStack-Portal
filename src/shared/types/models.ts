/**
 * Type definitions for the SaaS Admin Dashboard
 * All types are normalized - no optional fields that should be required
 */

// ============================================
// Meta & Common Types
// ============================================

export type AsyncStatus = "loading" | "error" | "empty" | "success";

export interface Meta {
  version: string;
  seededAt: string;
}

// ============================================
// Platform Types (Super Admin)
// ============================================

export interface PlatformUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "super_admin";
  status: UserStatus;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformActivityLog {
  id: string;
  action: string;
  actorId: string;
  targetType: string;
  targetId: string;
  details: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  primaryColor: string;
  accentColor: string;
}

// ============================================
// Tenant Types
// ============================================

export type TenantPlan = "starter" | "enterprise";
export type TenantStatus = "active" | "inactive" | "suspended";

export interface TenantFeatures {
  posEnabled: boolean;
  reportsEnabled: boolean;
  apiAccessEnabled: boolean;
}

export interface TenantSettings {
  taxRate: number;
  currency: string;
  currencySymbol: string;
  timezone: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  billingAddress?: BillingAddress;
}

export interface Tenant {
  id: string;
  slug: string;
  companyName: string;
  plan: TenantPlan;
  status: TenantStatus;
  maxUsers: number;
  maxProducts: number;
  maxOrders: number;
  features: TenantFeatures;
  settings: TenantSettings;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Tenant Billing Types
// ============================================

export type BillingStatus = "active" | "past_due" | "cancelled" | "trial";
export type BillingCycle = "monthly" | "yearly";
export type InvoiceStatus = "paid" | "pending" | "failed" | "unpaid";
export type BillingPaymentMethodType = "card" | "paypal";
export type CardBrand = "visa" | "mastercard" | "amex" | "discover";

// Plan Feature
export interface PlanFeature {
  name: string;
  included: boolean;
}

// Plan Limits
export interface PlanLimits {
  maxUsers: number;
  maxProducts: number;
  maxOrders: number;
}

// Subscription Plan
export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: TenantPlan;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PlanFeature[];
  limits: PlanLimits;
  isPopular: boolean;
}

// Billing Payment Method
export interface BillingPaymentMethod {
  id: string;
  tenant_id: string;
  type: BillingPaymentMethodType;
  brand?: CardBrand;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  email?: string;
  isDefault: boolean;
  createdAt: string;
}

// Billing Address
export interface BillingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  vatNumber: string | null;
}

export interface TenantBilling {
  id: string;
  tenant_id: string;
  plan: TenantPlan;
  status: BillingStatus;
  monthlyAmount: number;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  lastPaymentDate: string | null;
  lastPaymentAmount: number | null;
  trialEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BillingInvoice {
  id: string;
  tenant_id: string;
  invoiceNumber: string;
  planName: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
}

// ============================================
// Tenant User Types
// ============================================

export type UserRole = "owner" | "cashier";
export type UserStatus = "active" | "inactive";

export interface TenantUser {
  id: string;
  tenant_id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  phone: string | null;
  avatarUrl: string | null;
  createdBy: "platform" | "tenant";
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Product Types
// ============================================

export type ProductStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  sku: string;
  categoryId: string;
  brandId: string;
  unitPrice: number;
  costPrice: number; // For profit calculation
  vendorId: string | null; // Link to vendor
  currentStock: number;
  minimumStock: number;
  status: ProductStatus;
  imageUrl: string | null;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Product Category & Brand Types
// ============================================

export interface ProductCategory {
  id: string;
  tenant_id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductBrand {
  id: string;
  tenant_id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Customer Types
// ============================================

export interface Customer {
  id: string;
  tenant_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// POS Types
// ============================================


export interface SaleLineItem {
  productId: string;
  nameSnapshot: string;
  unitPriceSnapshot: number;
  costPriceSnapshot: number;
  quantity: number;
  subtotal: number;
}

export type DiscountType = "percentage" | "fixed";

export interface Discount {
  type: DiscountType;
  value: number;
  reason: string;
}

export interface Sale {
  id: string;
  number: string;
  tenant_id: string;
  cashierUserId: string;
  customerId: string;
  lineItems: SaleLineItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  discount: Discount | null;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = "CASH" | "CARD" | "MOBILE" | "SPLIT";

export interface CardDetails {
  brand: "visa" | "mastercard" | "amex" | "discover";
  last4: string;
  authCode?: string;
}

export interface SplitPaymentItem {
  method: "CASH" | "CARD" | "MOBILE";
  amount: number;
  cardDetails?: CardDetails;
}

export interface Payment {
  id: string;
  tenant_id: string;
  saleId: string;
  method: PaymentMethod;
  amountTendered: number;
  changeGiven: number;
  cardDetails?: CardDetails;
  splitPayments?: SplitPaymentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface POSData {
  sales: Sale[];
  payments: Payment[];
  receipts: Receipt[];
  refunds: Refund[];
  heldOrders?: HeldOrder[];
}

// ============================================
// Receipt Types
// ============================================

export interface Receipt {
  id: string;
  saleId: string;
  receiptNumber: string;
  tenant_id: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Refund Types
// ============================================

export interface RefundLineItem {
  productId: string;
  productName: string;
  quantity: number;
  refundAmount: number;
}

export interface Refund {
  id: string;
  tenant_id: string;
  originalSaleId: string;
  refundNumber: string;
  refundedItems: RefundLineItem[];
  refundTotal: number;
  reason: string;
  processedBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Vendor Types
// ============================================

export interface Vendor {
  id: string;
  tenant_id: string;
  name: string;
  contactPerson: string;
  email: string | null;
  phone: string | null;
  address: string;
  paymentTerms: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Purchase Types
// ============================================

export type PurchaseStatus = "pending" | "received" | "cancelled";

export interface PurchaseLineItem {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  tenant_id: string;
  vendorId: string;
  purchaseNumber: string;
  items: PurchaseLineItem[];
  totalCost: number;
  status: PurchaseStatus;
  purchaseDate: string;
  receivedDate: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Expense Types
// ============================================

export type ExpenseCategory =
  | "rent"
  | "utilities"
  | "salaries"
  | "supplies"
  | "marketing"
  | "maintenance"
  | "insurance"
  | "taxes"
  | "inventory"
  | "vendor_payment"
  | "other";

export type ExpenseType =
  | "operational"
  | "purchase_order"
  | "inventory_loss"
  | "vendor_payment";

export interface Expense {
  id: string;
  tenant_id: string;
  category: ExpenseCategory;
  expenseType: ExpenseType;
  amount: number;
  description: string;
  vendor: string | null;
  relatedVendorId: string | null;
  relatedProductId: string | null;
  relatedPurchaseId: string | null;
  receiptUrl: string | null;
  date: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Inventory Adjustment Types
// ============================================

export type InventoryAdjustmentReason =
  | "damaged"
  | "theft"
  | "count_correction"
  | "expired"
  | "return"
  | "restock"
  | "other";

export interface InventoryAdjustment {
  id: string;
  tenant_id: string;
  productId: string;
  productName: string;
  reason: InventoryAdjustmentReason;
  quantityChange: number; // Positive for increase, negative for decrease
  previousStock: number;
  newStock: number;
  costImpact: number; // Financial impact (positive for loss, negative for gain)
  relatedExpenseId: string | null; // Link to expense record if applicable
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Tenant Activity Log Types
// ============================================

export interface TenantActivityLog {
  id: string;
  tenant_id: string;
  action: string;
  actorId: string;
  targetType: string;
  targetId: string;
  details: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Seed Data Structure
// ============================================

export interface SeedData {
  meta: Meta;
  platformUsers: PlatformUser[];
  platformActivityLogs: PlatformActivityLog[];
  tenants: Tenant[];
  tenantBillings: TenantBilling[];
  billingInvoices: BillingInvoice[];
  subscriptionPlans: SubscriptionPlan[];
  paymentMethods: BillingPaymentMethod[];
  platformSettings: PlatformSettings;
  users: TenantUser[];
  products: Product[];
  categories: ProductCategory[];
  brands: ProductBrand[];
  customers: Customer[];
  vendors: Vendor[];
  purchases: Purchase[];
  expenses: Expense[];
  inventoryAdjustments: InventoryAdjustment[];
  pos: POSData;
  tenantActivityLogs: TenantActivityLog[];
}

// ============================================
// Auth Types
// ============================================

export type AuthUserType = "platform" | "tenant" | null;

export interface AuthState {
  currentUser: PlatformUser | TenantUser | null;
  userType: AuthUserType;
  activeTenantId: string | null;
  isAuthenticated: boolean;
}

// ============================================
// Cart Types (POS)
// ============================================

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
}
export interface HeldOrder {
  id: string;
  cart: CartItem[];
  customerId: string | null;
  discount: Discount | null;
  heldAt: string;
  heldBy: string;
}

// ============================================
// Audit Trail Types
// ============================================

export type AuditAction =
  | "inventory_update"
  | "product_created"
  | "product_updated"
  | "product_deleted"
  | "sale_completed"
  | "sale_refunded"
  | "discount_applied"
  | "order_held"
  | "order_recalled";

export interface AuditLog {
  id: string;
  tenant_id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}
