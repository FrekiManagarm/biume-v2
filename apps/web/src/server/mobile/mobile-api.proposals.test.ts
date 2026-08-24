import { reportProposalsResponseSchema } from "@biume/contracts/proposal";
import { describe, expect, it, vi } from "vitest";

import { createMobileApiHandler, type MobileApiPorts } from "./mobile-api";
import { MobileRequestError } from "./mobile-api.errors";

const proposals = {
  reportId: "report-1",
  transcript: "Filou présente une tension lombaire à droite.",
  items: [
    {
      id: "proposal-1",
      reportId: "report-1",
      section: "clinical" as const,
      kind: "observation" as const,
      text: "Tension lombaire droite",
      state: "proposed" as const,
      anchor: { start: 19, end: 44, quote: "tension lombaire à droite" },
      decidedAt: null,
    },
  ],
  sections: {
    clinical: "proposed" as const,
    anatomical: "empty" as const,
    recommendations: "empty" as const,
    notes: "empty" as const,
  },
};

function createPorts(overrides: Partial<MobileApiPorts> = {}): MobileApiPorts {
  return {
    authenticate: vi.fn(async () => ({
      userId: "user-1",
      organization: { id: "org-1", name: "Cabinet Biume" },
    })),
    getReportProposals: vi.fn(async () => proposals),
    decideProposal: vi.fn(async () => proposals),
    decideSection: vi.fn(async () => proposals),
    regenerateProposals: vi.fn(async () => proposals),
    ...overrides,
  } as unknown as MobileApiPorts;
}

const auth = { authorization: "Bearer jeton" };

function get(path: string) {
  return new Request(`https://biume.test/api/mobile/v1${path}`, {
    headers: auth,
  });
}

function post(path: string, body: unknown) {
  return new Request(`https://biume.test/api/mobile/v1${path}`, {
    method: "POST",
    headers: { ...auth, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("lecture des propositions", () => {
  it("retourne les propositions, la transcription et les états de section", async () => {
    const response = await createMobileApiHandler(createPorts())(
      get("/reports/report-1/proposals"),
    );

    expect(response.status).toBe(200);
    const parsed = reportProposalsResponseSchema.parse(await response.json());
    expect(parsed.items).toHaveLength(1);
    expect(parsed.sections.anatomical).toBe("empty");
  });

  /**
   * La transcription voyage avec les propositions pour que le mobile puisse
   * surligner la source sans second appel. C'est la traçabilité rendue visible.
   */
  it("transporte la transcription qui justifie les propositions", async () => {
    const response = await createMobileApiHandler(createPorts())(
      get("/reports/report-1/proposals"),
    );

    expect((await response.json()).transcript).toContain("tension lombaire");
  });

  it("retourne 404 pour un rapport d'une autre organisation", async () => {
    const ports = createPorts({ getReportProposals: vi.fn(async () => null) });
    const response = await createMobileApiHandler(ports)(
      get("/reports/report-autre/proposals"),
    );

    expect(response.status).toBe(404);
  });
});

describe("décision sur une proposition", () => {
  it("confirme une proposition", async () => {
    const ports = createPorts();
    const response = await createMobileApiHandler(ports)(
      post("/reports/report-1/proposals/proposal-1/decision", {
        state: "confirmed",
      }),
    );

    expect(response.status).toBe(200);
    expect(ports.decideProposal).toHaveBeenCalledWith(
      expect.anything(),
      "report-1",
      "proposal-1",
      { state: "confirmed" },
    );
  });

  it("marque une proposition sans objet", async () => {
    const response = await createMobileApiHandler(createPorts())(
      post("/reports/report-1/proposals/proposal-1/decision", {
        state: "not_applicable",
      }),
    );

    expect(response.status).toBe(200);
  });

  /**
   * Le mobile valide, il n'édite pas. Une charge portant un texte est un
   * dépassement du périmètre, et elle est rejetée plutôt qu'ignorée.
   */
  it("rejette une charge qui tenterait de réécrire le texte", async () => {
    const response = await createMobileApiHandler(createPorts())(
      post("/reports/report-1/proposals/proposal-1/decision", {
        state: "confirmed",
        text: "autre chose",
      }),
    );

    expect(response.status).toBe(400);
  });

  it("rejette un état qui n'est pas une décision", async () => {
    const response = await createMobileApiHandler(createPorts())(
      post("/reports/report-1/proposals/proposal-1/decision", {
        state: "proposed",
      }),
    );

    expect(response.status).toBe(400);
  });

  it("traduit une décision déjà prise en conflit", async () => {
    const ports = createPorts({
      decideProposal: vi.fn(async () => {
        throw new MobileRequestError("conflict");
      }),
    });
    const response = await createMobileApiHandler(ports)(
      post("/reports/report-1/proposals/proposal-1/decision", {
        state: "confirmed",
      }),
    );

    expect(response.status).toBe(409);
  });
});

describe("décision sur une section entière", () => {
  it("marque une section sans objet", async () => {
    const ports = createPorts();
    const response = await createMobileApiHandler(ports)(
      post("/reports/report-1/sections/anatomical/decision", {
        state: "not_applicable",
      }),
    );

    expect(response.status).toBe(200);
    expect(ports.decideSection).toHaveBeenCalledWith(
      expect.anything(),
      "report-1",
      "anatomical",
      { state: "not_applicable" },
    );
  });

  it("rejette une section inconnue", async () => {
    const response = await createMobileApiHandler(createPorts())(
      post("/reports/report-1/sections/inventee/decision", {
        state: "confirmed",
      }),
    );

    expect(response.status).toBe(400);
  });
});

describe("régénération", () => {
  it("est une action explicite du praticien", async () => {
    const ports = createPorts();
    const response = await createMobileApiHandler(ports)(
      post("/reports/report-1/proposals/regenerate", {}),
    );

    expect(response.status).toBe(200);
    expect(ports.regenerateProposals).toHaveBeenCalled();
  });
});
