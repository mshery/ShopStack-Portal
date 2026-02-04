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
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useAddProductScreen } from "../hooks/useAddProductScreen";
import { PageSkeleton } from "@/shared/components/skeletons/PageSkeleton";

export default function AddProductPage() {
  const { status, vm, actions } = useAddProductScreen();

  if (status === "loading") {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={actions.goBack}
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          actions.submitForm();
        }}
        className="space-y-6"
      >
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
                      value={vm.formData.name}
                      onChange={(e) =>
                        actions.updateField("name", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      SKU / Barcode
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <Input
                          required
                          placeholder="PROD-20260130-001"
                          className="pl-10 uppercase"
                          value={vm.formData.sku}
                          onChange={(e) =>
                            actions.updateField(
                              "sku",
                              e.target.value.toUpperCase(),
                            )
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={actions.generateSku}
                        disabled={vm.isGeneratingSku}
                        className="shrink-0"
                        title="Auto-generate SKU"
                      >
                        {vm.isGeneratingSku ? (
                          <RefreshCw className="size-4 animate-spin" />
                        ) : (
                          <Sparkles className="size-4" />
                        )}
                      </Button>
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
                        value={vm.formData.categoryId}
                        onChange={(e) =>
                          actions.updateField("categoryId", e.target.value)
                        }
                      >
                        <option value="">Select a category</option>
                        {vm.categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                    </div>
                    {vm.categories.length === 0 && !vm.isDataLoading && (
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
                      value={vm.formData.brandId}
                      onChange={(e) =>
                        actions.updateField("brandId", e.target.value)
                      }
                    >
                      <option value="">Select a brand</option>
                      {vm.brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                  </div>
                  {vm.brands.length === 0 && !vm.isDataLoading && (
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
                    value={vm.formData.description}
                    onChange={(e) =>
                      actions.updateField("description", e.target.value)
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        min="0"
                        placeholder="0.00"
                        className="pl-10"
                        value={vm.formData.unitPrice || ""}
                        onChange={(e) =>
                          actions.updateField(
                            "unitPrice",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Cost Price
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-10"
                        value={vm.formData.costPrice || ""}
                        onChange={(e) =>
                          actions.updateField(
                            "costPrice",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Stock
                    </Label>
                    <Input
                      required
                      type="number"
                      min="0"
                      placeholder="0"
                      value={vm.formData.currentStock || ""}
                      onChange={(e) =>
                        actions.updateField(
                          "currentStock",
                          parseInt(e.target.value) || 0,
                        )
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
                      min="0"
                      placeholder="5"
                      value={vm.formData.minimumStock || ""}
                      onChange={(e) =>
                        actions.updateField(
                          "minimumStock",
                          parseInt(e.target.value) || 0,
                        )
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
                <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group">
                  {vm.formData.imageUrl ? (
                    <div className="relative w-full aspect-square">
                      <img
                        src={vm.formData.imageUrl}
                        alt="Product"
                        className="w-full h-full object-contain rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          type="button"
                          onClick={() => actions.updateField("imageUrl", "")}
                        >
                          Remove Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Package className="size-10 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {vm.isUploading
                          ? "Uploading..."
                          : "Click to upload image"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        MAX 5MB (JPEG, PNG, WEBP)
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={vm.isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) actions.uploadImage(file);
                        }}
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                disabled={vm.isCreating}
                className="w-full h-12 text-base shadow-lg shadow-brand-500/20"
              >
                {vm.isCreating ? (
                  <RefreshCw className="mr-2 size-5 animate-spin" />
                ) : (
                  <Save className="mr-2 size-5" />
                )}
                {vm.isCreating ? "Saving..." : "Save Product"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={actions.goBack}
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
