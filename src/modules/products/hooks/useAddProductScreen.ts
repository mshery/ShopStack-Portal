/**
 * Add Product Screen Hook
 *
 * Screen hook for adding new products following coding rules:
 * - Returns { status, vm, actions }
 * - Uses TanStack Query for data fetching
 * - Handles product creation with API
 * - Provides SKU auto-generation
 */

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { productsApi, type CreateProductInput } from "../api/productsApi";
import { catalogApi } from "@/modules/catalog/api/catalogApi";
import { refetchProductListPage } from "../utils/productQueriesUtils";
import { ITEMS_PER_PAGE } from "./useProductsScreen";
import type { AsyncStatus } from "@/shared/types/api";
import toast from "react-hot-toast";

export function useAddProductScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: catalogApi.getCategories,
    staleTime: 60000,
  });

  // Fetch brands
  const { data: brandsData, isLoading: brandsLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: catalogApi.getBrands,
    staleTime: 60000,
  });

  // Loading state
  const isDataLoading = categoriesLoading || brandsLoading;

  // Form state
  const [formData, setFormData] = useState<CreateProductInput>({
    name: "",
    sku: "",
    categoryId: "",
    brandId: "",
    unitPrice: 0,
    costPrice: 0,
    currentStock: 0,
    minimumStock: 5,
    description: "",
    imageUrl: "",
  });

  // SKU generation & Image Upload state
  const [isGeneratingSku, setIsGeneratingSku] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Create mutation with page 1 refetch
  const createMutation = useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: async () => {
      // Refetch page 1 (where new product will appear)
      await refetchProductListPage(queryClient, {
        page: 1,
        limit: ITEMS_PER_PAGE,
      });
      toast.success("Product created successfully");
      // Navigate to page 1 of products list
      navigate("/tenant/products?page=1&limit=10");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create product");
    },
  });

  // Status
  const status: AsyncStatus = isDataLoading ? "loading" : "success";

  // View Model
  const vm = useMemo(
    () => ({
      categories: categoriesData ?? [],
      brands: brandsData ?? [],
      formData,
      isCreating: createMutation.isPending,
      isGeneratingSku,
      isUploading,
      isDataLoading,
    }),
    [
      categoriesData,
      brandsData,
      formData,
      createMutation.isPending,
      isGeneratingSku,
      isUploading,
      isDataLoading,
    ],
  );

  // Actions
  const updateField = useCallback(
    <K extends keyof CreateProductInput>(
      field: K,
      value: CreateProductInput[K],
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const generateSku = useCallback(async () => {
    setIsGeneratingSku(true);
    try {
      const sku = await productsApi.generateSku();
      setFormData((prev) => ({ ...prev, sku }));
      toast.success("SKU generated");
    } catch {
      toast.error("Failed to generate SKU");
    } finally {
      setIsGeneratingSku(false);
    }
  }, []);

  const uploadImage = useCallback(async (file: File) => {
    try {
      setIsUploading(true);
      const url = await productsApi.uploadImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: url }));
      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const submitForm = useCallback(() => {
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!formData.sku.trim()) {
      toast.error("SKU is required");
      return;
    }
    if (!formData.categoryId) {
      toast.error("Please select a category");
      return;
    }
    if (!formData.brandId) {
      toast.error("Please select a brand");
      return;
    }
    if (formData.unitPrice <= 0) {
      toast.error("Unit price must be greater than 0");
      return;
    }

    createMutation.mutate(formData);
  }, [formData, createMutation]);

  const goBack = useCallback(() => {
    navigate("/tenant/products");
  }, [navigate]);

  const actions = useMemo(
    () => ({
      updateField,
      generateSku,
      uploadImage,
      submitForm,
      goBack,
    }),
    [updateField, generateSku, uploadImage, submitForm, goBack],
  );

  return { status, vm, actions };
}
