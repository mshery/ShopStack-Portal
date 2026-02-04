import { cn } from "@/shared/utils/cn";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-gray-200 dark:bg-gray-800",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_1.5s_infinite]",
        "before:bg-gradient-to-r",
        "before:from-transparent before:via-white/60 before:to-transparent",
        "dark:before:via-white/10",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
