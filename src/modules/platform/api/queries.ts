import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { platformApi } from "./platformApi";

// ============ QUERY KEYS ============
export const platformKeys = {
  all: ["platform"] as const,
  settings: () => [...platformKeys.all, "settings"] as const,
  plans: () => [...platformKeys.all, "plans"] as const,
  users: () => [...platformKeys.all, "users"] as const,
  // Flattened for safety and clarity
  tenantsList: (params?: { page?: number; limit?: number }) =>
    [...platformKeys.all, "tenants", "list", params ?? {}] as const,
  tenantDetail: (id: string) =>
    [...platformKeys.all, "tenants", "detail", id] as const,
  activityLogs: (params?: { page?: number }) =>
    [...platformKeys.all, "logs", params] as const,
  stats: () => [...platformKeys.all, "stats"] as const,
};

// ============ TENANTS ============
/**
 * Fetch tenants with pagination
 *
 * Uses placeholderData: keepPreviousData for smooth page transitions
 */
export function useTenantsFetch(
  params: { page: number; limit: number } = { page: 1, limit: 10 },
) {
  return useQuery({
    queryKey: platformKeys.tenantsList({
      page: params.page,
      limit: params.limit,
    }),
    queryFn: () =>
      platformApi.getTenants({ page: params.page, limit: params.limit }),
    staleTime: 0, // List should always be fresh on mount/refetch to avoid stale data
    placeholderData: keepPreviousData,
  });
}

export function useTenantFetch(id: string, enabled = true) {
  return useQuery({
    queryKey: platformKeys.tenantDetail(id),
    queryFn: () => platformApi.getTenant(id),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
    retry: false, // Don't retry on 404s (e.g. after delete)
    refetchOnWindowFocus: false,
  });
}

export function useTenantBillingFetch(id: string, enabled = true) {
  return useQuery({
    queryKey: [...platformKeys.tenantDetail(id), "billing"],
    queryFn: () => platformApi.getTenantBilling(id),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useCreateTenant() {
  return useMutation({
    mutationFn: platformApi.createTenant,
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
    onSuccess: async (_, { id }) => {
      // Invalidate detail query - list refetch handled by calling hook
      await queryClient.refetchQueries({
        queryKey: platformKeys.tenantDetail(id),
      });
    },
  });
}

export function useDeleteTenant() {
  return useMutation({
    mutationFn: (id: string) => platformApi.deleteTenant(id),
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
    refetchOnWindowFocus: false,
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
    refetchOnWindowFocus: false,
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
    refetchOnWindowFocus: false,
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

// ============ DASHBOARD STATS ============
export function useDashboardStatsFetch() {
  return useQuery({
    queryKey: platformKeys.stats(),
    queryFn: platformApi.getDashboardStats,
    staleTime: 5 * 60 * 1000,
  });
}
