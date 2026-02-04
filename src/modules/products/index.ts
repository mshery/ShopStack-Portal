/**
 * Products Module Public API
 */

// API
export { productsApi } from "./api/productsApi";
export type {
  Product,
  ProductFilters as ApiProductFilters,
  CreateProductInput,
  UpdateProductInput,
} from "./api/productsApi";

// Stores
export { useProductsStore } from "./store/products.store";
export { useAuditStore } from "./store/audit.store";

// Hooks
export { useProductsLogic } from "./hooks/useProductsLogic";
export { useProductsScreen } from "./hooks/useProductsScreen";
export { useProductDetailsScreen } from "./hooks/useProductDetailsScreen";
export { useProductFilters } from "./hooks/useProductFilters";
export { useAddProductScreen } from "./hooks/useAddProductScreen";
export type { ProductFilters } from "./hooks/useProductFilters";

// Pages
export { default as ProductsPage } from "./pages/ProductsPage";
export { default as ProductDetailsPage } from "./pages/ProductDetailsPage";
export { default as AddProductPage } from "./pages/AddProductPage";
