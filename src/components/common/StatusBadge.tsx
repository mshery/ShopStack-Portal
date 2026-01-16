import { Badge } from "@/components/ui/badge";
import type {
  TenantStatus,
  UserStatus,
  ProductStatus,
  ShiftStatus,
} from "@/types";

interface StatusBadgeProps {
  status: TenantStatus | UserStatus | ProductStatus | ShiftStatus | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = getStatusConfig(status);

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function getStatusConfig(status: string): {
  variant: "success" | "warning" | "error" | "secondary" | "info";
  label: string;
} {
  switch (status) {
    case "active":
    case "in_stock":
    case "open":
      return { variant: "success", label: formatLabel(status) };
    case "low_stock":
    case "inactive":
      return { variant: "warning", label: formatLabel(status) };
    case "out_of_stock":
    case "suspended":
    case "closed":
      return { variant: "error", label: formatLabel(status) };
    default:
      return { variant: "secondary", label: formatLabel(status) };
  }
}

function formatLabel(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
