import { describe, it, expect, beforeEach } from "vitest";
import { usePOSStore } from "../pos.store";
import type { Product } from "@/types";

describe("POS Store", () => {
  beforeEach(() => {
    // Reset store before each test
    usePOSStore.setState({
      cart: [],
      heldOrders: [],
      selectedCustomerId: null,
      currentDiscount: null,
    });
  });

  describe("addToCart", () => {
    it("should add a product to the cart", () => {
      const { addToCart } = usePOSStore.getState();
      const mockProduct: Product = {
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
      };

      addToCart(mockProduct);

      const cart = usePOSStore.getState().cart;
      expect(cart).toHaveLength(1);
      expect(cart[0].productId).toBe("prod-1");
      expect(cart[0].quantity).toBe(1);
    });

    it("should increment quantity when adding same product", () => {
      const { addToCart } = usePOSStore.getState();
      const mockProduct: Product = {
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
      };

      addToCart(mockProduct);
      addToCart(mockProduct);

      const cart = usePOSStore.getState().cart;
      expect(cart).toHaveLength(1);
      expect(cart[0].quantity).toBe(2);
    });
  });

  describe("removeFromCart", () => {
    it("should remove a product from the cart", () => {
      const { addToCart, removeFromCart } = usePOSStore.getState();
      const mockProduct: Product = {
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
      };

      addToCart(mockProduct);
      removeFromCart("prod-1");

      expect(usePOSStore.getState().cart).toHaveLength(0);
    });
  });

  describe("updateCartItemQuantity", () => {
    it("should update the quantity of a cart item", () => {
      const { addToCart, updateCartItemQuantity } = usePOSStore.getState();
      const mockProduct: Product = {
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
      };

      addToCart(mockProduct);
      updateCartItemQuantity("prod-1", 5);

      expect(usePOSStore.getState().cart[0].quantity).toBe(5);
    });

    it("should remove item when quantity is 0", () => {
      const { addToCart, updateCartItemQuantity } = usePOSStore.getState();
      const mockProduct: Product = {
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
      };

      addToCart(mockProduct);
      updateCartItemQuantity("prod-1", 0);

      expect(usePOSStore.getState().cart).toHaveLength(0);
    });
  });

  describe("clearCart", () => {
    it("should clear all items from the cart", () => {
      const { addToCart, clearCart } = usePOSStore.getState();
      const mockProduct1: Product = {
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
      };
      const mockProduct2: Product = {
        id: "prod-2",
        tenant_id: "tenant-1",
        name: "Product 2",
        sku: "TEST-002",
        categoryId: "cat-1",
        brandId: "brand-1",
        unitPrice: 149.99,
        costPrice: 75,
        vendorId: null,
        currentStock: 5,
        minimumStock: 2,
        status: "in_stock",
        imageUrl: null,
        description: "Test 2",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      };

      addToCart(mockProduct1);
      addToCart(mockProduct2);
      clearCart();

      expect(usePOSStore.getState().cart).toHaveLength(0);
    });
  });

  describe("setDiscount", () => {
    it("should set discount object", () => {
      const { setDiscount } = usePOSStore.getState();
      const discount = {
        type: "percentage" as const,
        value: 10,
        reason: "Customer loyalty",
      };

      setDiscount(discount);

      expect(usePOSStore.getState().currentDiscount).toEqual(discount);
    });
  });
});
