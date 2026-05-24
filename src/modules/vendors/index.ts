/**
 * Vendors Module Public API
 */

// Store
export { useVendorsStore } from "./store/vendors.store";

// Queries — exposed so adjacent modules (products, purchases) can
// fetch the vendor list off the API for supplier dropdowns and
// vendor pre-fills.
export { useVendorsFetch, useVendorFetch } from "./api/queries";

// Pages
export { default as VendorsPage } from "./pages/VendorsPage";
