import { Skeleton } from "@/shared/components/skeletons/Skeleton";

/**
 * Professional skeleton for TenantsListPage
 * Matches exact layout of the real page for seamless transition
 */
export function TenantsListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header: Breadcrumb */}
      <Skeleton className="h-6 w-48" />

      {/* Controls Row: Search + Actions */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-11 w-full max-w-md rounded-lg" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Table Header */}
        <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 px-6 py-4">
          <div className="grid grid-cols-6 gap-4">
            {["Company Name", "Slug", "Plan", "Status", "Created At", "Actions"].map((_, i) => (
              <Skeleton key={i} className="h-4 w-24" />
            ))}
          </div>
        </div>

        {/* Table Rows - 10 rows to match ITEMS_PER_PAGE */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {Array.from({ length: 10 }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-6 gap-4 px-6 py-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20 ml-auto" />
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <Skeleton className="h-5 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
