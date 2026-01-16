import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import RecentActivities from "../../components/dashboard/RecentActivities";
import { useActivityLogsStore } from "../../stores/activityLogs.store";

export default function PlatformLogsPage() {
  const { platformLogs } = useActivityLogsStore();

  const sortedLogs = [...platformLogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <>
      <PageBreadcrumb pageTitle="Platform Logs" />
      <div className="mt-6">
        <RecentActivities logs={sortedLogs} title="System Audit Logs" />
      </div>
    </>
  );
}
