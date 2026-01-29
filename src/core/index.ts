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

// Security - RBAC Configuration
export {
  type Permission,
  type TenantRole,
  type PlatformRole,
  type Role,
  rolePermissions,
  platformPermissions,
  routePermissions,
} from "./security/rbac.config";

// Security - Permission Utilities
export {
  hasPermission,
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
