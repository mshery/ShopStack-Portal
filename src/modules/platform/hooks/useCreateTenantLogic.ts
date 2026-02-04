import { useState, useCallback, useMemo } from "react";

import { useNavigate } from "react-router-dom";
import { useCreateTenant, usePlansFetch } from "../api/queries";
import { useActivityLogsStore } from "../store/activityLogs.store";
import { useAuthStore } from "@/modules/auth";
import { generateId } from "@/shared/utils/normalize";
import type { TenantFeatures } from "@/shared/types/models";
import toast from "react-hot-toast";
import { refetchTenantListPage } from "../utils/tenantQueriesUtils";
import { useQueryClient } from "@tanstack/react-query";

export interface CreateTenantData {
  // Step 1: Basics
  slug: string;
  companyName: string;

  // Step 2: Plan - now uses actual plan ID from API
  planId: string;
  maxUsers: number;
  maxProducts: number;
  maxOrders: number;

  // Step 3: Features
  features: TenantFeatures;

  // Step 4: Owner (required for tenant creation)
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
}

const initialData: CreateTenantData = {
  slug: "",
  companyName: "",
  planId: "",
  maxUsers: 1,
  maxProducts: 20,
  maxOrders: 100,
  features: {
    posEnabled: false,
    reportsEnabled: false,
    apiAccessEnabled: false,
  },
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
 * useCreateTenantLogic - Create tenant stepper logic hook with TanStack Query
 */
export function useCreateTenantLogic() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addPlatformLog } = useActivityLogsStore();
  const { currentUser } = useAuthStore();
  const createTenantMutation = useCreateTenant();

  // Fetch subscription plans from API
  const { data: plans = [], isLoading: plansLoading } = usePlansFetch();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CreateTenantData>(initialData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateTenantData, string>>
  >({});

  // Derive effective form data with default plan if not selected
  // This avoids setState in effects by computing during render
  const effectiveFormData = useMemo(() => {
    if (plans.length > 0 && !formData.planId) {
      const defaultPlan = plans[0];
      return {
        ...formData,
        planId: defaultPlan.id,
        maxUsers: defaultPlan.limits.maxUsers,
        maxProducts: defaultPlan.limits.maxProducts,
        maxOrders: defaultPlan.limits.maxOrders,
      };
    }
    return formData;
  }, [formData, plans]);

  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: Partial<Record<keyof CreateTenantData, string>> = {};
      const data = effectiveFormData;

      switch (step) {
        case 0: // Basics
          if (!data.slug.trim()) {
            newErrors.slug = "Slug is required";
          } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
            newErrors.slug =
              "Slug must be lowercase letters, numbers, and hyphens only";
          }
          if (!data.companyName.trim()) {
            newErrors.companyName = "Company name is required";
          }
          break;
        case 1: // Plan & Limits
          if (!data.planId) {
            newErrors.planId = "Please select a subscription plan";
          }
          if (data.maxUsers < 1) {
            newErrors.maxUsers = "Must have at least 1 user";
          }
          break;
        case 3: // Owner (required)
          if (!data.ownerName.trim()) {
            newErrors.ownerName = "Owner name is required";
          }
          if (!data.ownerEmail.trim()) {
            newErrors.ownerEmail = "Owner email is required";
          } else if (!/\S+@\S+\.\S+/.test(data.ownerEmail)) {
            newErrors.ownerEmail = "Invalid email format";
          }
          if (!data.ownerPassword.trim()) {
            newErrors.ownerPassword = "Password is required";
          } else if (data.ownerPassword.length < 8) {
            newErrors.ownerPassword = "Password must be at least 8 characters";
          }
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [effectiveFormData],
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

  const submit = useCallback(async () => {
    try {
      // Call real API via TanStack Query mutation
      await createTenantMutation.mutateAsync({
        slug: effectiveFormData.slug,
        companyName: effectiveFormData.companyName,
        planId: effectiveFormData.planId,
        ownerEmail: effectiveFormData.ownerEmail,
        ownerName: effectiveFormData.ownerName,
        ownerPassword: effectiveFormData.ownerPassword,
      });

      // Log activity
      const log = {
        id: generateId("plog"),
        action: "tenant_created",
        actorId: currentUser?.id ?? "unknown",
        targetType: "tenant",
        targetId: "new-tenant",
        details: { companyName: effectiveFormData.companyName },
      };
      addPlatformLog(log);
      // ✅ Refetch only page 1 (where new tenant will appear)
      await refetchTenantListPage(queryClient, { page: 1, limit: 10 });
      toast.success("Tenant created successfully");
      // ✅ Navigate back to page 1 of tenants list
      navigate("/platform/tenants?page=1&limit=10");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create tenant";
      toast.error(message);
      console.error("Failed to create tenant:", error);
    }
  }, [
    effectiveFormData,
    createTenantMutation,
    addPlatformLog,
    currentUser,
    navigate,
    queryClient,
  ]);

  // Find selected plan for display
  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === effectiveFormData.planId),
    [plans, effectiveFormData.planId],
  );

  const vm = useMemo(
    () => ({
      steps: STEPS,
      currentStep,
      formData: effectiveFormData,
      errors,
      isFirstStep: currentStep === 0,
      isLastStep: currentStep === STEPS.length - 1,
      canGoNext: currentStep < STEPS.length - 1,
      isSubmitting: createTenantMutation.isPending,
      // Plans from API
      plans,
      plansLoading,
      selectedPlan,
    }),
    [
      currentStep,
      effectiveFormData,
      errors,
      createTenantMutation.isPending,
      plans,
      plansLoading,
      selectedPlan,
    ],
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
