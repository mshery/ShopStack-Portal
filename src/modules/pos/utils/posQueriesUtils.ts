/**
 * POS Query Utilities
 *
 * Cache invalidation utilities for POS module.
 */

import { QueryClient } from "@tanstack/react-query";
import { posKeys } from "../api/queries";
import type { SalesFilters, RefundsFilters } from "../api/posApi";

export async function refetchSalesList(
  queryClient: QueryClient,
  params: SalesFilters = { page: 1, limit: 10 },
) {
  await queryClient.refetchQueries({
    queryKey: posKeys.salesList(params),
    exact: true,
  });
}

export async function refetchRefundsList(
  queryClient: QueryClient,
  params: RefundsFilters = { page: 1, limit: 10 },
) {
  await queryClient.refetchQueries({
    queryKey: posKeys.refundsList(params),
    exact: true,
  });
}

export async function refetchHeldOrdersList(queryClient: QueryClient) {
  await queryClient.refetchQueries({
    queryKey: posKeys.heldOrdersList(),
    exact: true,
  });
}

export async function invalidateAllPOSData(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: posKeys.all });
}
