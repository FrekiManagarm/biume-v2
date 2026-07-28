import { describe, expect, it, vi } from "vitest";

import {
  QUICK_REPORT_IDEMPOTENCY_CONFLICT_MESSAGE,
  createIdempotentQuickReport,
  createQuickReportFingerprint,
  type QuickReportCreationPorts,
} from "./quick-report.service";

const input = {
  clientRequestId: "123e4567-e89b-42d3-a456-426614174000",
  ownerName: "Camille",
  ownerEmail: "camille@example.com",
  animalName: "Nox",
  title: "Nouveau rapport",
  consultationReason: "Suivi",
};

const request = { organizationId: "org-1", input };

describe("idempotent quick report creation", () => {
  it("returns the first report for an identical retry without creating new rows", async () => {
    const requestFingerprint = await createQuickReportFingerprint(input);
    const existing = {
      reportId: "report-1",
      requestFingerprint,
    };
    const ports: QuickReportCreationPorts = {
      findByKey: vi.fn(async () => existing),
      createAtomic: vi.fn(),
      findAfterConflict: vi.fn(),
    };

    await expect(createIdempotentQuickReport(request, ports)).resolves.toEqual({
      reportId: "report-1",
      status: "draft",
    });
    expect(ports.findByKey).toHaveBeenCalledWith({
      organizationId: "org-1",
      clientRequestId: input.clientRequestId,
    });
    expect(ports.createAtomic).not.toHaveBeenCalled();
  });

  it("refuses reuse of a tenant request key with incompatible input", async () => {
    const ports: QuickReportCreationPorts = {
      findByKey: vi.fn(async () => ({
        reportId: "report-1",
        requestFingerprint: "different-fingerprint",
      })),
      createAtomic: vi.fn(),
      findAfterConflict: vi.fn(),
    };

    await expect(createIdempotentQuickReport(request, ports)).rejects.toThrow(
      QUICK_REPORT_IDEMPOTENCY_CONFLICT_MESSAGE,
    );
    expect(ports.createAtomic).not.toHaveBeenCalled();
  });

  it("recovers the compatible winner after a concurrent unique-key conflict", async () => {
    const requestFingerprint = await createQuickReportFingerprint(input);
    const uniqueConflict = new Error("unique violation");
    const ports: QuickReportCreationPorts = {
      findByKey: vi.fn(async () => undefined),
      createAtomic: vi.fn(async () => {
        throw uniqueConflict;
      }),
      findAfterConflict: vi.fn(async () => ({
        reportId: "winner-report",
        requestFingerprint,
      })),
    };

    await expect(createIdempotentQuickReport(request, ports)).resolves.toEqual({
      reportId: "winner-report",
      status: "draft",
    });
    expect(ports.findAfterConflict).toHaveBeenCalledWith({
      organizationId: "org-1",
      clientRequestId: input.clientRequestId,
    });
  });

  it("rethrows a creation failure when no concurrent winner exists", async () => {
    const failure = new Error("database unavailable");
    const ports: QuickReportCreationPorts = {
      findByKey: vi.fn(async () => undefined),
      createAtomic: vi.fn(async () => {
        throw failure;
      }),
      findAfterConflict: vi.fn(async () => undefined),
    };

    await expect(createIdempotentQuickReport(request, ports)).rejects.toBe(
      failure,
    );
  });

  it("creates a stable fingerprint from normalized semantic input", async () => {
    await expect(createQuickReportFingerprint(input)).resolves.toBe(
      await createQuickReportFingerprint({ ...input }),
    );
    await expect(
      createQuickReportFingerprint({ ...input, animalName: "Moka" }),
    ).resolves.not.toBe(await createQuickReportFingerprint(input));
  });

  it("separates two requests that differ only by species or breed", async () => {
    await expect(
      createQuickReportFingerprint({ ...input, animalType: "species-dog" }),
    ).resolves.not.toBe(await createQuickReportFingerprint(input));
    await expect(
      createQuickReportFingerprint({
        ...input,
        animalBreed: "Berger australien",
      }),
    ).resolves.not.toBe(await createQuickReportFingerprint(input));
  });

  it("treats an omitted and a whitespace-only breed as the same request", async () => {
    await expect(
      createQuickReportFingerprint({ ...input, animalBreed: "   " }),
    ).resolves.toBe(await createQuickReportFingerprint(input));
  });
});
