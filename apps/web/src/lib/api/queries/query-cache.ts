export const dashboardCacheTimes = {
  layout: { staleTime: 5 * 60 * 1_000, gcTime: 30 * 60 * 1_000 },
  live: { staleTime: 30 * 1_000, gcTime: 10 * 60 * 1_000 },
  entity: { staleTime: 60 * 1_000, gcTime: 10 * 60 * 1_000 },
} as const;
