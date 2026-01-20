import { Badge } from "@/shared/components/ui/badge";
import type { UserRole } from "@/shared/types/models";

interface RoleBadgeProps {
  role: UserRole | string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = getRoleConfig(role);

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function getRoleConfig(role: string): {
  variant: "default" | "secondary" | "info" | "warning";
  label: string;
} {
  switch (role) {
    case "super_admin":
      return { variant: "default", label: "Super Admin" };
    case "owner":
      return { variant: "default", label: "Owner" };
    case "admin":
      return { variant: "info", label: "Admin" };
    case "manager":
      return { variant: "info", label: "Manager" };
    case "cashier":
      return { variant: "secondary", label: "Cashier" };
    case "user":
      return { variant: "secondary", label: "User" };
    default:
      return { variant: "secondary", label: formatLabel(role) };
  }
}

function formatLabel(role: string): string {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
