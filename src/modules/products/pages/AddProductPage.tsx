import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/modules/auth";
import { useProductsStore } from "@/modules/products";
import { useCategoriesStore } from "@/modules/catalog";
import { useBrandsStore } from "@/modules/catalog";
import { useProductsScreen } from "../hooks/useProductsScreen";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import {
  ArrowLeft,
  Save,
  Package,
  Tag,
  DollarSign,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import type { Product } from "@/shared/types/models";

export default function AddProductPage() {
  const navigate = useNavigate();
  const { vm } = useProductsScreen();
  const { activeTenantId } = useAuthStore();
  const { addProduct } = useProductsStore();
  const { categories } = useCategoriesStore();
  const { brands } = useBrandsStore();

  // Filter by tenant
  const tenantCategories = categories.filter(
    (c) => c.tenant_id === activeTenantId
  );
  const tenantBrands = brands.filter((b) => b.tenant_id === activeTenantId);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    categoryId: "",
    brandId: "",
    unitPrice: "",
    currentStock: "",
    minimumStock: "",
    description: "",
  });

  // Guard: if over limit, redirect back (unless loading)
  useEffect(() => {
    if (!vm.canAddMore) {
      // Just to be safe, we could show a toast or message here
    }
  }, [vm.canAddMore, navigate]);

  if (!vm.canAddMore) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-2">
          Product Limit Reached
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
          Your current plan allows for a maximum of <b>{vm.maxProducts}</b>{" "}
          products. Please upgrade your plan to add more.
        </p>
        <Button onClick={() => navigate("/tenant/products")} variant="primary">
          Back to Products
        </Button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTenantId) return;

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      tenant_id: activeTenantId,
      name: formData.name,
      sku: formData.sku,
      categoryId: formData.categoryId,
      brandId: formData.brandId,
      unitPrice: parseFloat(formData.unitPrice),
      currentStock: parseInt(formData.currentStock),
      minimumStock: parseInt(formData.minimumStock),
      status:
        parseInt(formData.currentStock) <= 0
          ? "out_of_stock"
          : parseInt(formData.currentStock) <= parseInt(formData.minimumStock)
            ? "low_stock"
            : "in_stock",
      imageUrl: null,
      description: formData.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      costPrice: 0,
      vendorId: null,
    };

    addProduct(newProduct);
    navigate("/tenant/products");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/tenant/products")}
          className="rounded-full size-10 p-0"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Add New Product
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create a new item in your inventory
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white/90">
                  Basic Information
                </CardTitle>
                <CardDescription className="dark:text-white/90">
                  Essential details about the product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Product Name
                  </Label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      required
                      placeholder="e.g. Wireless Headphones"
                      className="pl-10"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      SKU / Barcode
                    </Label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        required
                        placeholder="WH-001"
                        className="pl-10 uppercase"
                        value={formData.sku}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sku: e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Category
                    </Label>
                    <div className="relative">
                      <select
                        required
                        className="w-full h-11 px-4 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                        value={formData.categoryId}
                        onChange={(e) =>
                          setFormData({ ...formData, categoryId: e.target.value })
                        }
                      >
                        <option value="">Select a category</option>
                        {tenantCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                    </div>
                    {tenantCategories.length === 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        No categories found. Add categories in Settings.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Brand
                  </Label>
                  <div className="relative">
                    <select
                      required
                      className="w-full h-11 px-4 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                      value={formData.brandId}
                      onChange={(e) =>
                        setFormData({ ...formData, brandId: e.target.value })
                      }
                    >
                      <option value="">Select a brand</option>
                      {tenantBrands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                  </div>
                  {tenantBrands.length === 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      No brands found. Add brands in Settings.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </Label>
                  <Textarea
                    placeholder="Enter product description..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white/90">
                  Pricing & Inventory
                </CardTitle>
                <CardDescription className="dark:text-white/90">
                  Define cost and stock levels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Unit Price
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        required
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-10"
                        value={formData.unitPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            unitPrice: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Stock
                    </Label>
                    <Input
                      required
                      type="number"
                      placeholder="0"
                      value={formData.currentStock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentStock: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Min. Stock Level
                    </Label>
                    <Input
                      required
                      type="number"
                      placeholder="5"
                      value={formData.minimumStock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minimumStock: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="dark:text-white/90">
                  Product Media
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center p-6 text-center">
                  <Package className="size-10 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500">
                    Image upload is disabled in this demo
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                className="w-full h-12 text-base shadow-lg shadow-brand-500/20"
              >
                <Save className="mr-2 size-5" />
                Save Product
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/tenant/products")}
                className="w-full h-12 text-base"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
