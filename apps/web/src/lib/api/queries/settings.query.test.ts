import { describe, expect, test, vi } from "vitest";

vi.mock("#/functions/organization.function", () => ({
  getOrganizationSettings: vi.fn(),
}));

import { getOrganizationSettings } from "#/functions/organization.function";

import { dashboardCacheTimes } from "./query-cache";
import { organizationSettingsQueryOptions } from "./settings.query";

describe("organizationSettingsQueryOptions", () => {
  test("uses the organization settings key and entity cache policy", () => {
    const query = organizationSettingsQueryOptions();

    expect(query.queryKey).toEqual(["organizations", "settings"]);
    expect(query.queryFn).toBe(getOrganizationSettings);
    expect(query.staleTime).toBe(60_000);
    expect(query.staleTime).toBe(dashboardCacheTimes.entity.staleTime);
  });
});
