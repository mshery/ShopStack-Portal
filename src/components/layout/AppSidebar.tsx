import { useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  GridIcon,
  ShoppingCartIcon,
  ReceiptIcon,
  BoxCubeIcon,
  ClipboardListIcon,
  DollarSignIcon,
  ShoppingBagIcon,
  BuildingIcon,
  UsersIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
} from "../ui/Icons";
import { useSidebar } from "../../app/context/SidebarContext";
import { useAuthStore } from "../../stores/auth.store";
import { usePermissions } from "../../hooks/usePermissions";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
  category: string | null;
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const isActive = useCallback(
    (path: string) =>
      location.pathname === path || location.pathname.startsWith(path + "/"),
    [location.pathname],
  );

  const { userType } = useAuthStore();
  const { canAccessRoute } = usePermissions();

  const navItems = useMemo(() => {
    const items: NavItem[] = [];

    if (userType === "platform") {
      items.push(
        {
          name: "Dashboard",
          icon: <GridIcon />,
          path: "/platform",
          category: null,
        },
        {
          name: "Tenants",
          icon: <BuildingIcon />,
          path: "/platform/tenants",
          category: "PLATFORM",
        },
        {
          name: "Logs",
          icon: <ClipboardListIcon />,
          path: "/platform/logs",
          category: "PLATFORM",
        },
        {
          name: "Settings",
          icon: <CogIcon />,
          path: "/platform/settings",
          category: "PLATFORM",
        },
      );
    }

    if (userType === "tenant") {
      const tenantItems: NavItem[] = [
        // Dashboard (no category)
        {
          name: "Dashboard",
          icon: <GridIcon />,
          path: "/tenant",
          category: null,
        },

        // SALES Category
        {
          name: "POS",
          icon: <ShoppingCartIcon />,
          path: "/tenant/pos/sell",
          category: "SALES",
        },
        {
          name: "Orders",
          icon: <ReceiptIcon />,
          path: "/tenant/pos/sales",
          category: "SALES",
        },

        // INVENTORY Category
        {
          name: "Products",
          icon: <BoxCubeIcon />,
          path: "/tenant/products",
          category: "INVENTORY",
        },
        {
          name: "Stock Movements",
          icon: <ClipboardListIcon />,
          path: "/tenant/inventory",
          category: "INVENTORY",
        },

        // FINANCE Category
        {
          name: "Expenses",
          icon: <DollarSignIcon />,
          path: "/tenant/expenses",
          category: "FINANCE",
        },
        {
          name: "Purchases",
          icon: <ShoppingBagIcon />,
          path: "/tenant/purchases",
          category: "FINANCE",
        },
        {
          name: "Vendors",
          icon: <BuildingIcon />,
          path: "/tenant/vendors",
          category: "FINANCE",
        },

        // PEOPLE Category
        {
          name: "Customers",
          icon: <UsersIcon />,
          path: "/tenant/customers",
          category: "PEOPLE",
        },
        {
          name: "Team",
          icon: <UserGroupIcon />,
          path: "/tenant/users",
          category: "PEOPLE",
        },

        // SYSTEM Category
        {
          name: "Reports",
          icon: <ChartBarIcon />,
          path: "/tenant/reports",
          category: "SYSTEM",
        },
        {
          name: "Settings",
          icon: <CogIcon />,
          path: "/tenant/settings",
          category: "SYSTEM",
        },
      ];

      // Filter by permissions
      items.push(...tenantItems.filter((item) => canAccessRoute(item.path)));
    }

    return items;
  }, [userType, canAccessRoute]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, NavItem[]> = {
      "": [], // No category (Dashboard)
    };

    navItems.forEach((item) => {
      const category = item.category || "";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });

    return groups;
  }, [navItems]);

  const categoryOrder = [
    "",
    "SALES",
    "INVENTORY",
    "FINANCE",
    "PEOPLE",
    "SYSTEM",
    "PLATFORM",
  ];

  return (
    <aside
      className={`fixed flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >

        {isExpanded || isHovered || isMobileOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="text-xl font-bold dark:text-white">
              ShopStack
            </span>
          </div>
        ) : (
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold">
            SS
          </div>
        )}

      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            {categoryOrder.map((category) => {
              const items = groupedItems[category];
              if (!items || items.length === 0) return null;

              return (
                <div key={category}>
                  {category && (isExpanded || isHovered || isMobileOpen) && (
                    <h2 className="mb-3 text-xs uppercase font-semibold text-gray-400 px-2">
                      {category}
                    </h2>
                  )}
                  <ul className="flex flex-col gap-2">
                    {items.map((item) => (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive(item.path)
                            ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            } ${!isExpanded && !isHovered && !isMobileOpen
                              ? "lg:justify-center"
                              : ""
                            }`}
                        >
                          <span className="w-5 h-5 flex-shrink-0">
                            {item.icon}
                          </span>
                          {(isExpanded || isHovered || isMobileOpen) && (
                            <span className="text-sm font-medium">
                              {item.name}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </nav>
        {/* Added spacer to ensure last item is visible on scroll */}
        <div className="mt-auto pb-10"></div>
      </div>
    </aside>
  );
};

export default AppSidebar;
