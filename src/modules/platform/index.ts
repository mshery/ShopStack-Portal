/**
 * Platform Module Public API
 * 
 * Super Admin / Platform level functionality
 */

// Stores
export { useTenantsStore } from "./store/tenants.store";
export { useActivityLogsStore } from "./store/activityLogs.store";
export { usePlatformSettingsStore } from "./store/platformSettings.store";

// Hooks
export { usePlatformDashboardScreen } from "./hooks/usePlatformDashboardScreen";
export { useTenantsListScreen } from "./hooks/useTenantsListScreen";
export { useImpersonation } from "./hooks/useImpersonation";

// Pages
export { default as PlatformDashboardPage } from "./pages/PlatformDashboardPage";
export { default as TenantsListPage } from "./pages/TenantsListPage";
export { default as CreateTenantPage } from "./pages/CreateTenantPage";
export { default as TenantDetailPage } from "./pages/TenantDetailPage";
export { default as PlatformLogsPage } from "./pages/PlatformLogsPage";
export { default as PlatformSettingsPage } from "./pages/PlatformSettingsPage";

// Components
export { ImpersonationBanner } from "./components/ImpersonationBanner";
