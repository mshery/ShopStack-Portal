import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import MetricCard from "../../components/dashboard/MetricCard";
import RecentOrders from "../../components/dashboard/RecentOrders";
import MonthlySalesChart from "../../components/dashboard/MonthlySalesChart";
import SalesDonutChart from "../../components/dashboard/SalesDonutChart";
import { BoxCubeIcon, GroupIcon, PlugInIcon } from "../../components/ui/Icons";
import { useTenantDashboardScreen } from "../../hooks/useTenantDashboardScreen";
import { useTenantCurrency } from "../../hooks/useTenantCurrency";

// Custom icon for low stock / inventory alerts
const AlertBoxIcon = ({ className }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 9V13M12 17H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function TenantDashboardPage() {
  const { status, vm } = useTenantDashboardScreen();
  const { formatPrice } = useTenantCurrency();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Error: Tenant not found
          </p>
        </div>
      </div>
    );
  }

  const metricIcons = [
    <PlugInIcon key="sales" className="size-6" />,
    <BoxCubeIcon key="orders" className="size-6" />,
    <GroupIcon key="customers" className="size-6" />,
    <AlertBoxIcon key="stock" className="size-6" />,
  ];

  return (
    <>
      <PageBreadcrumb
        pageTitle={`${vm.tenant?.companyName || "Tenant"} Overview`}
      />

      {/* Metrics Cards - 4 columns with enhanced styling */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-4">
        {vm.metrics.map(
          (
            metric: {
              title: string;
              value: string | number;
              isRawCurrency?: boolean;
              change: { value: string; isUp: boolean };
              iconColor?: "brand" | "success" | "warning" | "error";
            },
            index: number,
          ) => (
            <MetricCard
              key={metric.title}
              title={metric.title}
              value={metric.isRawCurrency ? formatPrice(metric.value as number) : metric.value}
              change={metric.change}
              icon={metricIcons[index]}
              iconColor={metric.iconColor}
            />
          ),
        )}
      </div>

      {/* Charts Section - Side by side layout */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Monthly Sales Bar Chart - Takes more space */}
        <div className="xl:col-span-7">
          <MonthlySalesChart sales={vm.tenantSales} />
        </div>

        {/* Sales Breakdown Donut Chart */}
        <div className="xl:col-span-5">
          <SalesDonutChart
            data={vm.salesBreakdown}
            title="Sales by Payment"
            centerLabel="Total Revenue"
            centerValue={formatPrice(vm.totalSalesValue)}
          />
        </div>
      </div>

      {/* Recent Orders - Full Width at Bottom */}
      <div className="mt-6">
        <RecentOrders orders={vm.recentOrders} />
      </div>
    </>
  );
}
