import { QueryClient } from "@tanstack/react-query";
import { platformKeys } from "../api/queries";

/**
 * Refetches the tenants list query for a specific page/limit.
 * Use this after CRUD operations to refresh the correct paginated list.
 */
export async function refetchTenantListPage(
  queryClient: QueryClient,
  params: { page: number; limit: number; search?: string },
) {
  await queryClient.refetchQueries({
    queryKey: platformKeys.tenantsList({
      page: params.page,
      limit: params.limit,
      ...(params.search ? { search: params.search } : {}),
    }),
    exact: true,
  });
}
