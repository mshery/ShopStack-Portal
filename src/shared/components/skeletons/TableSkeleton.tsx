import { Skeleton } from "@/shared/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showFilters?: boolean;
}

export function TableSkeleton({ rows = 5, columns = 5, showFilters = true }: TableSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Header with search and filters */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
      )}

      {/* Table container */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Table header */}
        <div className="border-b border-gray-100 bg-gray-50/80 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/50">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-4 rounded" />
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton
                key={i}
                className={`h-4 ${i === 0 ? "w-48" : i === columns - 1 ? "w-20" : "flex-1"}`}
              />
            ))}
          </div>
        </div>

        {/* Table rows */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
            >
              <Skeleton className="h-4 w-4 rounded" />
              {Array.from({ length: columns }).map((_, colIndex) => {
                if (colIndex === 0) {
                  return (
                    <div key={colIndex} className="flex items-center gap-3 w-48">
                      <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  );
                }
                if (colIndex === columns - 1) {
                  return (
                    <div key={colIndex} className="w-20 flex justify-end gap-1">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                  );
                }
                return (
                  <Skeleton
                    key={colIndex}
                    className={`h-4 flex-1 ${colIndex === 1 ? "max-w-[100px]" : ""}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Skeleton className="h-4 w-48" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
