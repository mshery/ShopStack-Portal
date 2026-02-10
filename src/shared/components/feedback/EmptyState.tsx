import { Inbox, type LucideIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  IconComponent?: LucideIcon;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  title = "No data found",
  description = "There's nothing here yet.",
  actionLabel,
  onAction,
  icon,
  IconComponent,
  size = "md",
}: EmptyStateProps) {
  const sizeStyles = {
    sm: {
      container: "py-8",
      iconWrapper: "h-12 w-12",
      icon: "h-6 w-6",
      title: "text-base",
      description: "text-sm",
    },
    md: {
      container: "py-16",
      iconWrapper: "h-16 w-16",
      icon: "h-8 w-8",
      title: "text-lg",
      description: "text-sm",
    },
    lg: {
      container: "py-24",
      iconWrapper: "h-20 w-20",
      icon: "h-10 w-10",
      title: "text-xl",
      description: "text-base",
    },
  };

  const styles = sizeStyles[size];
  const Icon = IconComponent || Inbox;

  return (
    <div className={`flex flex-col items-center justify-center ${styles.container}`}>
      <div 
        className={`
          flex items-center justify-center rounded-full
          bg-gradient-to-br from-gray-100 to-gray-50 
          dark:from-gray-800 dark:to-gray-900
          border border-gray-200 dark:border-gray-700
          ${styles.iconWrapper}
        `}
      >
        {icon || (
          <Icon className={`${styles.icon} text-gray-400 dark:text-gray-500`} />
        )}
      </div>
      <h3 
        className={`
          mt-4 font-semibold text-gray-900 dark:text-white
          ${styles.title}
        `}
      >
        {title}
      </h3>
      <p 
        className={`
          mt-2 text-center text-gray-500 dark:text-gray-400 max-w-sm
          ${styles.description}
        `}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
