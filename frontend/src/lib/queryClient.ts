import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // Always show fresh data: refetch whenever a page mounts or the tab regains focus
      // instead of serving a 60s-old cached copy (this is what made new student data
      // appear "late" when switching between student / faculty / admin views).
      refetchOnWindowFocus: true,
      refetchOnMount: "always",
      refetchOnReconnect: true,
      staleTime: 0,
    },
    mutations: {
      retry: 0,
    },
  },
});
