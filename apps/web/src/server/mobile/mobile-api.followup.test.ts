import {
  actionableFollowUpsResponseSchema,
  defaultFollowUpQuestionnaire,
  followUpSchema,
} from "@biume/contracts/followup";
import { describe, expect, it, vi } from "vitest";

import { createMobileApiHandler, type MobileApiPorts } from "./mobile-api";
import { MobileRequestError } from "./mobile-api.errors";

const followUp = {
  id: "followup-1",
  reportId: "report-1",
  patientName: "Filou",
  ownerName: "Camille Roux",
  status: "answered" as const,
  dueAt: "2026-08-28T09:00:00.000Z",
  answeredAt: "2026-08-28T18:00:00.000Z",
  answer: { evolution: "worse" as const, reaction: "", wantsContact: true },
  alertReasons: ["declared_worsening" as const, "contact_requested" as const],
  handledAt: null,
  ownerPhone: "+33600000000",
  ownerEmail: "camille.roux@example.test",
  patientId: "pet-1",
};

function createPorts(overrides: Partial<MobileApiPorts> = {}): MobileApiPorts {
  return {
    authenticate: vi.fn(async () => ({
      userId: "user-1",
      organization: { id: "org-1", name: "Cabinet Biume" },
    })),
    scheduleFollowUp: vi.fn(async () => ({
      ...followUp,
      status: "scheduled" as const,
      answeredAt: null,
      answer: null,
      alertReasons: [],
    })),
    listActionableFollowUps: vi.fn(async () => ({
      items: [followUp],
      nextCursor: null,
    })),
    markFollowUpHandled: vi.fn(async () => ({
      ...followUp,
      handledAt: "2026-08-29T08:00:00.000Z",
    })),
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

const inDays = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

describe("programmation du suivi", () => {
  it("programme un suivi à l'échéance choisie", async () => {
    const ports = createPorts();
    const response = await createMobileApiHandler(ports)(
      post("/reports/report-1/followup", {
        dueAt: inDays(7),
        questionnaire: defaultFollowUpQuestionnaire,
      }),
    );

    expect(response.status).toBe(201);
    expect(followUpSchema.parse(await response.json()).status).toBe("scheduled");
  });

  it("accepte un questionnaire modifié par le praticien", async () => {
    const response = await createMobileApiHandler(createPorts())(
      post("/reports/report-1/followup", {
        dueAt: inDays(10),
        questionnaire: {
          questions: defaultFollowUpQuestionnaire.questions.map((question) =>
            question.kind === "text"
              ? { ...question, label: "Autre chose à signaler ?" }
              : question,
          ),
        },
      }),
    );

    expect(response.status).toBe(201);
  });

  it("rejette un questionnaire qui n'a pas trois questions", async () => {
    const response = await createMobileApiHandler(createPorts())(
      post("/reports/report-1/followup", {
        dueAt: inDays(7),
        questionnaire: {
          questions: [defaultFollowUpQuestionnaire.questions[0]],
        },
      }),
    );

    expect(response.status).toBe(400);
  });

  /**
   * Un questionnaire envoyé le lendemain d'une séance ne mesure rien. Le
   * plancher est métier, et il est appliqué côté serveur, pas seulement dans
   * l'interface.
   */
  it("refuse une échéance à moins de trois jours", async () => {
    const ports = createPorts({
      scheduleFollowUp: vi.fn(async () => {
        throw new MobileRequestError("validation");
      }),
    });
    const response = await createMobileApiHandler(ports)(
      post("/reports/report-1/followup", {
        dueAt: inDays(1),
        questionnaire: defaultFollowUpQuestionnaire,
      }),
    );

    expect(response.status).toBe(400);
  });

  /**
   * Un rapport en brouillon n'a pas de version figée, donc pas de lien : le
   * propriétaire recevrait un questionnaire sur un document qu'il n'a jamais
   * reçu.
   */
  it("refuse de programmer sur un rapport en brouillon", async () => {
    const ports = createPorts({
      scheduleFollowUp: vi.fn(async () => {
        throw new MobileRequestError("conflict");
      }),
    });
    const response = await createMobileApiHandler(ports)(
      post("/reports/report-1/followup", {
        dueAt: inDays(7),
        questionnaire: defaultFollowUpQuestionnaire,
      }),
    );

    expect(response.status).toBe(409);
  });

  it("refuse de programmer sur un rapport d'une autre organisation", async () => {
    const ports = createPorts({
      scheduleFollowUp: vi.fn(async () => {
        throw new MobileRequestError("not_found");
      }),
    });
    const response = await createMobileApiHandler(ports)(
      post("/reports/report-autre/followup", {
        dueAt: inDays(7),
        questionnaire: defaultFollowUpQuestionnaire,
      }),
    );

    expect(response.status).toBe(404);
  });
});

describe("suivis actionnables", () => {
  it("ne retourne que des réponses arrivées, alertées et non traitées", async () => {
    const response = await createMobileApiHandler(createPorts())(
      get("/followups/actionable"),
    );

    expect(response.status).toBe(200);
    const parsed = actionableFollowUpsResponseSchema.parse(
      await response.json(),
    );
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0].handledAt).toBeNull();
    expect(parsed.items[0].alertReasons.length).toBeGreaterThan(0);
  });

  it("borne la page à cinquante", async () => {
    const ports = createPorts();
    await createMobileApiHandler(ports)(get("/followups/actionable?limit=5000"));

    expect(ports.listActionableFollowUps).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ limit: 50 }),
    );
  });

  it("marque un suivi traité", async () => {
    const ports = createPorts();
    const response = await createMobileApiHandler(ports)(
      post("/followups/followup-1/handled", {}),
    );

    expect(response.status).toBe(200);
    expect(followUpSchema.parse(await response.json()).handledAt).not.toBeNull();
  });

  it("refuse un suivi d'une autre organisation", async () => {
    const ports = createPorts({
      markFollowUpHandled: vi.fn(async () => {
        throw new MobileRequestError("not_found");
      }),
    });
    const response = await createMobileApiHandler(ports)(
      post("/followups/followup-autre/handled", {}),
    );

    expect(response.status).toBe(404);
  });
});
