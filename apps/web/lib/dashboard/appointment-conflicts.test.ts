import { describe, expect, it } from "vitest";

import {
  conflictWarning,
  findAppointmentConflicts,
  overlaps,
  type ConflictCandidate,
} from "./appointment-conflicts";

const at = (hour: number, minute = 0) =>
  new Date(2026, 7, 21, hour, minute, 0, 0);

const candidate = (
  overrides: Partial<ConflictCandidate> = {},
): ConflictCandidate => ({
  id: "rdv-1",
  beginAt: at(10),
  endAt: at(11),
  status: "CONFIRMED",
  patientName: "Filou",
  ...overrides,
});

describe("overlaps", () => {
  it("reconnaît un chevauchement partiel par la fin", () => {
    expect(
      overlaps(
        { beginAt: at(9), endAt: at(10, 30) },
        { beginAt: at(10), endAt: at(11) },
      ),
    ).toBe(true);
  });

  it("reconnaît un créneau entièrement contenu", () => {
    expect(
      overlaps(
        { beginAt: at(10, 15), endAt: at(10, 45) },
        { beginAt: at(10), endAt: at(11) },
      ),
    ).toBe(true);
  });

  /**
   * Deux séances qui se touchent ne se chevauchent pas : un praticien qui
   * enchaîne un rendez-vous à 11h après un rendez-vous qui finit à 11h ne fait
   * rien d'anormal, et l'avertir serait du bruit.
   */
  it("ne signale pas deux créneaux qui se touchent", () => {
    expect(
      overlaps(
        { beginAt: at(11), endAt: at(12) },
        { beginAt: at(10), endAt: at(11) },
      ),
    ).toBe(false);
  });

  it("ne signale pas deux créneaux disjoints", () => {
    expect(
      overlaps(
        { beginAt: at(14), endAt: at(15) },
        { beginAt: at(10), endAt: at(11) },
      ),
    ).toBe(false);
  });
});

describe("findAppointmentConflicts", () => {
  it("ignore une séance annulée", () => {
    const conflicts = findAppointmentConflicts({
      beginAt: at(10, 30),
      endAt: at(11, 30),
      candidates: [candidate({ status: "CANCELLED" })],
    });

    expect(conflicts).toEqual([]);
  });

  it("ignore le rendez-vous en cours de modification", () => {
    const conflicts = findAppointmentConflicts({
      beginAt: at(10, 30),
      endAt: at(11, 30),
      excludeAppointmentId: "rdv-1",
      candidates: [candidate()],
    });

    expect(conflicts).toEqual([]);
  });

  it("accepte des dates transmises en chaîne ISO", () => {
    const conflicts = findAppointmentConflicts({
      beginAt: at(10, 30),
      endAt: at(11, 30),
      candidates: [
        candidate({
          beginAt: at(10).toISOString(),
          endAt: at(11).toISOString(),
        }),
      ],
    });

    expect(conflicts).toHaveLength(1);
  });

  it("retourne les conflits du plus tôt au plus tard", () => {
    const conflicts = findAppointmentConflicts({
      beginAt: at(9),
      endAt: at(13),
      candidates: [
        candidate({ id: "tard", beginAt: at(12), endAt: at(12, 30) }),
        candidate({ id: "tot", beginAt: at(9, 30), endAt: at(10) }),
      ],
    });

    expect(conflicts.map((conflict) => conflict.id)).toEqual(["tot", "tard"]);
  });
});

describe("conflictWarning", () => {
  it("ne dit rien quand il n'y a pas de conflit", () => {
    expect(conflictWarning([])).toBeNull();
  });

  it("nomme l'animal quand un seul créneau se chevauche", () => {
    expect(conflictWarning([candidate()])).toBe(
      "Ce créneau chevauche la séance de Filou à 10:00.",
    );
  });

  it("reste lisible quand l'animal n'a pas de nom", () => {
    expect(conflictWarning([candidate({ patientName: null })])).toBe(
      "Ce créneau chevauche une séance à 10:00.",
    );
  });

  it("compte les créneaux quand il y en a plusieurs", () => {
    expect(
      conflictWarning([candidate(), candidate({ id: "rdv-2", beginAt: at(12) })]),
    ).toBe("Ce créneau chevauche 2 séances déjà prévues.");
  });
});
