import { finalizeReportResponseSchema } from "@biume/contracts/proposal";
import { describe, expect, it, vi } from "vitest";

import { createMobileApiHandler, type MobileApiPorts } from "./mobile-api";
import { MobileRequestError } from "./mobile-api.errors";

const finalized = {
  reportId: "report-1",
  status: "sent" as const,
  sentToOwner: true,
};

function createPorts(overrides: Partial<MobileApiPorts> = {}): MobileApiPorts {
  return {
    authenticate: vi.fn(async () => ({
      userId: "user-1",
      organization: { id: "org-1", name: "Cabinet Biume" },
    })),
    finalizeReport: vi.fn(async () => finalized),
    ...overrides,
  } as unknown as MobileApiPorts;
}

function post(path: string, body: unknown) {
  return new Request(`https://biume.test/api/mobile/v1${path}`, {
    method: "POST",
    headers: { authorization: "Bearer jeton", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("finalisation d'un compte rendu", () => {
  it("renvoie le rapport envoyé au propriétaire", async () => {
    const ports = createPorts();
    const response = await createMobileApiHandler(ports)(
      post("/reports/report-1/finalize", { sendToOwner: true }),
    );

    expect(response.status).toBe(200);
    const body = finalizeReportResponseSchema.parse(await response.json());
    expect(body).toEqual(finalized);
    expect(ports.finalizeReport).toHaveBeenCalledWith(
      { practitionerId: "user-1", organizationId: "org-1" },
      "report-1",
      { sendToOwner: true },
    );
  });

  it("refuse un corps sans intention d'envoi", async () => {
    const ports = createPorts();
    const response = await createMobileApiHandler(ports)(
      post("/reports/report-1/finalize", {}),
    );
    expect(response.status).toBe(400);
    expect(ports.finalizeReport).not.toHaveBeenCalled();
  });

  it("traduit une section encore à vérifier en requête invalide", async () => {
    const response = await createMobileApiHandler(
      createPorts({
        finalizeReport: vi.fn(async () => {
          throw new MobileRequestError("validation");
        }),
      }),
    )(post("/reports/report-1/finalize", { sendToOwner: true }));
    expect(response.status).toBe(400);
  });

  it("annonce 405 sur une méthode que la route ne sert pas", async () => {
    const response = await createMobileApiHandler(createPorts())(
      new Request("https://biume.test/api/mobile/v1/reports/report-1/finalize", {
        method: "GET",
        headers: { authorization: "Bearer jeton" },
      }),
    );
    expect(response.status).toBe(405);
  });

  it("ne laisse fuir aucun jeton de partage dans une erreur", async () => {
    const response = await createMobileApiHandler(
      createPorts({
        finalizeReport: vi.fn(async () => {
          throw new Error("insert into report_share_link token=jeton-secret");
        }),
      }),
    )(post("/reports/report-1/finalize", { sendToOwner: true }));

    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("jeton-secret");
  });
});
