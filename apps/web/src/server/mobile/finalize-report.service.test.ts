import { describe, expect, it, vi } from "vitest";

import { MobileRequestError } from "./mobile-api.errors";
import { finalizeReport, type FinalizeReportPorts } from "./finalize-report.service";

const now = new Date("2026-09-03T10:00:00.000Z");

function report(overrides: Partial<Awaited<ReturnType<FinalizeReportPorts["loadReport"]>>> = {}) {
  return {
    id: "report-1",
    status: "draft" as const,
    sectionStates: [
      { section: "clinical" as const, state: "confirmed" as const },
      { section: "anatomical" as const, state: "not_applicable" as const },
      { section: "recommendations" as const, state: "confirmed" as const },
      { section: "notes" as const, state: "not_applicable" as const },
    ],
    patient: {
      name: "Filou",
      owner: { id: "owner-1", name: "Camille Roux", email: "camille@example.org" },
    },
    ...overrides,
  };
}

function createPorts(overrides: Partial<FinalizeReportPorts> = {}): FinalizeReportPorts {
  return {
    loadReport: vi.fn(async () => report()),
    markStatus: vi.fn(async () => {}),
    createSharedVersion: vi.fn(async () => ({ id: "version-1" })),
    findActiveLink: vi.fn(async () => null),
    insertLink: vi.fn(async () => {}),
    generateToken: vi.fn(() => "jeton-secret"),
    sendEmail: vi.fn(async () => {}),
    ...overrides,
  };
}

const request = { organizationId: "org-1", reportId: "report-1", sendToOwner: true, now };

describe("finaliser et partager", () => {
  it("finalise, fige, lie, envoie, puis marque envoyé", async () => {
    const ports = createPorts();
    const result = await finalizeReport(request, ports);

    expect(ports.markStatus).toHaveBeenNthCalledWith(1, { organizationId: "org-1", reportId: "report-1" }, "finalized", now);
    expect(ports.createSharedVersion).toHaveBeenCalled();
    expect(ports.insertLink).toHaveBeenCalledWith({ token: "jeton-secret", sharedVersionId: "version-1", ownerId: "owner-1" });
    expect(ports.sendEmail).toHaveBeenCalledWith({
      to: "camille@example.org",
      clientName: "Camille Roux",
      petName: "Filou",
      reportDate: "3 septembre 2026",
      token: "jeton-secret",
      idempotencyKey: "report-1:version-1",
    });
    expect(ports.markStatus).toHaveBeenNthCalledWith(2, { organizationId: "org-1", reportId: "report-1" }, "sent", now);
    expect(result).toEqual({ reportId: "report-1", status: "sent", sentToOwner: true });
  });

  it("refuse un rapport dont une section reste à vérifier", async () => {
    const ports = createPorts({
      loadReport: vi.fn(async () =>
        report({
          sectionStates: [
            { section: "clinical", state: "proposed" },
            { section: "anatomical", state: "not_applicable" },
            { section: "recommendations", state: "confirmed" },
            { section: "notes", state: "not_applicable" },
          ],
        }),
      ),
    });
    await expect(finalizeReport(request, ports)).rejects.toMatchObject({ code: "validation" });
    expect(ports.markStatus).not.toHaveBeenCalled();
  });

  it("finalise sans envoyer quand le praticien l'a demandé", async () => {
    const ports = createPorts();
    const result = await finalizeReport({ ...request, sendToOwner: false }, ports);
    expect(ports.sendEmail).not.toHaveBeenCalled();
    expect(result).toEqual({ reportId: "report-1", status: "finalized", sentToOwner: false });
  });

  it("n'envoie pas sans adresse, même si l'envoi est demandé", async () => {
    const ports = createPorts({
      loadReport: vi.fn(async () =>
        report({ patient: { name: "Filou", owner: { id: "owner-1", name: "Camille Roux", email: null } } }),
      ),
    });
    const result = await finalizeReport(request, ports);
    expect(ports.sendEmail).not.toHaveBeenCalled();
    expect(result.sentToOwner).toBe(false);
  });

  it("réutilise le lien actif au lieu d'en créer un second", async () => {
    const ports = createPorts({ findActiveLink: vi.fn(async () => ({ token: "existant" })) });
    await finalizeReport(request, ports);
    expect(ports.insertLink).not.toHaveBeenCalled();
    expect(ports.sendEmail).toHaveBeenCalledWith(expect.objectContaining({ token: "existant" }));
  });

  it("ne repasse pas un rapport déjà envoyé en finalisé", async () => {
    const ports = createPorts({ loadReport: vi.fn(async () => report({ status: "sent" })) });
    await finalizeReport({ ...request, sendToOwner: false }, ports);
    expect(ports.markStatus).not.toHaveBeenCalledWith(expect.anything(), "finalized", expect.anything());
  });

  it("n'envoie pas sur une adresse vide", async () => {
    const ports = createPorts({
      loadReport: vi.fn(async () =>
        report({ patient: { name: "Filou", owner: { id: "owner-1", name: "Camille Roux", email: "   " } } }),
      ),
    });
    const result = await finalizeReport(request, ports);
    expect(ports.sendEmail).not.toHaveBeenCalled();
    expect(result.sentToOwner).toBe(false);
  });

  /**
   * Le cas le plus coûteux : un praticien qui appuie deux fois. Le second geste
   * ne doit rien renvoyer, et ne doit pas frapper un second jeton sur la même
   * version figée — sinon un secret vivant resterait ouvert sur le
   * propriétaire sans lui avoir jamais été transmis.
   */
  it("ne renvoie rien sur un rapport déjà envoyé, même si l'envoi est demandé", async () => {
    const ports = createPorts({
      loadReport: vi.fn(async () => report({ status: "sent" })),
      findActiveLink: vi.fn(async () => ({ token: "jeton-du-premier-envoi" })),
    });
    const result = await finalizeReport(request, ports);

    expect(ports.sendEmail).not.toHaveBeenCalled();
    expect(ports.generateToken).not.toHaveBeenCalled();
    expect(ports.insertLink).not.toHaveBeenCalled();
    expect(result).toEqual({ reportId: "report-1", status: "sent", sentToOwner: false });
  });

  /**
   * « Finaliser sans envoyer » doit laisser un lien derrière lui : c'est ce
   * lien que le suivi lit pour se programmer, et c'est par lui que le
   * praticien enverra le compte rendu depuis le web une fois l'adresse
   * complétée. Sans lui, l'écran de suivi n'a plus qu'une issue : « Pas de
   * suivi pour cette séance ».
   */
  it("frappe le lien même quand rien n'est envoyé", async () => {
    const ports = createPorts();
    const result = await finalizeReport({ ...request, sendToOwner: false }, ports);

    expect(ports.insertLink).toHaveBeenCalledWith({
      token: "jeton-secret",
      sharedVersionId: "version-1",
      ownerId: "owner-1",
    });
    expect(ports.sendEmail).not.toHaveBeenCalled();
    expect(result).toEqual({ reportId: "report-1", status: "finalized", sentToOwner: false });
  });

  it("frappe le lien quand le propriétaire n'a pas d'adresse", async () => {
    const ports = createPorts({
      loadReport: vi.fn(async () =>
        report({ patient: { name: "Filou", owner: { id: "owner-1", name: "Camille Roux", email: null } } }),
      ),
    });
    await finalizeReport(request, ports);

    expect(ports.insertLink).toHaveBeenCalledTimes(1);
    expect(ports.sendEmail).not.toHaveBeenCalled();
  });

  /**
   * La garde qui tient : un lien par version figée, pas un par exécution. La
   * version est idempotente sur la révision du rapport, donc rappeler
   * `finalize` sans rien changer retombe sur la même version, dont le lien
   * existe déjà.
   */
  it("n'accumule pas de jeton quand le praticien finalise deux fois", async () => {
    const links = new Map<string, string>();
    let minted = 0;
    const ports = createPorts({
      findActiveLink: vi.fn(async ({ sharedVersionId, ownerId }) => {
        const token = links.get(`${sharedVersionId}:${ownerId}`);
        return token ? { token } : null;
      }),
      insertLink: vi.fn(async ({ token, sharedVersionId, ownerId }) => {
        links.set(`${sharedVersionId}:${ownerId}`, token);
      }),
      generateToken: vi.fn(() => `jeton-${++minted}`),
    });

    await finalizeReport({ ...request, sendToOwner: false }, ports);
    await finalizeReport({ ...request, sendToOwner: false }, ports);
    await finalizeReport({ ...request, sendToOwner: false }, ports);

    expect(ports.insertLink).toHaveBeenCalledTimes(1);
    expect(links.size).toBe(1);
  });

  it("refuse un rapport sans propriétaire", async () => {
    const ports = createPorts({ loadReport: vi.fn(async () => report({ patient: null })) });
    await expect(finalizeReport(request, ports)).rejects.toBeInstanceOf(MobileRequestError);
  });
});
