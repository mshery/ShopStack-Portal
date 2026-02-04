import { QueryClient } from "@tanstack/react-query";
import { productKeys, type ProductFilters } from "../api/queries";

/**
 * Refetches the products list query for a specific page/limit.
 * Use this after CRUD operations to refresh the correct paginated list.
 */
export async function refetchProductListPage(
  queryClient: QueryClient,
  params: ProductFilters,
) {
  await queryClient.refetchQueries({
    queryKey: productKeys.list(params),
    exact: true,
  });
}
