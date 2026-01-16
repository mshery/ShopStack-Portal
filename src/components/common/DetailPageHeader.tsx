import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import type { ReactNode, ComponentType } from "react";
import { cn } from "@/utils/cn";

interface ActionButton {
  label: string;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface DetailPageHeaderProps {
  backTo: string;
  backLabel: string;
  title: string;
  subtitle?: string;
  status?: ReactNode;
  actions?: ActionButton[];
  image?: ReactNode;
}

export function DetailPageHeader({
  backTo,
  backLabel,
  title,
  subtitle,
  status,
  actions = [],
  image,
}: DetailPageHeaderProps) {
  return (
    <div className="mb-6 space-y-4">
      {/* Top row with back button and actions */}
      <div className="flex items-center justify-between">
        <Link to={backTo}>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
        </Link>
        {actions.length > 0 && (
          <div className="flex gap-2">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={action.onClick}
                className={cn(
                  "gap-2",
                  action.variant === "danger" &&
                    "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20",
                )}
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Main header content with optional image */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex gap-6">
          {image && (
            <div className="w-24 h-24 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              {image}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
              {title}
            </h1>
            {(status || subtitle) && (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {status}
                {subtitle && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {subtitle}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
