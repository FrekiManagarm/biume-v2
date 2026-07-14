import { describe, expect, test } from "vitest";
import { reportSchema } from "./schemas";

const validReport = {
  title: "Rapport",
  observations: [
    {
      id: "obs_01",
      region: "part_01",
      severity: 2,
      notes: "Observation",
      type: "dynamic" as const,
      laterality: "left" as const,
    },
  ],
  anatomicalIssues: [
    {
      id: "issue_01",
      type: "dysfunction" as const,
      region: "part_02",
      severity: 3,
      notes: "Dysfonction",
      laterality: "bilateral" as const,
    },
  ],
  recommendations: [{ id: "rec_01", content: "Repos" }],
};

describe("reportSchema item ids", () => {
  test("rejects an id shared by an observation and anatomical issue", () => {
    const result = reportSchema.safeParse({
      ...validReport,
      anatomicalIssues: [{ ...validReport.anatomicalIssues[0], id: "obs_01" }],
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "custom",
          message: "Les identifiants anatomiques doivent être uniques",
        }),
      ]),
    );
  });

  test("rejects duplicate recommendation ids", () => {
    const result = reportSchema.safeParse({
      ...validReport,
      recommendations: [
        validReport.recommendations[0],
        { id: "rec_01", content: "Marche" },
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "custom",
          message: "Les identifiants de recommandation doivent être uniques",
        }),
      ]),
    );
  });

  test("rejects an empty recommendation id", () => {
    const result = reportSchema.safeParse({
      ...validReport,
      recommendations: [{ id: "", content: "Repos" }],
    });

    expect(result.success).toBe(false);
  });
});
