import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import MetricCard from "../../components/dashboard/MetricCard";
import RecentActivities from "../../components/dashboard/RecentActivities";
import { GridIcon, GroupIcon, ListIcon } from "../../components/ui/Icons";
import { usePlatformDashboardScreen } from "../../hooks/usePlatformDashboardScreen";

export default function PlatformDashboardPage() {
  const { status, vm } = usePlatformDashboardScreen();

  if (status === "loading") return <div>Loading...</div>;
  if (status === "error") return <div>Error loading dashboard</div>;

  const metricIcons = [
    <GridIcon key="tenants" className="size-6" />,
    <GroupIcon key="users" className="size-6" />,
    <ListIcon key="logs" className="size-6" />,
  ];

  return (
    <>
      <PageBreadcrumb pageTitle="Platform Overview" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {vm.metrics.map(
          (
            metric: {
              title: string;
              value: string | number;
              change: { value: string; isUp: boolean };
            },
            index: number,
          ) => (
            <MetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              icon={metricIcons[index]}
            />
          ),
        )}
      </div>

      <div className="mt-6">
        <RecentActivities
          logs={vm.recentLogs}
          title="Recent Platform Activities"
        />
      </div>
    </>
  );
}
