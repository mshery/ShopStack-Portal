import { Skeleton } from "./Skeleton";

export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.03)] dark:border-gray-800 dark:bg-gray-900/50"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-6 w-16 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.03)] dark:border-gray-800 dark:bg-gray-900/50">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 rounded" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
