import { describe, expect, test } from "vitest";

import { allInclusiveMonthly, allInclusiveYearly } from "./autumn.config";

describe("Autumn trial policy", () => {
  test.each([
    ["monthly", allInclusiveMonthly],
    ["yearly", allInclusiveYearly],
  ] as const)("%s plan offers 15 days without a card", (_name, plan) => {
    expect(plan.freeTrial).toEqual({
      durationLength: 15,
      durationType: "day",
      cardRequired: false,
    });
  });
});

describe("Autumn boolean feature items", () => {
  test.each([
    ["monthly", allInclusiveMonthly],
    ["yearly", allInclusiveYearly],
  ] as const)("%s plan grants boolean features without an included quantity", (_name, plan) => {
    for (const item of plan.items ?? []) {
      expect(item).not.toHaveProperty("included");
    }
  });
});
