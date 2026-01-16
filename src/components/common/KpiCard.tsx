import { cn } from "@/utils/cn";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function KpiCard({
  title,
  value,
  trend,
  icon,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[hsl(var(--border))] bg-white p-6 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
              {value}
            </p>
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-sm font-medium",
                  trend.isPositive ? "text-emerald-600" : "text-red-600",
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {trend.value}%
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
