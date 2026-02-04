/**
 * Tenant Module TanStack Queries
 *
 * TanStack Query hooks for tenant team management and billing.
 * Follows the same patterns as platform/api/queries.ts
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { tenantApi } from "./tenantApi";
import type {
  CreateTeamMemberInput,
  UpdateTeamMemberInput,
  AddPaymentMethodInput,
} from "./tenantApi";

// ============ QUERY KEYS ============
export const tenantKeys = {
  all: ["tenant"] as const,

  // Team members
  teamMembers: () => [...tenantKeys.all, "teamMembers"] as const,
  teamMember: (id: string) => [...tenantKeys.all, "teamMembers", id] as const,

  // Billing
  billing: () => [...tenantKeys.all, "billing"] as const,
  invoices: (params?: { page?: number; limit?: number }) =>
    [...tenantKeys.all, "invoices", params ?? {}] as const,
  invoice: (id: string) => [...tenantKeys.all, "invoices", id] as const,

  // Payment methods
  paymentMethods: () => [...tenantKeys.all, "paymentMethods"] as const,

  // Dashboard
  dashboard: () => [...tenantKeys.all, "dashboard"] as const,
};

// ============ DASHBOARD ============

/**
 * Fetch dashboard stats
 */
export function useDashboardStatsFetch(enabled = true) {
  return useQuery({
    queryKey: tenantKeys.dashboard(),
    queryFn: tenantApi.getDashboardStats,
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });
}

// ============ TEAM MEMBERS ============

/**
 * Fetch all team members for current tenant (paginated)
 */
export function useTeamMembersFetch(
  params: { page: number; limit: number } = { page: 1, limit: 10 },
) {
  return useQuery({
    queryKey: [...tenantKeys.teamMembers(), params], // Include params in key
    queryFn: () => tenantApi.getTeamMembers(params),
    staleTime: 30 * 1000, // 30 seconds
    placeholderData: keepPreviousData,
  });
}

/**
 * Fetch single team member by ID
 */
export function useTeamMemberFetch(id: string, enabled = true) {
  return useQuery({
    queryKey: tenantKeys.teamMember(id),
    queryFn: () => tenantApi.getTeamMember(id),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create new team member (cashier only)
 */
export function useCreateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeamMemberInput) =>
      tenantApi.createTeamMember(data),
    onSuccess: async () => {
      // Invalidate team members list
      await queryClient.invalidateQueries({
        queryKey: tenantKeys.teamMembers(),
      });
    },
  });
}

/**
 * Update team member
 */
export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamMemberInput }) =>
      tenantApi.updateTeamMember(id, data),
    onSuccess: async (_, { id }) => {
      // Invalidate both list and detail
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: tenantKeys.teamMembers() }),
        queryClient.invalidateQueries({ queryKey: tenantKeys.teamMember(id) }),
      ]);
    },
  });
}

/**
 * Delete team member
 */
export function useDeleteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tenantApi.deleteTeamMember(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: tenantKeys.teamMembers(),
      });
    },
  });
}

// ============ BILLING ============

/**
 * Fetch billing info
 */
export function useBillingFetch(enabled = true) {
  return useQuery({
    queryKey: tenantKeys.billing(),
    queryFn: tenantApi.getBilling,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Update billing cycle
 */
export function useUpdateBillingCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (billingCycle: "monthly" | "yearly") =>
      tenantApi.updateBillingCycle(billingCycle),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: tenantKeys.billing() });
    },
  });
}

// ============ INVOICES ============

/**
 * Fetch invoices with pagination
 */
export function useInvoicesFetch(
  params: { page: number; limit: number } = { page: 1, limit: 10 },
) {
  return useQuery({
    queryKey: tenantKeys.invoices(params),
    queryFn: () => tenantApi.getInvoices(params),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

/**
 * Fetch single invoice by ID
 */
export function useInvoiceFetch(id: string, enabled = true) {
  return useQuery({
    queryKey: tenantKeys.invoice(id),
    queryFn: () => tenantApi.getInvoice(id),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

// ============ PAYMENT METHODS ============

/**
 * Fetch payment methods
 */
export function usePaymentMethodsFetch(enabled = true) {
  return useQuery({
    queryKey: tenantKeys.paymentMethods(),
    queryFn: tenantApi.getPaymentMethods,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Add payment method
 */
export function useAddPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddPaymentMethodInput) =>
      tenantApi.addPaymentMethod(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: tenantKeys.paymentMethods(),
      });
    },
  });
}

/**
 * Set default payment method
 */
export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tenantApi.setDefaultPaymentMethod(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: tenantKeys.paymentMethods(),
      });
    },
  });
}

/**
 * Delete payment method
 */
export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tenantApi.deletePaymentMethod(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: tenantKeys.paymentMethods(),
      });
    },
  });
}
