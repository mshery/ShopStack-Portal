import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "./reportsApi";

export const REPORT_KEYS = {
  all: ["reports"] as const,
  analytics: () => [...REPORT_KEYS.all, "analytics"] as const,
};

export const useReportsFetch = () => {
  return useQuery({
    queryKey: REPORT_KEYS.analytics(),
    queryFn: reportsApi.getAnalytics,
  });
};
