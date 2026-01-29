/**
 * RBAC Configuration
 *
 * Defines roles, permissions, and role-permission mappings for the application.
 * This is the single source of truth for authorization rules.
 */

// ============================================
// PERMISSION TYPES
// ============================================

/**
 * All available permissions in the system.
 * Format: "resource:action"
 */
export type Permission =
  // Platform permissions
  | "platform:access"

  // Dashboard
  | "dashboard:view"

  // Users
  | "users:view"
  | "users:create"
  | "users:edit"
  | "users:delete"

  // Products
  | "products:view"
  | "products:create"
  | "products:edit"
  | "products:delete"

  // Categories & Brands (part of settings)
  | "settings:view"
  | "settings:edit"

  // Customers
  | "customers:view"
  | "customers:create"
  | "customers:edit"
  | "customers:delete"

  // Vendors
  | "vendors:view"
  | "vendors:create"
  | "vendors:edit"
  | "vendors:delete"

  // Purchases
  | "purchases:view"
  | "purchases:create"
  | "purchases:edit"
  | "purchases:delete"

  // Inventory
  | "inventory:view"
  | "inventory:create"
  | "inventory:edit"

  // Expenses
  | "expenses:view"
  | "expenses:create"
  | "expenses:edit"
  | "expenses:delete"

  // Sales
  | "sales:view"
  | "sales:create"
  | "sales:edit"
  | "sales:delete"

  // POS
  | "pos:access"

  // Reports
  | "reports:view"

  // Billing
  | "billing:view"
  | "billing:manage";

// ============================================
// ROLE TYPES
// ============================================

/**
 * Platform roles (super admins)
 */
export type PlatformRole = "super_admin";

/**
 * Tenant roles (only owner and cashier - admin removed)
 */
export type TenantRole = "owner" | "cashier";

/**
 * All roles combined
 */
export type Role = PlatformRole | TenantRole;

// ============================================
// ROLE-PERMISSION MAPPINGS
// ============================================

/**
 * Permissions granted to each tenant role
 * Note: admin role removed - only owner and cashier exist
 */
export const rolePermissions: Record<TenantRole, Permission[]> = {
  owner: [
    // Full access
    "dashboard:view",
    "users:view",
    "users:create",
    "users:edit",
    "users:delete",
    "products:view",
    "products:create",
    "products:edit",
    "products:delete",
    "settings:view",
    "settings:edit",
    "customers:view",
    "customers:create",
    "customers:edit",
    "customers:delete",
    "vendors:view",
    "vendors:create",
    "vendors:edit",
    "vendors:delete",
    "purchases:view",
    "purchases:create",
    "purchases:edit",
    "purchases:delete",
    "inventory:view",
    "inventory:create",
    "inventory:edit",
    "expenses:view",
    "expenses:create",
    "expenses:edit",
    "expenses:delete",
    "sales:view",
    "sales:create",
    "sales:edit",
    "sales:delete",
    "pos:access",
    "reports:view",
    "billing:view",
    "billing:manage",
  ],

  cashier: [
    // Limited access for POS operations
    "dashboard:view",
    "products:view",
    "customers:view",
    "customers:create",
    "sales:view",
    "sales:create",
    "pos:access",
  ],
};

/**
 * Platform role permissions (super admins have access to everything)
 */
export const platformPermissions: Permission[] = [
  "platform:access",
  // Include all tenant permissions as well for impersonation
  ...rolePermissions.owner,
];

// ============================================
// ROUTE-PERMISSION MAPPING
// ============================================

/**
 * Maps route patterns to required permissions
 */
export const routePermissions: Record<string, Permission> = {
  "/tenant": "dashboard:view",
  "/tenant/users": "users:view",
  "/tenant/products": "products:view",
  "/tenant/categories": "settings:view",
  "/tenant/brands": "settings:view",
  "/tenant/customers": "customers:view",
  "/tenant/vendors": "vendors:view",
  "/tenant/purchases": "purchases:view",
  "/tenant/inventory": "inventory:view",
  "/tenant/expenses": "expenses:view",
  "/tenant/pos/sell": "pos:access",
  "/tenant/pos/sales": "sales:view",
  "/tenant/reports": "reports:view",
  "/tenant/settings": "settings:view",
  "/tenant/billing": "billing:view",
};
