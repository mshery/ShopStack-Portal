/**
 * Customers Module Public API
 */

// Store
export { useCustomersStore } from "./store/customers.store";

// Hooks
export { useCustomersLogic } from "./hooks/useCustomersLogic";
export { useCustomersScreen } from "./hooks/useCustomersScreen";

// Queries — exposed so adjacent modules (POS cart) can fetch the
// live customer list off the API instead of the seed-only Zustand
// store.
export { useCustomersFetch } from "./api/queries";

// Pages
export { default as CustomersPage } from "./pages/CustomersPage";
export { default as AddCustomerPage } from "./pages/AddCustomerPage";
