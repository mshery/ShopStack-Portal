import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Building2,
  Activity,
  Settings,
  ChevronDown,
  Search,
  Bell,
  Moon,
  LogOut,
  Menu,
  X,
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
import { getInitials } from "@/utils/format";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: "/platform",
  },
  {
    label: "Tenants",
    icon: <Building2 className="h-5 w-5" />,
    href: "/platform/tenants",
  },
  {
    label: "Activity Logs",
    icon: <Activity className="h-5 w-5" />,
    href: "/platform/logs",
  },
  {
    label: "Settings",
    icon: <Settings className="h-5 w-5" />,
    href: "/platform/settings",
  },
];

export function PlatformLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
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
            <Building2 className="h-5 w-5 text-white" />
          </div>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold text-[hsl(var(--sidebar-foreground))]"
            >
              SaaS Admin
            </motion.span>
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
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-primary))]"
                      : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]",
                  )}
                >
                  {item.icon}
                  {sidebarOpen && <span>{item.label}</span>}
                  {sidebarOpen && item.badge && (
                    <span className="ml-auto rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-semibold text-emerald-700">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
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
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">SaaS Admin</span>
              </div>
              <Button onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-4rem)] px-3 py-4">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-primary))]"
                          : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]",
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
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
                      {getInitials(currentUser?.name ?? "SA")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium md:block">
                    {currentUser?.name ?? "Super Admin"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{currentUser?.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {currentUser?.email}
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
  );
}
