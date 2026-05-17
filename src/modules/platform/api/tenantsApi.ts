/**
 * Platform Tenants API
 *
 * Real `/api/platform/tenants*` HTTP wrappers. Every response is parsed
 * with zod before leaving this file so downstream code never sees a
 * raw axios payload. See `.claude/rules/service-patterns.md`.
 */

import { httpClient } from "@/core/api/httpClient";
import { endpoints } from "@/core/config/endpoints";
import {
  ImpersonationResponseSchema,
  TenantListResponseSchema,
  TenantResponseSchema,
  type ImpersonationResult,
  type Tenant,
  type TenantList,
} from "../normalizers/tenants.normalizers";

export interface ListTenantsParams {
  page?: number;
  limit?: number;
}

export interface CreateTenantPayload {
  slug: string;
  companyName: string;
  planId: string;
  ownerEmail: string;
  ownerName: string;
  ownerPassword: string;
}

export type UpdateTenantPayload = Partial<{
  slug: string;
  companyName: string;
  status: Tenant["status"];
  planId: string;
}>;

export async function listTenants(
  params: ListTenantsParams = {},
): Promise<TenantList> {
  const res = await httpClient.get<unknown>(endpoints.platform.tenants.list, {
    params,
  });
  return TenantListResponseSchema.parse(res.data).data;
}

export async function getTenant(id: string): Promise<Tenant> {
  const res = await httpClient.get<unknown>(
    endpoints.platform.tenants.byId(encodeURIComponent(id)),
  );
  return TenantResponseSchema.parse(res.data).data;
}

export async function createTenant(
  data: CreateTenantPayload,
): Promise<Tenant> {
  const res = await httpClient.post<unknown>(
    endpoints.platform.tenants.list,
    data,
  );
  return TenantResponseSchema.parse(res.data).data;
}

export async function updateTenant(
  id: string,
  data: UpdateTenantPayload,
): Promise<Tenant> {
  const res = await httpClient.put<unknown>(
    endpoints.platform.tenants.byId(encodeURIComponent(id)),
    data,
  );
  return TenantResponseSchema.parse(res.data).data;
}

export async function suspendTenant(id: string): Promise<Tenant> {
  const res = await httpClient.post<unknown>(
    endpoints.platform.tenants.suspend(encodeURIComponent(id)),
  );
  return TenantResponseSchema.parse(res.data).data;
}

export async function impersonateTenant(
  id: string,
): Promise<ImpersonationResult> {
  const res = await httpClient.post<unknown>(
    endpoints.platform.tenants.impersonate(encodeURIComponent(id)),
  );
  return ImpersonationResponseSchema.parse(res.data).data;
}
