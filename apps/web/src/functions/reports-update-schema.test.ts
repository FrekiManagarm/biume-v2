import {
  createInitialReportSectionStates,
  reportSchema,
} from "@biume/contracts/report";
import { describe, expect, test } from "vitest";

import { updateReportSchema } from "#/lib/utils/schemas";

const updateWithoutDecisions = {
  reportId: "report-1",
  title: "Compte rendu",
  petId: "pet-1",
  consultationReason: "Suivi",
  notes: "",
  status: "draft" as const,
  observations: [],
  anatomicalIssues: [],
  recommendations: [],
};

describe("update report schema", () => {
  test("keeps generic transition defaults while requiring endpoint decisions", () => {
    expect(reportSchema.parse(updateWithoutDecisions).sectionStates).toEqual(
      createInitialReportSectionStates(),
    );
    expect(updateReportSchema.safeParse(updateWithoutDecisions).success).toBe(
      false,
    );
  });

  test("accepts an update carrying every canonical decision", () => {
    expect(
      updateReportSchema.safeParse({
        ...updateWithoutDecisions,
        sectionStates: {
          clinical: "confirmed",
          anatomical: "not_applicable",
          recommendations: "confirmed",
          notes: "confirmed",
        },
      }).success,
    ).toBe(true);
  });
});
