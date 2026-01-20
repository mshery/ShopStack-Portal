/**
 * Core Module Public API
 *
 * Exports from the core infrastructure module.
 */

// API
export { httpClient, seedData, simulateDelay } from "./api/httpClient";

// Config
export { env } from "./config/env";
export type { Env } from "./config/env";

// Security
export {
    type Permission,
    type TenantRole,
    rolePermissions,
    ROLE_PERMISSIONS,
    ROUTE_PERMISSIONS,
    hasPermission,
    canAccessRoute,
    getAccessibleRoutes,
} from "./security/rbac.config";

export {
    hasPermission as checkPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissionsForRole,
} from "./security/permissions";

// Routing
export { router } from "./routing/router";
export { AuthLayout } from "./routing/layouts/AuthLayout";
export { PlatformLayout } from "./routing/layouts/PlatformLayout";
export { TenantLayout } from "./routing/layouts/TenantLayout";
export { TenantStatusGuard } from "./routing/guards/TenantStatusGuard";
