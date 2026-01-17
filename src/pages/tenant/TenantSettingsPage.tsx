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
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Check } from "lucide-react";

export default function TenantSettingsPage() {
  const { activeTenantId } = useAuthStore();
  const { tenants, updateTenantSettings } = useTenantsStore();
  const tenant = tenants.find((t) => t.id === activeTenantId);

  const [currencySymbol, setCurrencySymbol] = useState(
    tenant?.settings?.currencySymbol || "$"
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSaveSettings = () => {
    if (!activeTenantId) return;

    updateTenantSettings(activeTenantId, {
      currencySymbol,
    });

    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
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
                  <CardTitle className="text-lg dark:text-white/90">Company Information</CardTitle>
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
                  <CardTitle className="text-lg dark:text-white/90">POS Configurations</CardTitle>
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
