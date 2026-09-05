import { describe, expect, it, vi } from "vitest";

import {
  startOrganizationTrial,
  TRIAL_DURATION_DAYS,
  type StartOrganizationTrialDeps,
} from "./start-trial";
import { autumnPlanIds } from "#/lib/constants/autumn-ids";

const now = new Date("2026-09-01T10:00:00.000Z");

function createDeps(
  overrides: Partial<StartOrganizationTrialDeps> = {},
): StartOrganizationTrialDeps {
  return {
    upsertCustomer: vi.fn(async () => {}),
    attachPlan: vi.fn(async () => {}),
    triggerTrialEmails: vi.fn(async () => {}),
    now: () => now,
    ...overrides,
  };
}

const input = {
  organizationId: "org-1",
  organizationName: "Clinique Test",
  ownerEmail: "owner@example.test",
  ownerUserId: "user-1",
};

describe("démarrage de l'essai Autumn", () => {
  it("crée/aligne le customer puis attache le plan mensuel", async () => {
    const deps = createDeps();

    await startOrganizationTrial(deps, input);

    expect(deps.upsertCustomer).toHaveBeenCalledWith({
      customerId: "org-1",
      name: "Clinique Test",
      email: "owner@example.test",
      metadata: { organizationId: "org-1", ownerUserId: "user-1" },
    });
    expect(deps.attachPlan).toHaveBeenCalledWith({
      customerId: "org-1",
      planId: autumnPlanIds.allInclusiveMonthly,
    });
  });

  it("calcule trialEnd à 15 jours de trialStart", async () => {
    const deps = createDeps();

    const result = await startOrganizationTrial(deps, input);

    expect(result.trialStart).toBe(now.toISOString());
    const expectedEnd = new Date(
      now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000,
    );
    expect(result.trialEnd).toBe(expectedEnd.toISOString());
    expect(deps.triggerTrialEmails).toHaveBeenCalledWith({
      organizationId: "org-1",
      organizationName: "Clinique Test",
      organizationEmail: "owner@example.test",
      trialStart: now.toISOString(),
      trialEnd: expectedEnd.toISOString(),
    });
  });

  /**
   * L'attach a déjà réussi : un échec d'envoi d'email ne doit pas faire
   * échouer le démarrage d'essai lui-même (isolation, cf. runFollowUpBatch).
   */
  it("isole un échec de triggerTrialEmails sans relancer d'erreur", async () => {
    const deps = createDeps({
      triggerTrialEmails: vi.fn(async () => {
        throw new Error("trigger.dev indisponible");
      }),
    });

    await expect(startOrganizationTrial(deps, input)).resolves.toEqual({
      trialStart: now.toISOString(),
      trialEnd: new Date(
        now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000,
      ).toISOString(),
    });
  });

  it("propage un échec d'attachPlan (bloquant, contrairement aux emails)", async () => {
    const deps = createDeps({
      attachPlan: vi.fn(async () => {
        throw new Error("Autumn indisponible");
      }),
    });

    await expect(startOrganizationTrial(deps, input)).rejects.toThrow(
      "Autumn indisponible",
    );
  });
});
