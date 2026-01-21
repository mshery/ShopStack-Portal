import type { ReactNode, ComponentType } from "react";
import { cn } from "@/shared/utils/cn";

interface InfoRowProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export function InfoRow({ label, value, className }: InfoRowProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </dt>
      <dd className="text-base text-gray-900 dark:text-white">{value}</dd>
    </div>
  );
}

interface InfoSectionProps {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  children: ReactNode;
  className?: string;
  gridCols?: 1 | 2;
}

export function InfoSection({
  icon: Icon,
  title,
  children,
  className,
  gridCols = 2,
}: InfoSectionProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="h-5 w-5 text-brand-500" />}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>
      <dl
        className={cn(
          "grid gap-4",
          gridCols === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1",
        )}
      >
        {children}
      </dl>
    </div>
  );
}

interface StatDisplayProps {
  label: string;
  value: ReactNode;
  subValue?: ReactNode;
  highlight?: boolean;
}

export function StatDisplay({
  label,
  value,
  subValue,
  highlight,
}: StatDisplayProps) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 text-2xl font-bold",
          highlight
            ? "text-brand-600 dark:text-brand-400"
            : "text-gray-900 dark:text-white",
        )}
      >
        {value}
      </dd>
      {subValue && (
        <dd className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          {subValue}
        </dd>
      )}
    </div>
  );
}
