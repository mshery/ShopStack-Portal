import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTenantsStore } from "@/stores/tenants.store";
import { useUsersStore } from "@/stores/users.store";
import { useActivityLogsStore } from "@/stores/activityLogs.store";
import { useAuthStore } from "@/stores/auth.store";
import { generateId } from "@/utils/normalize";
import type { Tenant, TenantUser, TenantPlan, TenantFeatures } from "@/types";

export interface CreateTenantData {
  // Step 1: Basics
  slug: string;
  companyName: string;

  // Step 2: Plan & Limits
  plan: TenantPlan;
  maxUsers: number;
  maxProducts: number;
  maxOrders: number;

  // Step 3: Features
  features: TenantFeatures;

  // Step 4: Owner (optional)
  createOwner: boolean;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
}

const initialData: CreateTenantData = {
  slug: "",
  companyName: "",
  plan: "starter",
  maxUsers: 1,
  maxProducts: 20,
  maxOrders: 100,
  features: {
    posEnabled: false,
    reportsEnabled: false,
    apiAccessEnabled: false,
  },
  createOwner: false,
  ownerName: "",
  ownerEmail: "",
  ownerPassword: "",
};

const STEPS = [
  { id: "basics", title: "Basics" },
  { id: "plan", title: "Plan & Limits" },
  { id: "features", title: "Features" },
  { id: "owner", title: "Owner Setup" },
  { id: "review", title: "Review" },
];

/**
 * useCreateTenantLogic - Create tenant stepper logic hook
 */
export function useCreateTenantLogic() {
  const navigate = useNavigate();
  const { addTenant } = useTenantsStore();
  const { addTenantUser } = useUsersStore();
  const { addPlatformLog } = useActivityLogsStore();
  const { currentUser } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CreateTenantData>(initialData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateTenantData, string>>
  >({});

  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: Partial<Record<keyof CreateTenantData, string>> = {};

      switch (step) {
        case 0: // Basics
          if (!formData.slug.trim()) {
            newErrors.slug = "Slug is required";
          } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
            newErrors.slug =
              "Slug must be lowercase letters, numbers, and hyphens only";
          }
          if (!formData.companyName.trim()) {
            newErrors.companyName = "Company name is required";
          }
          break;
        case 1: // Plan & Limits
          if (formData.maxUsers < 1) {
            newErrors.maxUsers = "Must have at least 1 user";
          }
          break;
        case 3: // Owner
          if (formData.createOwner) {
            if (!formData.ownerName.trim()) {
              newErrors.ownerName = "Owner name is required";
            }
            if (!formData.ownerEmail.trim()) {
              newErrors.ownerEmail = "Owner email is required";
            } else if (!/\S+@\S+\.\S+/.test(formData.ownerEmail)) {
              newErrors.ownerEmail = "Invalid email format";
            }
            if (!formData.ownerPassword.trim()) {
              newErrors.ownerPassword = "Password is required";
            } else if (formData.ownerPassword.length < 8) {
              newErrors.ownerPassword =
                "Password must be at least 8 characters";
            }
          }
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData],
  );

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      // Only allow going back or to visited steps
      if (step <= currentStep) {
        setCurrentStep(step);
      }
    },
    [currentStep],
  );

  const updateFormData = useCallback((updates: Partial<CreateTenantData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const updatedKeys = Object.keys(updates) as (keyof CreateTenantData)[];
    setErrors((prev) => {
      const newErrors = { ...prev };
      updatedKeys.forEach((key) => delete newErrors[key]);
      return newErrors;
    });
  }, []);

  const submit = useCallback(() => {
    const tenantId = generateId("tenant");
    const now = new Date().toISOString();

    // Create tenant
    const newTenant: Tenant = {
      id: tenantId,
      slug: formData.slug,
      companyName: formData.companyName,
      plan: formData.plan,
      status: "active",
      maxUsers: formData.maxUsers,
      maxProducts: formData.maxProducts,
      maxOrders: formData.maxOrders,
      features: formData.features,
      settings: {
        taxRate: 0.1,
        currency: "USD",
        currencySymbol: "$",
        timezone: "America/New_York",
        businessName: formData.companyName,
        businessAddress: "",
        businessPhone: "",
      },
      createdAt: now,
      updatedAt: now,
    };
    addTenant(newTenant);

    // Create owner if specified
    if (formData.createOwner) {
      const ownerId = generateId("user");
      const newOwner: TenantUser = {
        id: ownerId,
        tenant_id: tenantId,
        email: formData.ownerEmail,
        password: formData.ownerPassword,
        name: formData.ownerName,
        role: "owner",
        status: "active",
        phone: null,
        avatarUrl: null,
        createdBy: "platform",
        createdAt: now,
        updatedAt: now,
      };
      addTenantUser(newOwner);
    }

    // Log activity
    const log = {
      id: generateId("plog"),
      action: "tenant_created",
      actorId: currentUser?.id ?? "unknown",
      targetType: "tenant",
      targetId: tenantId,
      details: { companyName: formData.companyName },
    };
    addPlatformLog(log);

    // Navigate to tenants list
    navigate("/platform/tenants");
  }, [
    formData,
    addTenant,
    addTenantUser,
    addPlatformLog,
    currentUser,
    navigate,
  ]);

  const vm = useMemo(
    () => ({
      steps: STEPS,
      currentStep,
      formData,
      errors,
      isFirstStep: currentStep === 0,
      isLastStep: currentStep === STEPS.length - 1,
      canGoNext: currentStep < STEPS.length - 1,
    }),
    [currentStep, formData, errors],
  );

  const actions = useMemo(
    () => ({
      nextStep,
      prevStep,
      goToStep,
      updateFormData,
      submit,
      cancel: () => navigate("/platform/tenants"),
    }),
    [nextStep, prevStep, goToStep, updateFormData, submit, navigate],
  );

  return { vm, actions };
}
