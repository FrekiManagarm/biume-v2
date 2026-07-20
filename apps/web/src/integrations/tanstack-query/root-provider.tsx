import { QueryClient } from "@tanstack/react-query";
import { dashboardCacheTimes } from "#/lib/api/queries/query-cache";

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: dashboardCacheTimes.entity,
    },
  });

  return {
    queryClient,
  };
}
export default function TanstackQueryProvider() {}
