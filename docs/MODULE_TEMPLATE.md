# Module Template

Each module should follow this structure:

```
modules/{module-name}/
  api/           # API service functions
  components/    # Module-specific React components
  hooks/         # Custom React hooks
  pages/         # Page components (routes)
  store/         # Redux Toolkit slices
  types/         # TypeScript type definitions
  
## Naming Conventions

- **Pages:** `{Module}{View}Page` (e.g., `ProductListPage`)
- **Components:** `{Module}{Component}` (e.g., `ProductTable`)
- **Hooks:** `use{Module}{Thing}` (e.g., `useProductFilters`)
- **API:** `{module}Service` (e.g., `productService`)
- **Types:** Singular nouns (e.g., `Product`, `ProductStatus`)
