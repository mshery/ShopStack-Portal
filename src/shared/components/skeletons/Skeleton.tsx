import { Skeleton as UiSkeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/utils/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <UiSkeleton className={cn("h-4 w-full", className)} />;
}
