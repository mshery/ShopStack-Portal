/**
 * RBAC Configuration
 * Role-Based Access Control for tenant users
 */

import type { UserRole } from "@/shared/types/models";

// Permission types for granular access control
export type Permission =
    | "dashboard:view"
    | "products:view"
    | "products:create"
    | "products:edit"
    | "products:delete"
    | "customers:view"
    | "customers:create"
    | "customers:edit"
    | "vendors:view"
    | "vendors:create"
    | "vendors:edit"
    | "purchases:view"
    | "purchases:create"
    | "purchases:edit"
    | "pos:access"
    | "pos:complete_sale"
    | "pos:refund"
    | "sales:view"
    | "sales:view_all"
    | "sales:view_own"
    | "reports:view"
    | "users:view"
    | "users:create"
    | "users:edit"
    | "settings:view"
    | "settings:edit"
    | "expenses:view"
    | "expenses:create"
    | "expenses:edit"
    | "inventory:view"
    | "inventory:adjust"
    | "billing:view";

// Tenant role type alias for use in permission functions
export type TenantRole = UserRole;

// Role permission mappings
export const rolePermissions: Record<TenantRole, Permission[]> = {
    owner: [
        // Full access to everything
        "dashboard:view",
        "products:view",
        "products:create",
        "products:edit",
        "products:delete",
        "customers:view",
        "customers:create",
        "customers:edit",
        "vendors:view",
        "vendors:create",
        "vendors:edit",
        "purchases:view",
        "purchases:create",
        "purchases:edit",
        "pos:access",
        "pos:complete_sale",
        "pos:refund",
        "sales:view",
        "sales:view_all",
        "reports:view",
        "users:view",
        "users:create",
        "users:edit",
        "settings:view",
        "settings:edit",
        "expenses:view",
        "expenses:create",
        "expenses:edit",
        "inventory:view",
        "inventory:adjust",
        "billing:view",
    ],
    cashier: [
        // POS access - can use register, cart, complete sales, view own sales
        "pos:access",
        "pos:complete_sale",
        "pos:refund",
        "sales:view",
        "sales:view_own", // Can only view their own shift sales
    ],
};

// Legacy export for backward compatibility
export const ROLE_PERMISSIONS = rolePermissions;

// Route to permission mapping
export const ROUTE_PERMISSIONS: Record<string, Permission> = {
    "/tenant": "dashboard:view",
    "/tenant/products": "products:view",
    "/tenant/products/new": "products:create",
    "/tenant/customers": "customers:view",
    "/tenant/customers/new": "customers:create",
    "/tenant/vendors": "vendors:view",
    "/tenant/purchases": "purchases:view",
    "/tenant/pos/register": "pos:access",
    "/tenant/pos/cart": "pos:access",
    "/tenant/pos/sales": "sales:view",
    "/tenant/pos/shifts": "pos:access",
    "/tenant/users": "users:view",
    "/tenant/users/new": "users:create",
    "/tenant/settings": "settings:view",
    "/tenant/reports": "reports:view",
    "/tenant/expenses": "expenses:view",
    "/tenant/inventory": "inventory:view",
    "/tenant/pos/sell": "pos:access",
    "/tenant/billing": "billing:view",
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = rolePermissions[role];
    return permissions.includes(permission);
}

/**
 * Check if a role can access a specific route
 */
export function canAccessRoute(role: UserRole, route: string): boolean {
    const permission = ROUTE_PERMISSIONS[route];
    if (!permission) return true; // Allow access if no permission defined
    return hasPermission(role, permission);
}

/**
 * Get all accessible routes for a role
 */
export function getAccessibleRoutes(role: UserRole): string[] {
    return Object.keys(ROUTE_PERMISSIONS).filter((route) =>
        canAccessRoute(role, route),
    );
}
