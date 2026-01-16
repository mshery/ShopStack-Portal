import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useProductsStore } from "@/stores/products.store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Save,
  Package,
  Tag,
  DollarSign,
  Layers,
} from "lucide-react";
import type { Product } from "@/types";

export default function AddProductPage() {
  const navigate = useNavigate();
  const { activeTenantId } = useAuthStore();
  const { addProduct } = useProductsStore();

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    brand: "",
    unitPrice: "",
    currentStock: "",
    minimumStock: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTenantId) return;

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      tenant_id: activeTenantId,
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      brand: formData.brand,
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
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Essential details about the product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Product Name
                  </label>
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
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      SKU / Barcode
                    </label>
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
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Category
                    </label>
                    <div className="relative">
                      <Layers className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        required
                        placeholder="Electronics"
                        className="pl-10"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
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
                <CardTitle>Pricing & Inventory</CardTitle>
                <CardDescription>Define cost and stock levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Unit Price
                    </label>
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
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Stock
                    </label>
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
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Min. Stock Level
                    </label>
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
                <CardTitle>Product Media</CardTitle>
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
