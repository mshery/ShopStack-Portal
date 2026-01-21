import React from "react";
import Badge from "../ui/badge";
import { ArrowUpIcon, ArrowDownIcon } from "../ui/Icons";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    isUp: boolean;
  };
  icon: React.ReactNode;
  iconColor?: "brand" | "success" | "warning" | "error";
  className?: string;
}

const iconColorStyles = {
  brand:
    "bg-gradient-to-br from-brand-500/20 to-brand-600/10 text-brand-600 dark:from-brand-400/20 dark:to-brand-500/10 dark:text-brand-400",
  success:
    "bg-gradient-to-br from-success-500/20 to-success-600/10 text-success-600 dark:from-success-400/20 dark:to-success-500/10 dark:text-success-400",
  warning:
    "bg-gradient-to-br from-warning-500/20 to-warning-600/10 text-warning-600 dark:from-warning-400/20 dark:to-warning-500/10 dark:text-warning-400",
  error:
    "bg-gradient-to-br from-error-500/20 to-error-600/10 text-error-600 dark:from-error-400/20 dark:to-error-500/10 dark:text-error-400",
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  iconColor = "brand",
  className = "",
}) => {
  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 
        transition-all duration-300 ease-out
        hover:border-gray-300 hover:shadow-theme-lg
        dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-gray-700 dark:hover:shadow-none
        md:p-6 ${className}
      `}
    >
      {/* Subtle gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/[0.02] dark:to-transparent" />

      <div className="relative">
        {/* Icon with gradient background */}
        <div
          className={`
            flex items-center justify-center w-12 h-12 rounded-xl
            transition-transform duration-300 group-hover:scale-105
            ${iconColorStyles[iconColor]}
          `}
        >
          {icon}
        </div>

        {/* Content section */}
        <div className="mt-5">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </span>
          <div className="flex items-end justify-between mt-2 gap-3">
            <h4 className="font-bold text-gray-900 text-2xl tracking-tight dark:text-white/90 md:text-[28px]">
              {value}
            </h4>
            {change && (
              <Badge
                color={change.isUp ? "success" : "error"}
                className="shrink-0"
              >
                {change.isUp ? (
                  <ArrowUpIcon className="size-3" />
                ) : (
                  <ArrowDownIcon className="size-3" />
                )}
                {change.value}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
