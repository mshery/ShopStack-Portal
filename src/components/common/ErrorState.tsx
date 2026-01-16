import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[hsl(var(--foreground))]">
        Error
      </h3>
      <p className="mt-2 text-center text-sm text-[hsl(var(--muted-foreground))]">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-6">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
