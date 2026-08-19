import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

const source = readFileSync(
  new URL("./appointments.function.ts", import.meta.url),
  "utf8",
);
const deleteSource = source.slice(
  source.indexOf("export const deleteAppointment"),
  source.indexOf("export const getTodayAppointments"),
);

describe("appointment deletion wiring", () => {
  test("scopes the linked-report lookup to the organization", () => {
    expect(deleteSource).toContain(
      "eq(advancedReport.appointmentId, data.appointmentId)",
    );
    expect(
      deleteSource.match(/eq\(advancedReport\.createdBy, organization\.id\)/g),
    ).toHaveLength(2);
  });

  test("restricts deletable reports to drafts", () => {
    // Un compte rendu `finalized` ou `sent` peut être vide au sens du
    // contenu (`canFinalizeReport` accepte des sections « sans objet ») tout
    // en ayant déjà été envoyé au propriétaire : seule la coquille `draft`
    // auto-créée avec le rendez-vous doit pouvoir disparaître avec lui.
    expect(deleteSource).toContain('eq(advancedReport.status, "draft")');
  });

  test("guards the report delete on a non-empty id list", () => {
    expect(deleteSource).toContain("deleteIds.length > 0");
  });

  test("groups the report and appointment deletes in one atomic batch", () => {
    // Deux `db.delete` isolés laisseraient une fenêtre où le brouillon est
    // détruit mais le rendez-vous survit si la seconde requête échoue.
    expect(deleteSource).toContain("db.batch([");
    expect(deleteSource).toContain("reportDelete");
    expect(deleteSource).toContain("appointmentDelete");
  });
});
