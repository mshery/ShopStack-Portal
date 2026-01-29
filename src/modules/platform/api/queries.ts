import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "./platformApi";

// ============ QUERY KEYS ============
export const platformKeys = {
  all: ["platform"] as const,
  settings: () => [...platformKeys.all, "settings"] as const,
  plans: () => [...platformKeys.all, "plans"] as const,
  users: () => [...platformKeys.all, "users"] as const,
  tenants: () => [...platformKeys.all, "tenants"] as const,
  tenant: (id: string) => [...platformKeys.tenants(), id] as const,
  activityLogs: (params?: { page?: number }) =>
    [...platformKeys.all, "logs", params] as const,
};

// ============ TENANTS ============
/**
 * Fetch tenants and sync to existing tenants.store.ts
 *
 * PREVENTS RE-RENDERS:
 * - staleTime prevents duplicate fetches
 * - Data is returned directly for components to consume
 */
export function useTenantsFetch() {
  return useQuery({
    queryKey: platformKeys.tenants(),
    queryFn: platformApi.getTenants,
    staleTime: 5 * 60 * 1000, // 5 minutes - no refetch if fresh
  });
}

export function useTenantFetch(id: string) {
  return useQuery({
    queryKey: platformKeys.tenant(id),
    queryFn: () => platformApi.getTenant(id),
    enabled: !!id,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: platformApi.createTenant,
    onSuccess: () => {
      // Invalidate query to refetch fresh list
      queryClient.invalidateQueries({ queryKey: platformKeys.tenants() });
    },
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof platformApi.updateTenant>[1];
    }) => platformApi.updateTenant(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: platformKeys.tenant(id) });
      queryClient.invalidateQueries({ queryKey: platformKeys.tenants() });
    },
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => platformApi.suspendTenant(id), // or delete endpoint
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.tenants() });
    },
  });
}

export function useImpersonateTenant() {
  return useMutation({
    mutationFn: platformApi.impersonateTenant,
  });
}

// ============ SETTINGS ============
export function useSettingsFetch() {
  return useQuery({
    queryKey: platformKeys.settings(),
    queryFn: platformApi.getSettings,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: platformApi.updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(platformKeys.settings(), data);
    },
  });
}

// ============ PLANS ============
export function usePlansFetch() {
  return useQuery({
    queryKey: platformKeys.plans(),
    queryFn: platformApi.getPlans,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: platformApi.createPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.plans() });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof platformApi.updatePlan>[1];
    }) => platformApi.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.plans() });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: platformApi.deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.plans() });
    },
  });
}

// ============ USERS ============
export function usePlatformUsersFetch() {
  return useQuery({
    queryKey: platformKeys.users(),
    queryFn: platformApi.getUsers,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: platformApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.users() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof platformApi.updateUser>[1];
    }) => platformApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.users() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: platformApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformKeys.users() });
    },
  });
}

// ============ ACTIVITY LOGS ============
export function useActivityLogsFetch(params?: {
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: platformKeys.activityLogs(params),
    queryFn: () => platformApi.getActivityLogs(params),
    staleTime: 2 * 60 * 1000, // 2 minutes for logs (more dynamic)
  });
}
