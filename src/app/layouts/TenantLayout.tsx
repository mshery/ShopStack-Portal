import { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Users,
  Package,
  UserCircle,
  ShoppingCart,
  History,
  Clock,
  Settings,
  ChevronDown,
  Search,
  Bell,
  Moon,
  LogOut,
  Menu,
  X,
  Store,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantsStore } from "@/stores/tenants.store";
import { TenantStatusGuard } from "@/components/guards/TenantStatusGuard";
import { ImpersonationBanner } from "@/components/platform/ImpersonationBanner";
import { getInitials } from "@/utils/format";
import type { TenantUser } from "@/types";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
  children?: { label: string; href: string; icon?: React.ReactNode }[];
  requiredRoles?: string[];
}

export function TenantLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(["pos"]);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, activeTenantId, logout } = useAuthStore();
  const { tenants } = useTenantsStore();

  const tenant = tenants.find((t) => t.id === activeTenantId);
  const user = currentUser as TenantUser | null;
  const posEnabled = tenant?.features?.posEnabled ?? false;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleExpanded = (key: string) => {
    setExpandedItems((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/tenant",
    },
    {
      label: "Users",
      icon: <Users className="h-5 w-5" />,
      href: "/tenant/users",
      requiredRoles: ["owner", "admin"],
    },
    {
      label: "Products",
      icon: <Package className="h-5 w-5" />,
      href: "/tenant/products",
      children: [
        {
          label: "All Products",
          href: "/tenant/products",
          icon: <Package className="h-4 w-4" />,
        },
        {
          label: "Categories",
          href: "/tenant/categories",
          icon: <Package className="h-4 w-4" />,
        },
        {
          label: "Brands",
          href: "/tenant/brands",
          icon: <Package className="h-4 w-4" />,
        },
      ],
    },
    {
      label: "Customers",
      icon: <UserCircle className="h-5 w-5" />,
      href: "/tenant/customers",
    },
  ];

  const posNavItems: NavItem[] = posEnabled
    ? [
      {
        label: "POS",
        icon: <Store className="h-5 w-5" />,
        href: "/tenant/pos",
        badge: "NEW",
        children: [
          {
            label: "Register",
            href: "/tenant/pos/register",
            icon: <ShoppingCart className="h-4 w-4" />,
          },
          {
            label: "Sales History",
            href: "/tenant/pos/sales",
            icon: <History className="h-4 w-4" />,
          },
          {
            label: "Shifts",
            href: "/tenant/pos/shifts",
            icon: <Clock className="h-4 w-4" />,
          },
        ],
      },
    ]
    : [];

  const filteredNavItems = navItems.filter((item) => {
    if (!item.requiredRoles) return true;
    return item.requiredRoles.includes(user?.role ?? "");
  });

  const allNavItems = [...filteredNavItems, ...posNavItems];

  const renderNavItem = (item: NavItem, isMobile = false) => {
    const isActive = location.pathname === item.href;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label.toLowerCase());

    if (hasChildren) {
      return (
        <div key={item.href}>
          <button
            onClick={() => toggleExpanded(item.label.toLowerCase())}
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]",
            )}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              {(sidebarOpen || isMobile) && <span>{item.label}</span>}
            </div>
            {(sidebarOpen || isMobile) && (
              <div className="flex items-center gap-1">
                {item.badge && (
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-semibold text-emerald-700">
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isExpanded && "rotate-90",
                  )}
                />
              </div>
            )}
          </button>
          <AnimatePresence>
            {isExpanded && (sidebarOpen || isMobile) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-4 mt-1 space-y-1 overflow-hidden border-l border-[hsl(var(--sidebar-border))] pl-3"
              >
                {item.children?.map((child) => {
                  const isChildActive = location.pathname === child.href;
                  return (
                    <Link
                      key={child.href}
                      to={child.href}
                      onClick={() => isMobile && setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                        isChildActive
                          ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-primary))]"
                          : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]",
                      )}
                    >
                      {child.icon}
                      <span>{child.label}</span>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        to={item.href}
        onClick={() => isMobile && setMobileMenuOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-primary))]"
            : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]",
        )}
      >
        {item.icon}
        {(sidebarOpen || isMobile) && <span>{item.label}</span>}
        {(sidebarOpen || isMobile) && item.badge && (
          <span className="ml-auto rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-semibold text-emerald-700">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <TenantStatusGuard>
      <ImpersonationBanner />
      <div className="flex h-screen bg-[hsl(var(--background))]">
        {/* Desktop Sidebar */}
        <aside
          className={cn(
            "hidden lg:flex lg:flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))] transition-all duration-300",
            sidebarOpen ? "w-64" : "w-20",
          )}
        >
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-[hsl(var(--sidebar-border))] px-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))]">
              <Store className="h-5 w-5 text-white" />
            </div>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col"
              >
                <span className="text-lg font-bold text-[hsl(var(--sidebar-foreground))]">
                  {tenant?.companyName ?? "Tenant"}
                </span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  {tenant?.plan ?? ""}
                </span>
              </motion.div>
            )}
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            {sidebarOpen && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Menu
              </p>
            )}
            <nav className="space-y-1">
              {allNavItems.map((item) => renderNavItem(item))}
            </nav>

            {sidebarOpen && (
              <>
                <Separator className="my-4" />
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  Settings
                </p>
                <Link
                  to="/tenant/settings"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    location.pathname === "/tenant/settings"
                      ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-primary))]"
                      : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]",
                  )}
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </>
            )}
          </ScrollArea>

          {/* Collapse button */}
          <div className="border-t border-[hsl(var(--sidebar-border))] p-3">
            <Button
              size="sm"
              className="w-full justify-start"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  sidebarOpen ? "rotate-90" : "-rotate-90",
                )}
              />
              {sidebarOpen && <span className="ml-2">Collapse</span>}
            </Button>
          </div>
        </aside>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))] lg:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-[hsl(var(--sidebar-border))] px-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))]">
                    <Store className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-bold">
                    {tenant?.companyName ?? "Tenant"}
                  </span>
                </div>
                <Button onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <ScrollArea className="h-[calc(100vh-4rem)] px-3 py-4">
                <nav className="space-y-1">
                  {allNavItems.map((item) => renderNavItem(item, true))}
                </nav>
              </ScrollArea>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-white px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <Button
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                <Input
                  placeholder="Search or type command..."
                  className="w-80 pl-10 pr-12"
                />
                <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none rounded border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-1.5 py-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                  ⌘K
                </kbd>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button>
                <Moon className="h-5 w-5" />
              </Button>
              <Button className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500" />
              </Button>
              <Separator orientation="vertical" className="mx-2 h-8" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[hsl(var(--primary))] text-white text-xs">
                        {getInitials(user?.name ?? "U")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium md:block">
                      {user?.name ?? "User"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto bg-gray-50/50">
            <Outlet />
          </main>
        </div>
      </div>
    </TenantStatusGuard>
  );
}
