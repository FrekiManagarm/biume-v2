import { describe, expect, test } from "bun:test";

import { SAAS_NARRATIVE_CONTENT } from "./prototype-saas-content";

describe("SAAS_NARRATIVE_CONTENT", () => {
  test("keeps the landing sections and pricing promise stable", () => {
    expect(Object.keys(SAAS_NARRATIVE_CONTENT)).toEqual([
      "trust",
      "tension",
      "method",
      "benefits",
      "useCases",
      "comparison",
      "pricing",
      "faq",
    ]);
    expect(SAAS_NARRATIVE_CONTENT.pricing).toMatchObject({
      annual: "24,99 €",
      monthly: "29,99 €",
      trial: "15 jours",
      cardRequired: false,
    });
  });
});
