import { useEffect } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/modules/auth";
import { useUsersStore } from "@/modules/tenant";
import { useTenantsStore } from "@/modules/platform";
import { useTenantStatusSync } from "@/modules/tenant";
import type { TenantUser } from "@/shared/types/models";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { useSidebar } from "@/app/context/SidebarContext";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { currentUser, logout, userType } = useAuthStore();
  const { platformUsers, tenantUsers } = useUsersStore();
  const { tenants } = useTenantsStore();
  const navigate = useNavigate();

  // Enable cross-tab tenant status synchronization
  useTenantStatusSync();

  // Guard: Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser || !userType) return;

    // Check platform user status
    if (userType === "platform") {
      const freshUser = platformUsers.find((u) => u.id === currentUser.id);
      if (!freshUser || freshUser.status !== "active") {
        logout();
        navigate("/login");
      }
    }

    // Check tenant user and tenant status
    if (userType === "tenant") {
      const freshUser = tenantUsers.find((u) => u.id === currentUser.id);
      const tenantId =
        userType === "tenant" ? (currentUser as TenantUser).tenant_id : "";
      const tenant = tenants.find((t) => t.id === tenantId);

      const isUserInactive = !freshUser || freshUser.status !== "active";
      const isTenantInactive = !tenant || tenant.status !== "active";

      if (isUserInactive || isTenantInactive) {
        logout();
        navigate("/login");
      }
    }
  }, [
    currentUser,
    userType,
    platformUsers,
    tenantUsers,
    tenants,
    logout,
    navigate,
  ]);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
          } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return <LayoutContent />;
};

export default AppLayout;
