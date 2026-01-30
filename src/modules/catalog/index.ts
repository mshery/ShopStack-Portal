/**
 * Catalog Module Public API
 *
 * Categories and Brands management
 */

// API
export { catalogApi } from "./api/catalogApi";
export type { Category, Brand } from "./api/catalogApi";

// Hooks
export { useCategoriesScreen } from "./hooks/useCategoriesScreen";
export { useBrandsScreen } from "./hooks/useBrandsScreen";

// Stores (legacy, kept for backward compat)
export { useCategoriesStore } from "./store/categories.store";
export { useBrandsStore } from "./store/brands.store";

// Pages
export { default as CategoriesPage } from "./pages/CategoriesPage";
export { default as BrandsPage } from "./pages/BrandsPage";
