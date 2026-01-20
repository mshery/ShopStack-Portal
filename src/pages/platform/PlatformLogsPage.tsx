import { useState, useMemo } from "react";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import RecentActivities from "../../components/dashboard/RecentActivities";
import { useActivityLogsStore } from "../../stores/activityLogs.store";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, FilterX } from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function PlatformLogsPage() {
  const { platformLogs } = useActivityLogsStore();

  // Filters
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Derive unique actions for filter
  const uniqueActions = useMemo(() => {
    const actions = new Set(platformLogs.map((log) => log.action));
    return Array.from(actions).sort();
  }, [platformLogs]);

  // Filtering logic
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

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  const resetFilters = () => {
    setActionFilter("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

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
                setCurrentPage(1);
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
                setCurrentPage(1);
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
          Showing {paginatedLogs.length} of {filteredLogs.length} logs
        </div>
      </div>

      <div className="">
        <RecentActivities logs={paginatedLogs} title="System Audit Logs" />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "primary" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
                className="w-8 h-8 p-0"
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
