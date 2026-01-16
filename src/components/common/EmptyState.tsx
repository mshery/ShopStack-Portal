import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "No data found",
  description = "There's nothing here yet.",
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
        {icon || (
          <Inbox className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
        )}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[hsl(var(--foreground))]">
        {title}
      </h3>
      <p className="mt-2 text-center text-sm text-[hsl(var(--muted-foreground))]">
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
