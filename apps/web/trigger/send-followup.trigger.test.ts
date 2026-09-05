import { describe, expect, it, vi } from "vitest";

import { runFollowUpBatch, type FollowUpBatchDeps } from "./send-followup.trigger";

const now = new Date("2026-08-21T10:00:00.000Z");

type Mocked = {
  claimDue: ReturnType<typeof vi.fn>;
  sendEmail: ReturnType<typeof vi.fn>;
  markSent: ReturnType<typeof vi.fn>;
  markFailed: ReturnType<typeof vi.fn>;
};

function createDeps(overrides: Partial<Mocked> = {}): FollowUpBatchDeps & Mocked {
  return {
    claimDue: vi.fn(async () => [
      { id: "followup-1", shareToken: "jeton-1", ownerEmail: "a@example.test" },
    ]),
    sendEmail: vi.fn(async () => {}),
    markSent: vi.fn(async () => {}),
    markFailed: vi.fn(async () => {}),
    now: () => now,
    ...overrides,
  } as unknown as FollowUpBatchDeps & Mocked;
}

describe("envoi des suivis à échéance", () => {
  it("envoie et marque envoyé", async () => {
    const deps = createDeps();

    expect(await runFollowUpBatch(deps)).toEqual({ sent: 1, failed: 0 });
    expect(deps.markSent).toHaveBeenCalledWith("followup-1", now);
  });

  /**
   * La réclamation est atomique côté base. Sans elle, deux exécutions
   * concurrentes enverraient deux courriels au même propriétaire.
   */
  it("n'envoie rien quand rien n'est réclamé", async () => {
    const deps = createDeps({ claimDue: vi.fn(async () => []) });

    expect(await runFollowUpBatch(deps)).toEqual({ sent: 0, failed: 0 });
    expect(deps.sendEmail).not.toHaveBeenCalled();
  });

  it("n'envoie pas à un propriétaire sans adresse", async () => {
    const deps = createDeps({
      claimDue: vi.fn(async () => [
        { id: "followup-1", shareToken: "jeton-1", ownerEmail: null },
      ]),
    });

    await runFollowUpBatch(deps);

    expect(deps.sendEmail).not.toHaveBeenCalled();
    expect(deps.markFailed).toHaveBeenCalledWith("followup-1", "no_owner_email");
  });

  it("isole l'échec d'un envoi des autres", async () => {
    const deps = createDeps({
      claimDue: vi.fn(async () => [
        { id: "followup-1", shareToken: "jeton-1", ownerEmail: "a@example.test" },
        { id: "followup-2", shareToken: "jeton-2", ownerEmail: "b@example.test" },
      ]),
      sendEmail: vi
        .fn()
        .mockRejectedValueOnce(new Error("smtp 550 mailbox unavailable"))
        .mockResolvedValueOnce(undefined),
    });

    expect(await runFollowUpBatch(deps)).toEqual({ sent: 1, failed: 1 });
  });

  it("ne persiste pas le message d'erreur du fournisseur", async () => {
    const deps = createDeps({
      sendEmail: vi.fn(async () => {
        throw new Error("smtp 550 mailbox unavailable for a@example.test");
      }),
    });

    await runFollowUpBatch(deps);
    const [, code] = deps.markFailed.mock.calls[0];

    expect(code).not.toContain("@");
    expect(code).not.toContain("550");
  });
});
