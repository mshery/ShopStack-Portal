import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // CRITICAL: Prevent duplicate API calls
      staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Don't refetch on tab focus
      refetchOnMount: false, // Don't refetch if data exists
      refetchOnReconnect: false, // Don't refetch on network reconnect
    },
    mutations: {
      retry: 0,
    },
  },
});
