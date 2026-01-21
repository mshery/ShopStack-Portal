import { motion, AnimatePresence } from "motion/react";
import {
  useCreateTenantLogic,
  type CreateTenantData,
} from "@/modules/platform/hooks/useCreateTenantLogic";
import { Stepper } from "@/shared/components/feedback/Stepper";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  Users,
  Package,
  ShoppingCart,
  Sparkles,
  Globe,
} from "lucide-react";
import { formatPlanName } from "@/shared/utils/format";
import type { TenantPlan } from "@/shared/types/models";

export default function CreateTenantPage() {
  const { vm, actions } = useCreateTenantLogic();

  return (
    <div className="min-h-full bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={actions.cancel}
          className="mb-4 hover:bg-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tenants
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 shadow-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Tenant
            </h1>
            <p className="text-sm text-gray-600">
              Follow the steps to set up a new tenant on your platform
            </p>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-6">
        <Stepper
          steps={vm.steps}
          currentStep={vm.currentStep}
          onStepClick={actions.goToStep}
        />
      </div>

      {/* Step Content */}
      <Card className="mx-auto max-w-3xl border-0 shadow-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={vm.currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {vm.currentStep === 0 && (
              <StepBasics
                formData={vm.formData}
                errors={vm.errors}
                updateFormData={actions.updateFormData}
              />
            )}
            {vm.currentStep === 1 && (
              <StepPlanLimits
                formData={vm.formData}
                updateFormData={actions.updateFormData}
              />
            )}
            {vm.currentStep === 2 && (
              <StepFeatures
                formData={vm.formData}
                updateFormData={actions.updateFormData}
              />
            )}
            {vm.currentStep === 3 && (
              <StepOwner
                formData={vm.formData}
                errors={vm.errors}
                updateFormData={actions.updateFormData}
              />
            )}
            {vm.currentStep === 4 && <StepReview formData={vm.formData} />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
          <Button
            variant="outline"
            onClick={actions.prevStep}
            disabled={vm.isFirstStep}
            className="hover:bg-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {vm.isLastStep ? (
            <Button
              onClick={actions.submit}
              className="bg-brand-600 hover:bg-brand-700"
            >
              <Check className="mr-2 h-4 w-4" />
              Create Tenant
            </Button>
          ) : (
            <Button
              onClick={actions.nextStep}
              className="bg-brand-600 hover:bg-brand-700"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

// Step Components
function StepBasics({
  formData,
  errors,
  updateFormData,
}: {
  formData: CreateTenantData;
  errors: Partial<Record<keyof CreateTenantData, string>>;
  updateFormData: (updates: Partial<CreateTenantData>) => void;
}) {
  return (
    <>
      <CardHeader className="space-y-1 pb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
            <Building2 className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <CardTitle className="text-xl dark:text-white/90">Basic Information</CardTitle>
            <CardDescription className="dark:text-white/90">Enter the company details</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="companyName"
            className="text-sm font-semibold text-gray-700"
          >
            Company Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="companyName"
            placeholder="Acme Corporation"
            value={formData.companyName}
            onChange={(e) => updateFormData({ companyName: e.target.value })}
            className="h-11 border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
          {errors.companyName && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 flex items-center gap-1"
            >
              <span className="text-lg">⚠️</span> {errors.companyName}
            </motion.p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug" className="text-sm font-semibold text-gray-700">
            Tenant Slug <span className="text-red-500">*</span>
          </Label>
          <Input
            id="slug"
            placeholder="acme-corp"
            value={formData.slug}
            onChange={(e) =>
              updateFormData({
                slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
              })
            }
            className="h-11 border-gray-300 font-mono focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Globe className="h-3 w-3" />
            This will be used in the URL: {formData.slug || "your-slug"}
            .yourdomain.com
          </p>
          {errors.slug && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 flex items-center gap-1"
            >
              <span className="text-lg">⚠️</span> {errors.slug}
            </motion.p>
          )}
        </div>
      </CardContent>
    </>
  );
}

function StepPlanLimits({
  formData,
  updateFormData,
}: {
  formData: CreateTenantData;
  updateFormData: (updates: Partial<CreateTenantData>) => void;
}) {
  const plans: {
    value: TenantPlan;
    label: string;
    limits: { users: number; products: number; orders: number };
    icon: React.ReactNode;
    color: string;
    description: string;
  }[] = [
      {
        value: "starter",
        label: "Starter",
        limits: { users: 1, products: 20, orders: 100 },
        icon: <Sparkles className="h-5 w-5" />,
        color: "success-600",
        description: "For small businesses getting started",
      },
      {
        value: "enterprise",
        label: "Enterprise",
        limits: { users: 999999, products: 999999, orders: 999999 },
        icon: <Building2 className="h-5 w-5" />,
        color: "brand-600",
        description: "Unlimited access with full control",
      },
    ];

  const handlePlanChange = (plan: TenantPlan) => {
    const selectedPlan = plans.find((p) => p.value === plan);
    if (selectedPlan) {
      updateFormData({
        plan,
        maxUsers: selectedPlan.limits.users,
        maxProducts: selectedPlan.limits.products,
        maxOrders: selectedPlan.limits.orders,
      });
    }
  };

  return (
    <>
      <CardHeader className="space-y-1 pb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
            <Package className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <CardTitle className="text-xl">Plan & Limits</CardTitle>
            <CardDescription>
              Choose a plan and set resource limits
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-gray-700">
            Select Plan
          </Label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {plans.map((plan) => (
              <motion.button
                key={plan.value}
                type="button"
                onClick={() => handlePlanChange(plan.value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all ${formData.plan === plan.value
                  ? "border-brand-500 bg-brand-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-brand-300 hover:shadow-sm"
                  }`}
              >
                <div
                  className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-${plan.color} text-white shadow-sm`}
                >
                  {plan.icon}
                </div>
                <p className="text-base font-bold text-gray-900">
                  {plan.label}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Up to {plan.limits.users} users
                </p>
                {formData.plan === plan.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-3 top-3"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h4 className="mb-3 text-sm font-semibold text-gray-700">
            Customize Limits
          </h4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="maxUsers" className="text-xs text-gray-600">
                Max Users
              </Label>
              <Input
                id="maxUsers"
                type="number"
                value={formData.maxUsers}
                onChange={(e) =>
                  updateFormData({ maxUsers: parseInt(e.target.value) || 0 })
                }
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxProducts" className="text-xs text-gray-600">
                Max Products
              </Label>
              <Input
                id="maxProducts"
                type="number"
                value={formData.maxProducts}
                onChange={(e) =>
                  updateFormData({ maxProducts: parseInt(e.target.value) || 0 })
                }
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxOrders" className="text-xs text-gray-600">
                Max Orders
              </Label>
              <Input
                id="maxOrders"
                type="number"
                value={formData.maxOrders}
                onChange={(e) =>
                  updateFormData({ maxOrders: parseInt(e.target.value) || 0 })
                }
                className="h-10"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
}

function StepFeatures({
  formData,
  updateFormData,
}: {
  formData: CreateTenantData;
  updateFormData: (updates: Partial<CreateTenantData>) => void;
}) {
  const updateFeature = (
    key: keyof CreateTenantData["features"],
    value: boolean,
  ) => {
    updateFormData({
      features: { ...formData.features, [key]: value },
    });
  };

  const features = [
    {
      key: "posEnabled" as const,
      title: "Point of Sale (POS)",
      description: "Enable cash register and sales functionality",
      icon: <ShoppingCart className="h-5 w-5" />,
      color: "brand-600",
    },
    {
      key: "reportsEnabled" as const,
      title: "Reports & Analytics",
      description: "Enable advanced reporting and analytics",
      icon: <Package className="h-5 w-5" />,
      color: "success-600",
    },
    {
      key: "apiAccessEnabled" as const,
      title: "API Access",
      description: "Enable REST API access",
      icon: <Globe className="h-5 w-5" />,
      color: "warning-600",
    },
  ];

  return (
    <>
      <CardHeader className="space-y-1 pb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
            <Sparkles className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <CardTitle className="text-xl">Features</CardTitle>
            <CardDescription>
              Enable additional features for this tenant
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {features.map((feature) => (
          <motion.div
            key={feature.key}
            whileHover={{ scale: 1.01 }}
            className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all ${formData.features[feature.key]
              ? "border-brand-500 bg-brand-50 shadow-sm"
              : "border-gray-200 bg-white hover:border-gray-300"
              }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${feature.color} text-white shadow-sm`}
              >
                {feature.icon}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{feature.title}</p>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
            <Switch
              checked={formData.features[feature.key]}
              onCheckedChange={(checked) => updateFeature(feature.key, checked)}
            />
          </motion.div>
        ))}
      </CardContent>
    </>
  );
}

function StepOwner({
  formData,
  errors,
  updateFormData,
}: {
  formData: CreateTenantData;
  errors: Partial<Record<keyof CreateTenantData, string>>;
  updateFormData: (updates: Partial<CreateTenantData>) => void;
}) {
  return (
    <>
      <CardHeader className="space-y-1 pb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50">
            <Users className="h-5 w-5 text-success-600" />
          </div>
          <div>
            <CardTitle className="text-xl">Owner Setup</CardTitle>
            <CardDescription>
              Optionally create an owner user account
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-xl border-2 border-gray-200 bg-white p-4">
          <div className="space-y-0.5">
            <p className="font-semibold text-gray-900">Create owner account</p>
            <p className="text-sm text-gray-600">
              Set up an initial admin user for this tenant
            </p>
          </div>
          <Switch
            checked={formData.createOwner}
            onCheckedChange={(checked) =>
              updateFormData({ createOwner: checked })
            }
          />
        </div>

        <AnimatePresence>
          {formData.createOwner && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 overflow-hidden rounded-xl border border-brand-200 bg-brand-50/50 p-4"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="ownerName"
                  className="text-sm font-semibold text-gray-700"
                >
                  Owner Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ownerName"
                  placeholder="John Doe"
                  value={formData.ownerName}
                  onChange={(e) =>
                    updateFormData({ ownerName: e.target.value })
                  }
                  className="h-11 border-gray-300 bg-white"
                />
                {errors.ownerName && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 flex items-center gap-1"
                  >
                    <span className="text-lg">⚠️</span> {errors.ownerName}
                  </motion.p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="ownerEmail"
                  className="text-sm font-semibold text-gray-700"
                >
                  Owner Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.ownerEmail}
                  onChange={(e) =>
                    updateFormData({ ownerEmail: e.target.value })
                  }
                  className="h-11 border-gray-300 bg-white"
                />
                {errors.ownerEmail && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 flex items-center gap-1"
                  >
                    <span className="text-lg">⚠️</span> {errors.ownerEmail}
                  </motion.p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="ownerPassword"
                  className="text-sm font-semibold text-gray-700"
                >
                  Owner Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ownerPassword"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={formData.ownerPassword}
                  onChange={(e) =>
                    updateFormData({ ownerPassword: e.target.value })
                  }
                  className="h-11 border-gray-300 bg-white"
                />
                <p className="text-xs text-gray-500">
                  This password will be used by the owner to login
                </p>
                {errors.ownerPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 flex items-center gap-1"
                  >
                    <span className="text-lg">⚠️</span> {errors.ownerPassword}
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </>
  );
}

function StepReview({ formData }: { formData: CreateTenantData }) {
  return (
    <>
      <CardHeader className="space-y-1 pb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
            <Check className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <CardTitle className="text-xl">Review & Confirm</CardTitle>
            <CardDescription>
              Review the tenant details before creating
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Company Info */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <h4 className="text-base font-semibold text-gray-900">
              Company Info
            </h4>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Company Name:</dt>
              <dd className="font-medium text-gray-900">
                {formData.companyName}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Slug:</dt>
              <dd className="font-mono text-gray-900">{formData.slug}</dd>
            </div>
          </dl>
        </div>

        {/* Plan & Limits */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
              <Package className="h-5 w-5 text-white" />
            </div>
            <h4 className="text-base font-semibold text-gray-900">
              Plan & Limits
            </h4>
          </div>
          <div className="mb-3">
            <Badge className="bg-brand-600 text-white hover:bg-brand-600">
              {formatPlanName(formData.plan)}
            </Badge>
          </div>
          <dl className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center rounded-lg bg-white p-3 shadow-sm">
              <dt className="text-gray-600">Max Users</dt>
              <dd className="mt-1 text-xl font-bold text-brand-600">
                {formData.maxUsers}
              </dd>
            </div>
            <div className="text-center rounded-lg bg-white p-3 shadow-sm">
              <dt className="text-gray-600">Max Products</dt>
              <dd className="mt-1 text-xl font-bold text-brand-600">
                {formData.maxProducts}
              </dd>
            </div>
            <div className="text-center rounded-lg bg-white p-3 shadow-sm">
              <dt className="text-gray-600">Max Orders</dt>
              <dd className="mt-1 text-xl font-bold text-brand-600">
                {formData.maxOrders}
              </dd>
            </div>
          </dl>
        </div>

        {/* Features */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h4 className="text-base font-semibold text-gray-900">Features</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.features.posEnabled && (
              <Badge className="bg-brand-100 text-brand-700 hover:bg-brand-100">
                POS Enabled
              </Badge>
            )}
            {formData.features.reportsEnabled && (
              <Badge className="bg-success-100 text-success-700 hover:bg-success-100">
                Reports Enabled
              </Badge>
            )}
            {formData.features.apiAccessEnabled && (
              <Badge className="bg-warning-100 text-warning-700 hover:bg-warning-100">
                API Access
              </Badge>
            )}
            {!formData.features.posEnabled &&
              !formData.features.reportsEnabled &&
              !formData.features.apiAccessEnabled && (
                <span className="text-sm text-gray-500">
                  No additional features enabled
                </span>
              )}
          </div>
        </div>

        {/* Owner */}
        {formData.createOwner && (
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-600">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-base font-semibold text-gray-900">
                Owner Account
              </h4>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Name:</dt>
                <dd className="font-medium text-gray-900">
                  {formData.ownerName}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Email:</dt>
                <dd className="text-gray-900">{formData.ownerEmail}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Password:</dt>
                <dd className="text-gray-900 font-mono">••••••••</dd>
              </div>
            </dl>
          </div>
        )}
      </CardContent>
    </>
  );
}
