import { useParams, Link } from "react-router-dom";
import { useTenantsStore } from "../../stores/tenants.store";
import { useUsersStore } from "../../stores/users.store";
import { useProductsStore } from "../../stores/products.store";
import { useActivityLogsStore } from "../../stores/activityLogs.store";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import MetricCard from "../../components/dashboard/MetricCard";
import RecentActivities from "../../components/dashboard/RecentActivities";
import Badge from "../../components/ui/badge";
import Button from "../../components/ui/button";
import {
  GroupIcon,
  BoxCubeIcon,
  ListIcon,
  ArrowLeftIcon,
} from "../../components/ui/Icons";
import { EditTenantModal } from "../../components/tenant/EditTenantModal";
import { DeleteTenantModal } from "../../components/tenant/DeleteTenantModal";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import { generateId } from "../../utils/normalize";
import type {
  TenantUser,
  Product,
  TenantActivityLog,
  PlatformActivityLog,
} from "../../types";

export default function TenantDetailPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const { tenants } = useTenantsStore();
  const { tenantUsers: allUsers } = useUsersStore();
  const { products: allProducts } = useProductsStore();
  const { tenantLogs: allLogs, addPlatformLog } = useActivityLogsStore();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const { removeTenant } = useTenantsStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const tenant = useMemo(
    () => tenants.find((t) => t.id === tenantId),
    [tenants, tenantId],
  );

  const tenantUsers = useMemo(
    () => allUsers.filter((u: TenantUser) => u.tenant_id === tenantId),
    [allUsers, tenantId],
  );

  const tenantProducts = useMemo(
    () => allProducts.filter((p: Product) => p.tenant_id === tenantId),
    [allProducts, tenantId],
  );

  const tenantLogs = useMemo(
    () => allLogs.filter((l: TenantActivityLog) => l.tenant_id === tenantId),
    [allLogs, tenantId],
  );

  const handleDelete = () => {
    // Log the deletion
    const log: PlatformActivityLog = {
      id: generateId("plog"),
      action: "tenant_deleted",
      actorId: currentUser?.id ?? "unknown",
      targetType: "tenant",
      targetId: tenant!.id,
      details: {
        companyName: tenant!.companyName,
        slug: tenant!.slug,
      },
      createdAt: new Date().toISOString(),
    };
    addPlatformLog(log);

    // Remove tenant
    removeTenant(tenantId!);

    // Navigate back to tenants list
    navigate("/platform/tenants");
  };

  if (!tenant)
    return (
      <div className="p-6 text-center text-gray-500">Tenant not found</div>
    );

  const metrics = [
    {
      title: "Active Users",
      value: tenantUsers.length,
      change: { value: `${tenant.maxUsers} max`, isUp: true },
      icon: <GroupIcon className="size-6" />,
    },
    {
      title: "Products",
      value: tenantProducts.length,
      change: { value: `${tenant.maxProducts} max`, isUp: true },
      icon: <BoxCubeIcon className="size-6" />,
    },
    {
      title: "Activity Count",
      value: tenantLogs.length,
      change: { value: "Recent", isUp: true },
      icon: <ListIcon className="size-6" />,
    },
  ];

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/platform/tenants"
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
              Slug: {tenant.slug} • Plan: {tenant.plan.toUpperCase()}
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
          <Button variant="primary">Access as Admin</Button>
        </div>
      </div>

      <PageBreadcrumb pageTitle="Tenant Details" />

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

      <div className="mt-6">
        <RecentActivities
          logs={tenantLogs.slice(0, 10)}
          title="Tenant Activity Audit"
        />
      </div>

      {/* Edit Modal */}
      <EditTenantModal
        tenant={tenant}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Delete Modal */}
      <DeleteTenantModal
        tenant={tenant}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
