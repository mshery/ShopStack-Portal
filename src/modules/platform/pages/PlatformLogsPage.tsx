import { useState, useMemo } from "react";
import PageBreadcrumb from "@/shared/components/feedback/PageBreadcrumb";
import RecentActivities from "@/shared/components/dashboard/RecentActivities";
import { useActivityLogsFetch } from "../api/queries";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  FilterX,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function PlatformLogsPage() {
  // Fetch logs from API
  const [page, setPage] = useState(1);
  const {
    data: logsData,
    isLoading,
    isError,
    refetch,
  } = useActivityLogsFetch({
    page,
    limit: ITEMS_PER_PAGE,
  });
  // Stable reference to logs from API
  const platformLogs = useMemo(() => logsData?.items || [], [logsData?.items]);
  const pagination = logsData?.pagination;

  // Filters
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Derive unique actions for filter
  const uniqueActions = useMemo(() => {
    const actions = new Set(platformLogs.map((log) => log.action));
    return Array.from(actions).sort();
  }, [platformLogs]);

  // Filtering logic (client-side on current page)
  const filteredLogs = useMemo(() => {
    let result = [...platformLogs];

    if (actionFilter !== "all") {
      result = result.filter((log) => log.action === actionFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (log) =>
          log.action.toLowerCase().includes(query) ||
          log.targetType.toLowerCase().includes(query) ||
          log.targetId.toLowerCase().includes(query),
      );
    }

    return result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [platformLogs, actionFilter, searchQuery]);

  const totalPages = pagination
    ? Math.ceil(pagination.total / ITEMS_PER_PAGE)
    : 1;

  const resetFilters = () => {
    setActionFilter("all");
    setSearchQuery("");
    setPage(1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Platform Logs" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          <span className="ml-2 text-gray-600">Loading activity logs...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Platform Logs" />
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load activity logs
          </h3>
          <p className="text-gray-500 mb-4">
            Something went wrong. Please try again.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Platform Logs" />

      {/* Filters Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-end">
          <div className="w-full md:w-64 space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Search Logs
            </label>
            <Input
              placeholder="Search by action, id..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="h-10"
            />
          </div>

          <div className="w-full md:w-56 space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Filter by Action
            </label>
            <Select
              value={actionFilter}
              onValueChange={(val) => {
                setActionFilter(val);
              }}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="ghost"
            onClick={resetFilters}
            className="h-10 text-gray-500 hover:text-gray-900"
          >
            <FilterX className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          Showing {filteredLogs.length} of{" "}
          {pagination?.total || filteredLogs.length} logs
        </div>
      </div>

      <div className="">
        <RecentActivities logs={filteredLogs} title="System Audit Logs" />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? "primary" : "outline"}
                size="sm"
                onClick={() => setPage(i + 1)}
                className="w-8 h-8 p-0"
              >
                {i + 1}
              </Button>
            ))}
            {totalPages > 5 && <span className="px-2 text-gray-500">...</span>}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
