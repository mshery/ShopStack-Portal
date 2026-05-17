import { beforeEach, describe, expect, test } from "vitest";
import { useAuthStore } from "./auth.store";

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      currentUser: null,
      currentTenant: null,
      userType: null,
      activeTenantId: null,
      isImpersonating: false,
      originalPlatformUser: null,
    });
    localStorage.clear();
  });

  test("login populates the in-memory store and does not write to localStorage", () => {
    useAuthStore.getState().login({
      user: {
        id: "u1",
        email: "u@example.com",
        password: "",
        name: "User",
        role: "owner",
        status: "active",
        phone: null,
        avatarUrl: null,
        tenant_id: "t1",
        createdBy: "self",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
      userType: "tenant",
      tenantId: "t1",
      tenant: null,
    });

    expect(useAuthStore.getState().currentUser?.email).toBe("u@example.com");
    expect(useAuthStore.getState().activeTenantId).toBe("t1");
    // security.md rule 3: no auth data persisted to localStorage.
    expect(localStorage.length).toBe(0);
  });

  test("logout returns the store to its initial state", () => {
    useAuthStore.setState({
      currentUser: {
        id: "u1",
        email: "u@example.com",
        password: "",
        name: "User",
        role: "owner",
        status: "active",
        phone: null,
        avatarUrl: null,
        tenant_id: "t1",
        createdBy: "self",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
      activeTenantId: "t1",
      userType: "tenant",
    });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().currentUser).toBeNull();
    expect(useAuthStore.getState().userType).toBeNull();
    expect(useAuthStore.getState().activeTenantId).toBeNull();
  });
});
