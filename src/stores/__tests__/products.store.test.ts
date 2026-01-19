import { describe, it, expect, beforeEach } from "vitest";
import { useProductsStore } from "../products.store";
import type { Product } from "@/types";

describe("Products Store", () => {
  beforeEach(() => {
    // Reset store before each test
    useProductsStore.setState({ products: [] });
  });

  describe("setProducts", () => {
    it("should set products array", () => {
      const { setProducts } = useProductsStore.getState();
      const mockProducts: Product[] = [
        {
          id: "prod-1",
          tenant_id: "tenant-1",
          name: "Test Product",
          sku: "TEST-001",
          categoryId: "cat-1",
          brandId: "brand-1",
          unitPrice: 99.99,
          costPrice: 50,
          vendorId: null,
          currentStock: 10,
          minimumStock: 5,
          status: "in_stock",
          imageUrl: null,
          description: "Test description",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        },
      ];

      setProducts(mockProducts);

      expect(useProductsStore.getState().products).toEqual(mockProducts);
    });

    it("should handle null by setting empty array", () => {
      const { setProducts } = useProductsStore.getState();

      setProducts(null as unknown as Product[]);

      expect(useProductsStore.getState().products).toEqual([]);
    });
  });

  describe("addProduct", () => {
    it("should add a product to the store", () => {
      const { addProduct } = useProductsStore.getState();
      const newProduct: Product = {
        id: "prod-new",
        tenant_id: "tenant-1",
        name: "New Product",
        sku: "NEW-001",
        categoryId: "cat-1",
        brandId: "brand-1",
        unitPrice: 149.99,
        costPrice: 75,
        vendorId: null,
        currentStock: 20,
        minimumStock: 5,
        status: "in_stock",
        imageUrl: null,
        description: "New product description",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      };

      addProduct(newProduct);

      expect(useProductsStore.getState().products).toHaveLength(1);
      expect(useProductsStore.getState().products[0].name).toBe("New Product");
    });
  });

  describe("updateProduct", () => {
    it("should update an existing product", () => {
      const { setProducts, updateProduct } = useProductsStore.getState();
      setProducts([
        {
          id: "prod-1",
          tenant_id: "tenant-1",
          name: "Original Name",
          sku: "TEST-001",
          categoryId: "cat-1",
          brandId: "brand-1",
          unitPrice: 99.99,
          costPrice: 50,
          vendorId: null,
          currentStock: 10,
          minimumStock: 5,
          status: "in_stock",
          imageUrl: null,
          description: "Test",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        },
      ]);

      updateProduct("prod-1", { name: "Updated Name", unitPrice: 129.99 });

      const updated = useProductsStore.getState().products[0];
      expect(updated.name).toBe("Updated Name");
      expect(updated.unitPrice).toBe(129.99);
    });
  });

  describe("removeProduct", () => {
    it("should remove a product by ID", () => {
      const { setProducts, removeProduct } = useProductsStore.getState();
      setProducts([
        {
          id: "prod-1",
          tenant_id: "tenant-1",
          name: "Product 1",
          sku: "TEST-001",
          categoryId: "cat-1",
          brandId: "brand-1",
          unitPrice: 99.99,
          costPrice: 50,
          vendorId: null,
          currentStock: 10,
          minimumStock: 5,
          status: "in_stock",
          imageUrl: null,
          description: "Test",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        },
        {
          id: "prod-2",
          tenant_id: "tenant-1",
          name: "Product 2",
          sku: "TEST-002",
          categoryId: "cat-1",
          brandId: "brand-1",
          unitPrice: 199.99,
          costPrice: 100,
          vendorId: null,
          currentStock: 5,
          minimumStock: 2,
          status: "in_stock",
          imageUrl: null,
          description: "Test 2",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        },
      ]);

      removeProduct("prod-1");

      const products = useProductsStore.getState().products;
      expect(products).toHaveLength(1);
      expect(products[0].id).toBe("prod-2");
    });
  });
});
