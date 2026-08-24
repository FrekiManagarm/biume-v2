import { moveAppointmentResponseSchema } from "@biume/contracts/mobile-records";
import { describe, expect, it, vi } from "vitest";

import { createMobileApiHandler, type MobileApiPorts } from "./mobile-api";
import { MobileRequestError } from "./mobile-api.errors";

const moved = {
  appointmentId: "appointment-1",
  beginAt: "2026-08-21T14:00:00.000Z",
  endAt: "2026-08-21T15:00:00.000Z",
  conflicts: [],
};

function createPorts(overrides: Partial<MobileApiPorts> = {}): MobileApiPorts {
  return {
    authenticate: vi.fn(async () => ({
      userId: "user-1",
      organization: { id: "org-1", name: "Cabinet Biume" },
    })),
    moveAppointment: vi.fn(async () => moved),
    ...overrides,
  } as unknown as MobileApiPorts;
}

function move(body: unknown, appointmentId = "appointment-1") {
  return new Request(
    `https://biume.test/api/mobile/v1/appointments/${appointmentId}/move`,
    {
      method: "POST",
      headers: {
        authorization: "Bearer jeton",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
}

const slot = {
  beginAt: "2026-08-21T14:00:00.000Z",
  endAt: "2026-08-21T15:00:00.000Z",
};

describe("déplacement d'un rendez-vous", () => {
  it("déplace et retourne le créneau appliqué", async () => {
    const response = await createMobileApiHandler(createPorts())(move(slot));

    expect(response.status).toBe(200);
    expect(moveAppointmentResponseSchema.parse(await response.json())).toEqual(
      moved,
    );
  });

  /**
   * Le chevauchement informe, il ne bloque pas. Un praticien qui superpose deux
   * séances au même endroit sait ce qu'il fait ; l'empêcher serait une décision
   * prise à sa place.
   */
  it("aboutit malgré un chevauchement et le signale", async () => {
    const ports = createPorts({
      moveAppointment: vi.fn(async () => ({
        ...moved,
        conflicts: [
          {
            appointmentId: "appointment-2",
            beginAt: "2026-08-21T14:30:00.000Z",
            patientName: "Filou",
          },
        ],
      })),
    });
    const response = await createMobileApiHandler(ports)(move(slot));

    expect(response.status).toBe(200);
    expect((await response.json()).conflicts).toHaveLength(1);
  });

  it("rejette une fin antérieure au début", async () => {
    const response = await createMobileApiHandler(createPorts())(
      move({ beginAt: slot.endAt, endAt: slot.beginAt }),
    );

    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe("validation");
  });

  it("traduit un rendez-vous introuvable en 404", async () => {
    const ports = createPorts({
      moveAppointment: vi.fn(async () => {
        throw new MobileRequestError("not_found");
      }),
    });
    const response = await createMobileApiHandler(ports)(move(slot));

    expect(response.status).toBe(404);
  });

  it("ne laisse fuir aucun détail technique sur erreur interne", async () => {
    const ports = createPorts({
      moveAppointment: vi.fn(async () => {
        throw new Error('relation "appointments" does not exist');
      }),
    });
    const response = await createMobileApiHandler(ports)(move(slot));

    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("relation");
  });
});
