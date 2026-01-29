import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "@/modules/auth";
import { useTenantStatusSync } from "@/modules/tenant";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { useSidebar } from "@/app/context/SidebarContext";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { currentUser } = useAuthStore();

  // Enable cross-tab tenant status synchronization
  useTenantStatusSync();

  // Note: Status validation should be done via API/token validation, not local store checks
  // The old check against platformUsers/tenantUsers arrays was removed because those arrays
  // are empty when using real API authentication (not mock data).

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
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
