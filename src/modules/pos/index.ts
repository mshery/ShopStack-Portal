/**
 * POS Module Public API
 */

// Store
export { usePOSStore, cartToLineItems, getReceiptBySaleId } from "./store/pos.store";

// Hooks
export { usePOSCartLogic } from "./hooks/usePOSCartLogic";
export { useSalesHistoryLogic } from "./hooks/useSalesHistoryLogic";

// Queries — exposed so adjacent modules (billing) can read live sales
// off the API instead of the seed-only Zustand store.
export { useSalesFetch } from "./api/queries";

// Pages
export { default as CartPage } from "./pages/CartPage";
export { default as SalesHistoryPage } from "./pages/SalesHistoryPage";
