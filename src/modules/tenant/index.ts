/**
 * Tenant Module Public API
 *
 * Core tenant functionality: dashboard, settings, user/team management, billing
 */

// API & Queries
export { tenantApi } from "./api/tenantApi";
export type {
  TeamMember,
  CreateTeamMemberInput,
  UpdateTeamMemberInput,
  TenantBilling,
  Invoice,
  PaymentMethod,
} from "./api/tenantApi";
export {
  tenantKeys,
  useTeamMembersFetch,
  useTeamMemberFetch,
  useCreateTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember,
  useBillingFetch,
  useUpdateBillingCycle,
  useInvoicesFetch,
  useInvoiceFetch,
  usePaymentMethodsFetch,
  useAddPaymentMethod,
  useSetDefaultPaymentMethod,
  useDeletePaymentMethod,
} from "./api/queries";

// Stores
export { useUsersStore } from "./store/users.store";
// Re-export for backward compatibility (billing, pos modules use this)
export { useTenantsStore } from "@/modules/platform";

// Hooks
export { useTenantDashboardLogic } from "./hooks/useTenantDashboardLogic";
export { useTenantDashboardScreen } from "./hooks/useTenantDashboardScreen";
export { useTenantUsersLogic } from "./hooks/useTenantUsersLogic";
export { useTenantUsersScreen } from "./hooks/useTenantUsersScreen";
export { useTenantCurrency } from "./hooks/useTenantCurrency";
export {
  useTenantStatusSync,
  broadcastTenantStatusChange,
} from "./hooks/useTenantStatusSync";

// Pages
export { default as TenantDashboardPage } from "./pages/TenantDashboardPage";
export { default as TenantSettingsPage } from "./pages/TenantSettingsPage";
export { default as TenantUsersPage } from "./pages/TenantUsersPage";
export { default as AddTenantUserPage } from "./pages/AddTenantUserPage";
export { default as ProfilePage } from "./pages/ProfilePage";

// Components (default exports)
export { default as AddUserModal } from "./components/AddUserModal";
export { default as EditUserModal } from "./components/EditUserModal";
