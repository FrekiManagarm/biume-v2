import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
  saveOwnerContentWithRevision,
  type OwnerContentRevisionPort,
} from "./report-owner-content.service";

const savedOwnerContent = {
  id: "owner-content-1",
  reportId: "report-1",
  sourceKind: "recommendation" as const,
  sourceId: "rec-1",
  ownerText: "Laisser Nox se reposer.",
  sourceFingerprint: "fingerprint-1",
  createdAt: new Date("2026-07-18T10:00:00.000Z"),
  updatedAt: new Date("2026-07-18T11:00:00.000Z"),
};

const writeInput = {
  organizationId: "org-1",
  reportId: "report-1",
  ownerContent: {
    reportId: "report-1",
    sourceKind: "recommendation" as const,
    sourceId: "rec-1",
    ownerText: "Laisser Nox se reposer.",
    sourceFingerprint: "fingerprint-1",
    updatedAt: new Date("2026-07-18T11:00:00.000Z"),
  },
};

describe("owner-content mutation", () => {
  it("delivers owner-content upsert and tenant revision operations once", async () => {
    const persist = vi.fn(async () => savedOwnerContent);
    const port: OwnerContentRevisionPort = { persist };

    const saved = await saveOwnerContentWithRevision(writeInput, port);

    expect(persist).toHaveBeenCalledOnce();
    expect(persist).toHaveBeenCalledWith({
      organizationId: "org-1",
      reportId: "report-1",
      ownerContent: {
        operation: "upsert",
        values: writeInput.ownerContent,
      },
      reportRevision: {
        operation: "increment",
        by: 1,
        updatedAt: writeInput.ownerContent.updatedAt,
      },
    });
    expect(saved).toBe(savedOwnerContent);
  });

  it("propagates atomic persistence failure without returning success", async () => {
    const failure = new Error("batch failed");
    const port: OwnerContentRevisionPort = {
      persist: vi.fn(async () => {
        throw failure;
      }),
    };

    await expect(saveOwnerContentWithRevision(writeInput, port)).rejects.toBe(
      failure,
    );
  });

  it("rejects a batch result without saved owner content", async () => {
    const port: OwnerContentRevisionPort = {
      persist: vi.fn(async () => undefined),
    };

    await expect(
      saveOwnerContentWithRevision(writeInput, port),
    ).rejects.toThrow("Impossible d’enregistrer la version propriétaire");
  });

  it("scopes the revision increment to the tenant-owned report", () => {
    const source = readFileSync(
      new URL("./report-owner-content.function.ts", import.meta.url),
      "utf8",
    );

    expect(source).toContain("db.batch");
    expect(source).toContain("revision: sql`${advancedReport.revision} + 1`");
    expect(source).toContain("eq(advancedReport.createdBy, organizationId)");
    expect(source).toContain("organizationId: organization.id");
    expect(source).toContain("reportId: data.reportId");
  });
});
