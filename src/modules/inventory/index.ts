/**
 * Inventory Module Public API
 */

// Store
export { useInventoryStore } from "./store/inventory.store";

// Pages
export { default as InventoryPage } from "./pages/InventoryPage";

// Components
export { ExpiryAlertsWidget } from "./components/ExpiryAlertsWidget";

// API & Queries
export { batchesApi } from "./api/batchesApi";
export * from "./api/batchesQueries";
