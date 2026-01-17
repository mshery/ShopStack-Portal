import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantsStore } from "@/stores/tenants.store";
import { useCategoriesStore } from "@/stores/categories.store";
import { useBrandsStore } from "@/stores/brands.store";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Check, Plus, Pencil, Trash2, X, Package, Tag } from "lucide-react";
import type { ProductCategory, ProductBrand } from "@/types";

export default function TenantSettingsPage() {
  const { activeTenantId } = useAuthStore();
  const { tenants, updateTenantSettings } = useTenantsStore();
  const tenant = tenants.find((t) => t.id === activeTenantId);

  const { categories, addCategory, updateCategory, removeCategory } =
    useCategoriesStore();
  const { brands, addBrand, updateBrand, removeBrand } = useBrandsStore();

  // Filter by tenant
  const tenantCategories = categories.filter(
    (c) => c.tenant_id === activeTenantId
  );
  const tenantBrands = brands.filter((b) => b.tenant_id === activeTenantId);

  const [currencySymbol, setCurrencySymbol] = useState(
    tenant?.settings?.currencySymbol || "$"
  );
  const [showSuccess, setShowSuccess] = useState(false);

  // Category state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");

  // Brand state
  const [newBrandName, setNewBrandName] = useState("");
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [editingBrandName, setEditingBrandName] = useState("");

  const handleSaveSettings = () => {
    if (!activeTenantId) return;

    updateTenantSettings(activeTenantId, {
      currencySymbol,
    });

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Category handlers
  const handleAddCategory = () => {
    if (!newCategoryName.trim() || !activeTenantId) return;
    const newCat: ProductCategory = {
      id: `cat-${Date.now()}`,
      tenant_id: activeTenantId,
      name: newCategoryName.trim(),
      createdAt: new Date().toISOString(),
    };
    addCategory(newCat);
    setNewCategoryName("");
  };

  const handleEditCategory = (cat: ProductCategory) => {
    setEditingCategoryId(cat.id);
    setEditingCategoryName(cat.name);
  };

  const handleSaveCategory = () => {
    if (!editingCategoryId || !editingCategoryName.trim()) return;
    updateCategory(editingCategoryId, { name: editingCategoryName.trim() });
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const handleCancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const handleDeleteCategory = (id: string) => {
    removeCategory(id);
  };

  // Brand handlers
  const handleAddBrand = () => {
    if (!newBrandName.trim() || !activeTenantId) return;
    const newBr: ProductBrand = {
      id: `brand-${Date.now()}`,
      tenant_id: activeTenantId,
      name: newBrandName.trim(),
      createdAt: new Date().toISOString(),
    };
    addBrand(newBr);
    setNewBrandName("");
  };

  const handleEditBrand = (brand: ProductBrand) => {
    setEditingBrandId(brand.id);
    setEditingBrandName(brand.name);
  };

  const handleSaveBrand = () => {
    if (!editingBrandId || !editingBrandName.trim()) return;
    updateBrand(editingBrandId, { name: editingBrandName.trim() });
    setEditingBrandId(null);
    setEditingBrandName("");
  };

  const handleCancelEditBrand = () => {
    setEditingBrandId(null);
    setEditingBrandName("");
  };

  const handleDeleteBrand = (id: string) => {
    removeBrand(id);
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Settings" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Store Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Configure your business details and preferences
          </p>
        </div>

        <div className="grid gap-6 max-w-7xl">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20">
                  <svg
                    className="h-6 w-6 text-brand-600 dark:text-brand-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-lg dark:text-white/90">
                    Company Information
                  </CardTitle>
                  <CardDescription className="dark:text-white/90">
                    Your business details shown on receipts and invoices
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium">
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    defaultValue={tenant?.companyName}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-medium">
                    Slug{" "}
                    <span className="text-xs text-gray-500">(Read Only)</span>
                  </Label>
                  <Input
                    id="slug"
                    defaultValue={tenant?.slug}
                    disabled
                    className="h-11 bg-gray-50 dark:bg-gray-900"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId" className="text-sm font-medium">
                  Tax ID / VAT Number
                </Label>
                <Input
                  id="taxId"
                  placeholder="Enter your tax registration number"
                  className="h-11"
                />
              </div>
              <div className="pt-2">
                <Button className="h-11 px-6">Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Product Configuration - Categories & Brands */}
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                  <Package className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-lg dark:text-white/90">
                    Product Configuration
                  </CardTitle>
                  <CardDescription className="dark:text-white/90">
                    Manage categories and brands for your products
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Categories Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-gray-500" />
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                    Categories
                  </h3>
                </div>
                {/* Add Category */}
                <div className="flex gap-2">
                  <Input
                    placeholder="New category name..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                    size="sm"
                    className="px-4"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                {/* Categories List */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {tenantCategories.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                      No categories added yet
                    </p>
                  ) : (
                    tenantCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg group"
                      >
                        {editingCategoryId === cat.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={editingCategoryName}
                              onChange={(e) =>
                                setEditingCategoryName(e.target.value)
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleSaveCategory()
                              }
                              className="h-8 flex-1"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSaveCategory}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEditCategory}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4 text-gray-500" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {cat.name}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditCategory(cat)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-3.5 w-3.5 text-gray-500" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Separator />

              {/* Brands Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-gray-500" />
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                    Brands
                  </h3>
                </div>
                {/* Add Brand */}
                <div className="flex gap-2">
                  <Input
                    placeholder="New brand name..."
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddBrand()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAddBrand}
                    disabled={!newBrandName.trim()}
                    size="sm"
                    className="px-4"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                {/* Brands List */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {tenantBrands.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                      No brands added yet
                    </p>
                  ) : (
                    tenantBrands.map((brand) => (
                      <div
                        key={brand.id}
                        className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg group"
                      >
                        {editingBrandId === brand.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={editingBrandName}
                              onChange={(e) =>
                                setEditingBrandName(e.target.value)
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleSaveBrand()
                              }
                              className="h-8 flex-1"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleSaveBrand}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEditBrand}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4 text-gray-500" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {brand.name}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditBrand(brand)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-3.5 w-3.5 text-gray-500" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteBrand(brand.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
                  <svg
                    className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-lg dark:text-white/90">
                    POS Configurations
                  </CardTitle>
                  <CardDescription className="dark:text-white/90">
                    Customize your point of sale behavior
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="autoPrint"
                      className="font-medium cursor-pointer"
                    >
                      Auto-Print Receipts
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Print receipt automatically after checkout
                  </p>
                </div>
                <Switch id="autoPrint" defaultChecked />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="cashManagement"
                      className="font-medium cursor-pointer"
                    >
                      Cash Management
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Require opening and closing cash declarations
                  </p>
                </div>
                <Switch id="cashManagement" defaultChecked />
              </div>

              <Separator className="my-6" />

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm font-medium">
                  Currency Symbol
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="currency"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="w-32 h-11"
                    maxLength={3}
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    e.g., $, €, £, ¥, ₹
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This symbol will be displayed before all prices in your store
                </p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleSaveSettings}
                  className="h-11 px-6 gap-2"
                >
                  {showSuccess && <Check className="w-4 h-4" />}
                  {showSuccess ? "Saved!" : "Save Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/30 dark:border-red-900/50 dark:bg-red-950/20">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/20">
                  <svg
                    className="h-6 w-6 text-red-600 dark:text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-red-700 dark:text-red-400 text-lg">
                    Danger Zone
                  </CardTitle>
                  <CardDescription className="text-red-600/80 dark:text-red-400/60">
                    Irreversible actions for your store
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border border-red-200 dark:border-red-900/50 bg-white dark:bg-red-950/10 p-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white/90">
                    Delete All Data
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    This action cannot be undone. All your data will be
                    permanently deleted.
                  </p>
                </div>
                <Button variant="destructive" className="ml-4 h-11 px-6">
                  Delete All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

