import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge";

interface ActivityLog {
  id: string;
  action: string;
  actorName?: string;
  actorId?: string;
  details: Record<string, unknown> | string;
  createdAt: string;
}

function formatActivityDetails(
  details: Record<string, unknown> | string,
): string {
  if (typeof details === "string") return details;

  // Extract meaningful information from details object
  const parts: string[] = [];

  if (details.companyName) parts.push(`Company: ${details.companyName}`);
  if (details.tenantName) parts.push(`Tenant: ${details.tenantName}`);
  if (details.userName) parts.push(`User: ${details.userName}`);
  if (details.productName) parts.push(`Product: ${details.productName}`);
  if (details.oldStatus && details.newStatus) {
    parts.push(`Status: ${details.oldStatus} → ${details.newStatus}`);
  }
  if (details.role) parts.push(`Role: ${details.role}`);
  if (details.email) parts.push(`Email: ${details.email}`);

  return parts.length > 0 ? parts.join(" • ") : "No additional details";
}

interface RecentActivitiesProps {
  logs: ActivityLog[];
  title?: string;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({
  logs,
  title = "Recent Activities",
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            See all
          </button>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Action
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Actor Details
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Date
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="py-3">
                  <Badge
                    color={
                      log.action.toLowerCase().includes("create")
                        ? "success"
                        : log.action.toLowerCase().includes("delete")
                          ? "error"
                          : log.action.toLowerCase().includes("update")
                            ? "warning"
                            : "info"
                    }
                    size="sm"
                  >
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="py-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {log.actorName || "System"}
                    </p>
                    {log.details && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[280px]">
                        {formatActivityDetails(log.details)}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 dark:text-gray-400 text-theme-sm text-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell
                  className="py-6 text-center text-gray-500 dark:text-gray-400"
                  colSpan={3}
                >
                  No recent activities found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RecentActivities;
