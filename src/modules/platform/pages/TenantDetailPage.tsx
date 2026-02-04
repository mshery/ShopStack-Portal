import { useParams, Link, useNavigate } from "react-router-dom";
import {
  useTenantFetch,
  useDeleteTenant,
  usePlansFetch,
  useTenantBillingFetch,
  platformKeys,
} from "../api/queries";
import PageBreadcrumb from "@/shared/components/feedback/PageBreadcrumb";
import MetricCard from "@/shared/components/dashboard/MetricCard";
import Badge from "@/shared/components/ui/badge";
import Button from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  GroupIcon,
  BoxCubeIcon,
  ArrowLeftIcon,
  DollarSignIcon,
} from "@/shared/components/ui/Icons";
import { AlertCircle } from "lucide-react";
import { EditTenantModal } from "@/modules/platform/components/EditTenantModal";
import { DeleteTenantModal } from "@/modules/platform/components/DeleteTenantModal";
import { TenantBillingTab } from "@/modules/platform/components/TenantBillingTab";
import { useImpersonation } from "../hooks/useImpersonation";
import { useMemo, useState } from "react";
import type { Tenant } from "@/shared/types/models";
import { refetchTenantListPage } from "../utils/tenantQueriesUtils";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

// Define strict TabType
type TabType = "overview" | "billing";

export default function TenantDetailPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();

  // Queries
  const {
    mutate: deleteTenant,
    isPending: isDeleting,
    isSuccess: isDeleted,
  } = useDeleteTenant();

  const {
    data: tenant,
    isLoading,
    isError,
    refetch,
  } = useTenantFetch(tenantId!, !isDeleting && !isDeleted); // Disable fetch if deleting or deleted
  const { data: plans = [] } = usePlansFetch();
  const { data: billing } = useTenantBillingFetch(
    tenantId!,
    !isDeleting && !isDeleted,
  ); // Disable fetch if deleting or deleted

  const { actions: impersonationActions } = useImpersonation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Read page/limit/search (safe defaults)
  const pageFromParams = Number(searchParams.get("page") ?? 1);
  const limitFromParams = Number(searchParams.get("limit") ?? 10);
  const searchFromParams = searchParams.get("search") ?? "";

  // Build URL to go back to tenants list with correct page
  const backToListUrl = `/platform/tenants?page=${pageFromParams}&limit=${limitFromParams}${searchFromParams ? `&search=${searchFromParams}` : ""}`;

  // Derived
  const currentPlan = useMemo(
    () => plans.find((p) => p.id === tenant?.planId),
    [plans, tenant],
  );

  const handleDelete = () => {
    if (!tenant) return;

    deleteTenant(tenant.id, {
      onSuccess: async () => {
        await refetchTenantListPage(queryClient, {
          page: pageFromParams,
          limit: limitFromParams,
          search: searchFromParams,
        });

        // Optional: remove deleted tenant detail cache
        queryClient.removeQueries({
          queryKey: platformKeys.tenantDetail(tenant.id),
        });
        navigate("/platform/tenants");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (isError || !tenant) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center h-[50vh]">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Tenant not found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          The tenant you are looking for does not exist or has been deleted.
        </p>
        <div className="flex gap-4">
          <Link to={backToListUrl}>
            <Button variant="outline">Back to List</Button>
          </Link>
          <Button variant="primary" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Use _count from API for metrics
  const metrics = [
    {
      title: "Active Users",
      value: tenant._count?.users ?? 0,
      change: {
        value: `${currentPlan?.limits.maxUsers ?? "Unlimited"} max`,
        isUp: true,
      },
      icon: <GroupIcon className="size-6" />,
    },
    {
      title: "Products",
      value: tenant._count?.products ?? 0,
      change: {
        value: `${currentPlan?.limits.maxProducts ?? "Unlimited"} max`,
        isUp: true,
      },
      icon: <BoxCubeIcon className="size-6" />,
    },
    {
      title: "Sales",
      value: tenant._count?.sales ?? 0,
      change: {
        value: "Total Processed",
        isUp: true,
      },
      icon: <DollarSignIcon className="size-6" />,
    },
  ];

  const tabs: { id: TabType; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "billing", label: "Billing" },
  ];

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={backToListUrl}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="size-5 text-gray-500" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                {tenant.companyName}
              </h1>
              <Badge
                color={tenant.status === "active" ? "success" : "error"}
                variant="light"
                size="sm"
              >
                {tenant.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Slug: {tenant.slug} • Plan:{" "}
              {currentPlan?.name?.toUpperCase() ?? "UNKNOWN"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            Edit Tenant
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsDeleteModalOpen(true)}
            className="border-error-300 text-error-700 hover:bg-error-50"
          >
            Delete Tenant
          </Button>
          <Button
            variant="primary"
            onClick={() => impersonationActions.impersonateTenant(tenantId!)}
          >
            Access as Admin
          </Button>
        </div>
      </div>

      <PageBreadcrumb pageTitle="Tenant Details" />

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-brand-500 text-brand-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {metrics.map((metric) => (
              <MetricCard
                key={metric.title}
                title={metric.title}
                value={metric.value}
                change={metric.change}
                icon={metric.icon}
              />
            ))}
          </div>
        </>
      )}

      {activeTab === "billing" && (
        <TenantBillingTab billing={billing} invoices={tenant.invoices || []} />
      )}

      {/* Edit Modal */}
      <EditTenantModal
        tenant={tenant as unknown as Tenant}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Delete Modal */}
      <DeleteTenantModal
        tenant={tenant as unknown as Tenant}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
