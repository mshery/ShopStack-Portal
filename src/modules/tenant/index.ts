/**
 * Tenant Module Public API
 * 
 * Core tenant functionality: dashboard, settings, user management
 */

// Stores
export { useUsersStore } from "./store/users.store";
export { useTenantsStore } from "@/modules/platform";

// Hooks
export { useTenantDashboardLogic } from "./hooks/useTenantDashboardLogic";
export { useTenantDashboardScreen } from "./hooks/useTenantDashboardScreen";
export { useTenantUsersLogic } from "./hooks/useTenantUsersLogic";
export { useTenantUsersScreen } from "./hooks/useTenantUsersScreen";
export { useTenantCurrency } from "./hooks/useTenantCurrency";
export { useTenantStatusSync, broadcastTenantStatusChange } from "./hooks/useTenantStatusSync";

// Pages
export { default as TenantDashboardPage } from "./pages/TenantDashboardPage";
export { default as TenantSettingsPage } from "./pages/TenantSettingsPage";
export { default as TenantUsersPage } from "./pages/TenantUsersPage";
export { default as AddTenantUserPage } from "./pages/AddTenantUserPage";
export { default as ProfilePage } from "./pages/ProfilePage";

// Components (default exports)
export { default as AddUserModal } from "./components/AddUserModal";
export { default as EditUserModal } from "./components/EditUserModal";
