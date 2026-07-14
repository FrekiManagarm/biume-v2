import { describe, expect, test, vi } from "vitest";

import {
  buildReportUpdatePayload,
  getReportDesktopGridClassName,
  invalidateReportDetailQuery,
  invalidateReportUpdateQueries,
  openOwnerPreparation,
  replaceOwnerContentRecord,
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

describe("getReportDesktopGridClassName", () => {
  test("uses an 18rem navigation and gives the workspace all remaining width", () => {
    expect(getReportDesktopGridClassName(false)).toContain(
      "grid-cols-[18rem_minmax(0,1fr)]",
    );
    expect(getReportDesktopGridClassName(true)).toContain(
      "grid-cols-[72px_minmax(0,1fr)]",
    );
  });
});

describe("openOwnerPreparation", () => {
  test("saves a changed draft before opening preparation", async () => {
    const saveDraft = vi.fn().mockResolvedValue(true);
    const openPanel = vi.fn();

    await openOwnerPreparation({
      hasUnsavedChanges: true,
      saveDraft,
      openPanel,
    });

    expect(saveDraft).toHaveBeenCalledOnce();
    expect(openPanel).toHaveBeenCalledOnce();
  });

  test("does not open preparation when saving the draft fails", async () => {
    const saveDraft = vi.fn().mockResolvedValue(false);
    const openPanel = vi.fn();

    await openOwnerPreparation({
      hasUnsavedChanges: true,
      saveDraft,
      openPanel,
    });

    expect(openPanel).not.toHaveBeenCalled();
  });

  test("opens immediately when the professional draft is unchanged", async () => {
    const saveDraft = vi.fn().mockResolvedValue(false);
    const openPanel = vi.fn();

    await openOwnerPreparation({
      hasUnsavedChanges: false,
      saveDraft,
      openPanel,
    });

    expect(saveDraft).not.toHaveBeenCalled();
    expect(openPanel).toHaveBeenCalledOnce();
  });
});

describe("replaceOwnerContentRecord", () => {
  test("replaces the matching source and keeps unrelated owner content", () => {
    const existing = [
      {
        id: "owner_1",
        reportId: "report_01",
        sourceKind: "notes" as const,
        sourceId: "notes",
        ownerText: "Ancien texte",
        sourceFingerprint: "old",
      },
      {
        id: "owner_2",
        reportId: "report_01",
        sourceKind: "observation" as const,
        sourceId: "observation_1",
        ownerText: "Observation",
        sourceFingerprint: "same",
      },
    ];
    const replacement = {
      ...existing[0],
      ownerText: "Nouveau texte",
      sourceFingerprint: "new",
    };

    expect(replaceOwnerContentRecord(existing, replacement)).toEqual([
      replacement,
      existing[1],
    ]);
  });
});

describe("invalidateReportDetailQuery", () => {
  test("invalidates exactly the saved report detail", async () => {
    const queryClient = {
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    };

    await invalidateReportDetailQuery(queryClient, "report_01");

    expect(queryClient.invalidateQueries).toHaveBeenCalledOnce();
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["reports", "detail", "report_01"],
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
