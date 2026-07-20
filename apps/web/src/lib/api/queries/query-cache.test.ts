import { describe, expect, test } from "vitest";

import { getContext } from "../../../integrations/tanstack-query/root-provider";
import { dashboardCacheTimes } from "./query-cache";

describe("dashboardCacheTimes", () => {
  test("keeps dashboard data fresh for its route-specific interval", () => {
    expect(dashboardCacheTimes.layout).toEqual({
      staleTime: 5 * 60 * 1_000,
      gcTime: 30 * 60 * 1_000,
    });
    expect(dashboardCacheTimes.live).toEqual({
      staleTime: 30 * 1_000,
      gcTime: 10 * 60 * 1_000,
    });
    expect(dashboardCacheTimes.entity).toEqual({
      staleTime: 60 * 1_000,
      gcTime: 10 * 60 * 1_000,
    });
  });

  test("uses the entity policy as the QueryClient default", () => {
    expect(getContext().queryClient.getDefaultOptions().queries).toEqual(
      dashboardCacheTimes.entity,
    );
  });
});
