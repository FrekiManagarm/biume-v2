import { describe, expect, it, vi } from "vitest";
import {
  createImmutableReportSharedVersion,
  type ReportSharedVersionPorts,
  type TenantOwnedReportForSharing,
} from "./report-shared-version.service";

const resolvedSectionStates = [
  { section: "clinical" as const, state: "confirmed" as const },
  { section: "anatomical" as const, state: "confirmed" as const },
  { section: "recommendations" as const, state: "confirmed" as const },
  { section: "notes" as const, state: "not_applicable" as const },
];

const report: TenantOwnedReportForSharing = {
  id: "report-1",
  revision: 2,
  status: "finalized",
  title: "Séance de Nox",
  consultationReason: "Mobilité réduite",
  notes: "Surveiller la récupération",
  patient: {
    id: "pet-1",
    name: "Nox",
    owner: { id: "owner-1", name: "Camille" },
  },
  anatomicalIssues: [
    {
      id: "obs-1",
      type: "observation",
      notes: "Raideur au démarrage",
      anatomicalPart: { name: "Épaule" },
    },
    {
      id: "issue-1",
      type: "dysfunction",
      notes: "Tension cervicale",
      anatomicalPart: { name: "Cervicales" },
    },
  ],
  recommendations: [{ id: "rec-1", recommendation: "Repos pendant 24 heures" }],
  ownerContents: [
    {
      sourceKind: "recommendation",
      sourceId: "rec-1",
      ownerText: "Laissez Nox se reposer pendant 24 heures.",
    },
  ],
  sectionStates: resolvedSectionStates,
};

const snapshot = {
  reportId: "report-1",
  reportRevision: 2,
  title: "Séance de Nox",
  animal: { id: "pet-1", name: "Nox" },
  owner: { id: "owner-1", name: "Camille" },
  consultationReason: "Mobilité réduite",
  clinical: ["Raideur au démarrage"],
  anatomical: ["Tension cervicale"],
  recommendations: ["Laissez Nox se reposer pendant 24 heures."],
  notes: "",
  createdAt: "2026-07-18T12:00:00.000Z",
};

const sharedVersion = {
  id: "shared-1",
  organizationId: "org-1",
  reportId: "report-1",
  reportRevision: 2,
  snapshot,
  createdAt: new Date("2026-07-18T12:00:00.000Z"),
};

function createPorts(
  overrides: Partial<ReportSharedVersionPorts> = {},
): ReportSharedVersionPorts {
  return {
    loadTenantOwnedReport: vi.fn(async () => report),
    findExistingVersion: vi.fn(async () => undefined),
    insertImmutableVersion: vi.fn(async () => sharedVersion),
    findVersionAfterConflict: vi.fn(async () => undefined),
    ...overrides,
  };
}

const request = {
  organizationId: "org-1",
  reportId: "report-1",
  createdAt: new Date("2026-07-18T12:00:00.000Z"),
};

const versionKey = {
  organizationId: "org-1",
  reportId: "report-1",
  reportRevision: 2,
};

describe("createImmutableReportSharedVersion", () => {
  it("rejects a foreign or missing tenant report before any version lookup or insert", async () => {
    const ports = createPorts({
      loadTenantOwnedReport: vi.fn(async () => undefined),
    });

    await expect(
      createImmutableReportSharedVersion(request, ports),
    ).rejects.toThrow("Rapport, animal ou propriétaire introuvable");

    expect(ports.loadTenantOwnedReport).toHaveBeenCalledOnce();
    expect(ports.loadTenantOwnedReport).toHaveBeenCalledWith({
      organizationId: "org-1",
      reportId: "report-1",
    });
    expect(ports.findExistingVersion).not.toHaveBeenCalled();
    expect(ports.insertImmutableVersion).not.toHaveBeenCalled();
    expect(ports.findVersionAfterConflict).not.toHaveBeenCalled();
  });

  it("rejects draft and unresolved reports before insert", async () => {
    const draftPorts = createPorts({
      loadTenantOwnedReport: vi.fn(async () => ({
        ...report,
        status: "draft" as const,
      })),
    });
    const unresolvedPorts = createPorts({
      loadTenantOwnedReport: vi.fn(async () => ({
        ...report,
        sectionStates: [
          ...resolvedSectionStates.slice(0, 3),
          {
            section: "notes" as const,
            state: "needs_confirmation" as const,
          },
        ],
      })),
    });

    await expect(
      createImmutableReportSharedVersion(request, draftPorts),
    ).rejects.toThrow("Le rapport doit être finalisé avant son partage");
    await expect(
      createImmutableReportSharedVersion(request, unresolvedPorts),
    ).rejects.toThrow("Le rapport doit être finalisé avant son partage");

    expect(draftPorts.insertImmutableVersion).not.toHaveBeenCalled();
    expect(unresolvedPorts.insertImmutableVersion).not.toHaveBeenCalled();
  });

  it("returns an existing exact version without inserting or mutating its snapshot", async () => {
    const immutableSnapshot = structuredClone(snapshot);
    const existing = { ...sharedVersion, snapshot: immutableSnapshot };
    const before = JSON.stringify(existing.snapshot);
    const ports = createPorts({
      findExistingVersion: vi.fn(async () => existing),
    });

    const result = await createImmutableReportSharedVersion(request, ports);

    expect(ports.findExistingVersion).toHaveBeenCalledWith(versionKey);
    expect(ports.insertImmutableVersion).not.toHaveBeenCalled();
    expect(ports.findVersionAfterConflict).not.toHaveBeenCalled();
    expect(result).toBe(existing);
    expect(JSON.stringify(existing.snapshot)).toBe(before);
  });

  it("inserts and returns a new immutable snapshot with exact tenant and revision scope", async () => {
    const ports = createPorts();

    const result = await createImmutableReportSharedVersion(request, ports);

    expect(ports.loadTenantOwnedReport).toHaveBeenCalledWith({
      organizationId: "org-1",
      reportId: "report-1",
    });
    expect(ports.findExistingVersion).toHaveBeenCalledWith(versionKey);
    expect(ports.insertImmutableVersion).toHaveBeenCalledOnce();
    expect(ports.insertImmutableVersion).toHaveBeenCalledWith({
      ...versionKey,
      snapshot,
    });
    expect(ports.findVersionAfterConflict).not.toHaveBeenCalled();
    expect(result).toBe(sharedVersion);
  });

  it("omits every not-applicable section from the owner snapshot without mutating practitioner notes", async () => {
    const professionalReport = structuredClone(report);
    professionalReport.sectionStates = [
      { section: "clinical", state: "not_applicable" },
      { section: "anatomical", state: "not_applicable" },
      { section: "recommendations", state: "not_applicable" },
      { section: "notes", state: "not_applicable" },
    ];
    const ports = createPorts({
      loadTenantOwnedReport: vi.fn(async () => professionalReport),
    });

    await createImmutableReportSharedVersion(request, ports);

    expect(ports.insertImmutableVersion).toHaveBeenCalledWith({
      ...versionKey,
      snapshot: {
        ...snapshot,
        consultationReason: "",
        clinical: [],
        anatomical: [],
        recommendations: [],
        notes: "",
      },
    });
    expect(professionalReport.consultationReason).toBe("Mobilité réduite");
    expect(professionalReport.notes).toBe("Surveiller la récupération");
    expect(professionalReport.anatomicalIssues).toHaveLength(2);
    expect(professionalReport.recommendations).toHaveLength(1);
  });

  it("uses a scoped fallback lookup after a simulated concurrent conflict", async () => {
    const winner = { ...sharedVersion, id: "shared-winner" };
    const ports = createPorts({
      insertImmutableVersion: vi.fn(async () => undefined),
      findVersionAfterConflict: vi.fn(async () => winner),
    });

    const result = await createImmutableReportSharedVersion(request, ports);

    expect(ports.findExistingVersion).toHaveBeenCalledWith(versionKey);
    expect(ports.insertImmutableVersion).toHaveBeenCalledWith({
      ...versionKey,
      snapshot,
    });
    expect(ports.findVersionAfterConflict).toHaveBeenCalledOnce();
    expect(ports.findVersionAfterConflict).toHaveBeenCalledWith(versionKey);
    expect(result).toBe(winner);
  });

  it("propagates insert failure without performing a conflict lookup", async () => {
    const failure = new Error("insert failed");
    const ports = createPorts({
      insertImmutableVersion: vi.fn(async () => {
        throw failure;
      }),
    });

    await expect(
      createImmutableReportSharedVersion(request, ports),
    ).rejects.toBe(failure);
    expect(ports.findVersionAfterConflict).not.toHaveBeenCalled();
  });

  it("rejects when a conflict fallback cannot find the persisted version", async () => {
    const ports = createPorts({
      insertImmutableVersion: vi.fn(async () => undefined),
      findVersionAfterConflict: vi.fn(async () => undefined),
    });

    await expect(
      createImmutableReportSharedVersion(request, ports),
    ).rejects.toThrow("Impossible de créer la version partagée");
    expect(ports.findVersionAfterConflict).toHaveBeenCalledWith(versionKey);
  });
});
