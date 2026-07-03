import { describe, expect, test, vi } from "vitest";

import {
  buildReportUpdatePayload,
  invalidateReportUpdateQueries,
} from "./reports-editor.helpers";

describe("buildReportUpdatePayload", () => {
  test("preserves empty draft text fields so saved reports can clear existing values", () => {
    const payload = buildReportUpdatePayload({
      reportId: "report_01",
      title: "  ",
      selectedPetId: "",
      consultationReason: "",
      notes: "",
      observations: [],
      anatomicalIssues: [],
      recommendations: [],
      status: "draft",
    });

    expect(payload).toMatchObject({
      reportId: "report_01",
      title: "Nouveau rapport",
      petId: undefined,
      consultationReason: "",
      notes: "",
      status: "draft",
    });
  });
});

describe("invalidateReportUpdateQueries", () => {
  test("invalidates report list and detail queries after a save", async () => {
    const queryClient = {
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    };

    await invalidateReportUpdateQueries(queryClient, "report_01");

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["reports", "list"],
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["reports", "detail", "report_01"],
    });
  });
});
