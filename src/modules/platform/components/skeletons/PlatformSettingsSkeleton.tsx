import { Skeleton } from "@/shared/components/skeletons/Skeleton";

export function PlatformSettingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Skeleton className="h-8 w-48" />

      {/* Settings Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Feature Toggles Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
}
