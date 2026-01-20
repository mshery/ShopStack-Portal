import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../auth.store";
import type { TenantUser, PlatformUser } from "@/types";

describe("Auth Store", () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      currentUser: null,
      userType: null,
      activeTenantId: null,
    });
  });

  describe("setCurrentUser", () => {
    it("should set current user", () => {
      const { setCurrentUser } = useAuthStore.getState();
      const mockUser: TenantUser = {
        id: "user-1",
        tenant_id: "tenant-1",
        email: "test@example.com",
        password: "hashedpassword123",
        name: "Test User",
        role: "owner",
        status: "active",
        phone: null,
        avatarUrl: null,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      };

      setCurrentUser(mockUser);

      expect(useAuthStore.getState().currentUser).toEqual(mockUser);
    });

    it("should set null user", () => {
      const { setCurrentUser } = useAuthStore.getState();

      setCurrentUser(null);

      expect(useAuthStore.getState().currentUser).toBeNull();
    });
  });

  describe("setUserType", () => {
    it("should set user type to platform", () => {
      const { setUserType } = useAuthStore.getState();

      setUserType("platform");

      expect(useAuthStore.getState().userType).toBe("platform");
    });

    it("should set user type to tenant", () => {
      const { setUserType } = useAuthStore.getState();

      setUserType("tenant");

      expect(useAuthStore.getState().userType).toBe("tenant");
    });
  });

  describe("setActiveTenantId", () => {
    it("should set active tenant ID", () => {
      const { setActiveTenantId } = useAuthStore.getState();

      setActiveTenantId("tenant-1");

      expect(useAuthStore.getState().activeTenantId).toBe("tenant-1");
    });

    it("should set active tenant ID to null", () => {
      const { setActiveTenantId } = useAuthStore.getState();
      setActiveTenantId("tenant-1");

      setActiveTenantId(null);

      expect(useAuthStore.getState().activeTenantId).toBeNull();
    });
  });

  describe("logout", () => {
    it("should clear all auth state", () => {
      const { setCurrentUser, setUserType, setActiveTenantId, logout } =
        useAuthStore.getState();

      // Set some state
      const mockUser: PlatformUser = {
        id: "admin-1",
        email: "admin@example.com",
        password: "hashedpassword123",
        name: "Admin User",
        role: "super_admin",
        status: "active",
        phone: null,
        avatarUrl: null,
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      };
      setCurrentUser(mockUser);
      setUserType("platform");
      setActiveTenantId("tenant-1");

      // Logout
      logout();

      const state = useAuthStore.getState();
      expect(state.currentUser).toBeNull();
      expect(state.userType).toBeNull();
      expect(state.activeTenantId).toBeNull();
    });
  });
});
