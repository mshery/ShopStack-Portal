/**
 * Tenant normalizers — zod schemas for the platform tenants API.
 *
 * Parses raw `/api/platform/tenants*` responses into safe, typed domain
 * objects. Per `.claude/rules/service-patterns.md`, every API response
 * goes through one of these schemas before reaching the rest of the app.
 */

import { z } from "zod";

export const TenantStatusSchema = z.enum(["active", "inactive", "suspended"]);
export type TenantApiStatus = z.infer<typeof TenantStatusSchema>;

const TenantCountsSchema = z
  .object({
    users: z.number().int().nonnegative().default(0),
    products: z.number().int().nonnegative().default(0),
    sales: z.number().int().nonnegative().default(0),
    customers: z.number().int().nonnegative().default(0),
  })
  .default({ users: 0, products: 0, sales: 0, customers: 0 });

/**
 * Mirrors the backend `ApiTenant` shape. Arrays default to `[]` and
 * counters default to `0` so the UI never has to branch on missing
 * fields (see coding.md rules 4 and 5).
 */
export const TenantSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  companyName: z.string().min(1),
  status: TenantStatusSchema,
  planId: z.string().min(1),
  invoices: z.array(z.unknown()).default([]),
  paymentMethods: z.array(z.unknown()).default([]),
  _count: TenantCountsSchema,
  createdAt: z.string(),
});

export type Tenant = z.infer<typeof TenantSchema>;

export const TenantListSchema = z.object({
  items: z.array(TenantSchema).default([]),
  pagination: z
    .object({
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).default(10),
      total: z.number().int().nonnegative().default(0),
      totalPages: z.number().int().nonnegative().default(0),
    })
    .default({ page: 1, limit: 10, total: 0, totalPages: 0 }),
});

export type TenantList = z.infer<typeof TenantListSchema>;

export const ImpersonationResultSchema = z.object({
  token: z.string().min(1),
  tenant: z.object({
    id: z.string().min(1),
    slug: z.string().min(1),
    companyName: z.string().min(1),
  }),
  user: z.object({
    id: z.string().min(1),
    email: z.email(),
    name: z.string().min(1),
    role: z.string().min(1),
  }),
});

export type ImpersonationResult = z.infer<typeof ImpersonationResultSchema>;

/**
 * Envelope shared by every ShopStack-Server response (see
 * `shared/types/api.ts#ApiResponse`). Generic factory so each endpoint
 * gets a tightly-typed parser.
 */
function envelope<T extends z.ZodTypeAny>(payload: T) {
  return z.object({
    success: z.boolean().optional(),
    message: z.string().optional(),
    data: payload,
    timestamp: z.string().optional(),
  });
}

export const TenantResponseSchema = envelope(TenantSchema);
export const TenantListResponseSchema = envelope(TenantListSchema);
export const ImpersonationResponseSchema = envelope(ImpersonationResultSchema);
