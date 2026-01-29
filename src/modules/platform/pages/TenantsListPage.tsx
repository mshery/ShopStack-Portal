import PageBreadcrumb from "@/shared/components/feedback/PageBreadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import Badge from "@/shared/components/ui/badge";
import Button from "@/shared/components/ui/button";
import {
  ITEMS_PER_PAGE,
  useTenantsListScreen,
} from "../hooks/useTenantsListScreen";
import { TenantsListSkeleton } from "../components/skeletons";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { usePlansFetch } from "../api/queries";

export default function TenantsListPage() {
  const { status, vm, actions } = useTenantsListScreen();
  const { pagination } = vm;
  const { data: plans } = usePlansFetch();

  // Loading state - show professional skeleton
  if (status === "loading") {
    return (
      <>
        <PageBreadcrumb pageTitle="Tenants Management" />
        <TenantsListSkeleton />
      </>
    );
  }

  // Error state
  if (status === "error") {
    return (
      <>
        <PageBreadcrumb pageTitle="Tenants Management" />
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Failed to load tenants
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Something went wrong. Please try again.
          </p>
          <Button variant="outline" onClick={() => actions.refresh()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </>
    );
  }

  // Success/Empty state - render table

  return (
    <>
      <PageBreadcrumb pageTitle="Tenants Management" />

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search tenants..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            value={vm.search}
            onChange={(e) => actions.setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          {vm.isFetching && (
            <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
          )}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {vm.allTenantsCount} tenants
          </span>
          <Link to="/platform/tenants/new">
            <Button variant="primary">Add New Tenant</Button>
          </Link>
        </div>
      </div>

      <div
        className={`overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] transition-opacity duration-200 ${
          vm.isFetching ? "opacity-70" : "opacity-100"
        }`}
      >
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Company Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Slug
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Plan
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Created At
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-4 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {vm.tenants.map((tenant) => (
                <TableRow
                  key={tenant.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.01]"
                >
                  <TableCell className="px-6 py-4">
                    <span className="font-medium text-gray-800 dark:text-white/90 text-theme-sm">
                      {tenant.companyName}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400 text-theme-sm">
                    {tenant.slug}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge color="info" variant="light" size="sm">
                      {plans?.find((p) => p.id === tenant.planId)?.name ||
                        "Unknown"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge
                      color={tenant.status === "active" ? "success" : "error"}
                      variant="light"
                      size="sm"
                    >
                      {tenant.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-gray-500 dark:text-gray-400 text-theme-sm text-nowrap">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-end">
                    <Link
                      to={`/platform/tenants/${tenant.id}?page=${pagination.currentPage}&limit=${ITEMS_PER_PAGE}`}
                      className="text-brand-500 hover:text-brand-600 font-medium text-sm"
                    >
                      View Details
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {vm.isEmpty && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    No tenants found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={actions.prevPage}
                disabled={pagination.currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={actions.nextPage}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
