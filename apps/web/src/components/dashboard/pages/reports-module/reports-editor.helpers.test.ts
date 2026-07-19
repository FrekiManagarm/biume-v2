import { describe, expect, test, vi } from "vitest";

import {
  buildReportUpdatePayload,
  ensureSuccessfulReportUpdate,
  getReportDraftRevision,
  getReportDesktopGridClassName,
  invalidateReportDetailQuery,
  invalidateReportUpdateQueries,
  openOwnerPreparation,
  replaceOwnerContentRecord,
  runExclusiveReportSave,
  deriveProfessionalSectionStatus,
  getAnatomicalProfessionalItemText,
  getEffectiveSectionState,
  getSectionStatesAfterEdit,
} from "./reports-editor.helpers";

describe("deriveProfessionalSectionStatus", () => {
  test.each([
    ["clinical", { consultationReason: "", itemTexts: [] }, "empty"],
    [
      "clinical",
      { consultationReason: "Suivi", itemTexts: [] },
      "needs_confirmation",
    ],
    [
      "clinical",
      { consultationReason: "Suivi", itemTexts: ["Observation"] },
      "needs_confirmation",
    ],
    ["anatomical", { consultationReason: "", itemTexts: [""] }, "empty"],
    [
      "anatomical",
      { consultationReason: "", itemTexts: ["Tension"] },
      "needs_confirmation",
    ],
    ["recommendations", { consultationReason: "", itemTexts: [] }, "empty"],
    [
      "notes",
      { consultationReason: "", itemTexts: ["Surveiller"] },
      "needs_confirmation",
    ],
  ] as const)("derives %s as %s", (section, content, expected) => {
    expect(deriveProfessionalSectionStatus(section, content)).toBe(expected);
  });

  test("considers an anatomical item complete when its structured region replaces optional notes", () => {
    const itemText = getAnatomicalProfessionalItemText({
      notes: "",
      region: "database_part_id",
      anatomicalPart: { name: "Cervicales" },
    });
    expect(
      deriveProfessionalSectionStatus("anatomical", {
        consultationReason: "",
        itemTexts: [itemText],
      }),
    ).toBe("needs_confirmation");
  });
});

test("does not replace an explicit section decision when deriving content status", () => {
  expect(
    getEffectiveSectionState({
      persisted: "not_applicable",
      hasContent: true,
    }),
  ).toBe("not_applicable");
  expect(
    getEffectiveSectionState({ persisted: "empty", hasContent: true }),
  ).toBe("needs_confirmation");
});

test("marks only the edited section as needing confirmation", () => {
  expect(
    getSectionStatesAfterEdit(
      {
        clinical: "confirmed",
        anatomical: "not_applicable",
        recommendations: "confirmed",
        notes: "confirmed",
      },
      "anatomical",
    ),
  ).toEqual({
    clinical: "confirmed",
    anatomical: "needs_confirmation",
    recommendations: "confirmed",
    notes: "confirmed",
  });
});

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
      sectionStates: {
        clinical: "confirmed",
        anatomical: "not_applicable",
        recommendations: "confirmed",
        notes: "confirmed",
      },
      status: "draft",
    });

    expect(payload).toMatchObject({
      reportId: "report_01",
      title: "Nouveau rapport",
      petId: undefined,
      consultationReason: "",
      notes: "",
      sectionStates: {
        clinical: "confirmed",
        anatomical: "not_applicable",
        recommendations: "confirmed",
        notes: "confirmed",
      },
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

  test("does not open when the draft changes while its save is pending", async () => {
    let resolveSave: ((saved: boolean) => void) | undefined;
    let revision = "revision-1";
    const saveDraft = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolveSave = resolve;
        }),
    );
    const openPanel = vi.fn();

    const opening = openOwnerPreparation({
      hasUnsavedChanges: true,
      saveDraft,
      openPanel,
      getRevision: () => revision,
    });
    revision = "revision-2";
    resolveSave?.(true);

    await expect(opening).resolves.toBe(false);
    expect(openPanel).not.toHaveBeenCalled();
  });
});

describe("ensureSuccessfulReportUpdate", () => {
  test("rejects a false update result so finalization cannot continue", async () => {
    await expect(
      ensureSuccessfulReportUpdate(() => Promise.resolve(false)),
    ).rejects.toThrow("Échec de la mise à jour du rapport");
  });

  test("resolves after a successful update", async () => {
    await expect(
      ensureSuccessfulReportUpdate(() => Promise.resolve(true)),
    ).resolves.toBeUndefined();
  });
});

describe("runExclusiveReportSave", () => {
  test("rejects a concurrent caller while keeping one save in flight", async () => {
    let resolveSave: ((saved: boolean) => void) | undefined;
    const save = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          resolveSave = resolve;
        }),
    );
    const guard = { current: null as Promise<boolean> | null };

    const first = runExclusiveReportSave(guard, save);
    const second = runExclusiveReportSave(guard, save);
    resolveSave?.(true);

    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(false);
    expect(save).toHaveBeenCalledOnce();
    expect(guard.current).toBeNull();
  });
});

describe("getReportDraftRevision", () => {
  test("changes when professional content changes", () => {
    const draft = {
      title: "Compte rendu",
      observations: [],
      notes: "Note initiale",
      consultationReason: "Suivi",
      recommendations: [],
      anatomicalIssues: [],
      sectionStates: {
        clinical: "empty" as const,
        anatomical: "empty" as const,
        recommendations: "empty" as const,
        notes: "empty" as const,
      },
    };

    expect(getReportDraftRevision(draft)).not.toBe(
      getReportDraftRevision({ ...draft, notes: "Note modifiée" }),
    );
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
