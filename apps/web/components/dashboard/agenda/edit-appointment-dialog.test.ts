import { describe, expect, test } from "vitest";

import { resolveNoteForSubmit } from "./edit-appointment-dialog";

describe("resolveNoteForSubmit", () => {
  test("renvoie une note effacée sous forme de chaîne vide, jamais undefined", () => {
    // Régression : `updateAppointment` fait un `.set({...values})` Drizzle
    // qui ignore silencieusement les clés `undefined` (`mapUpdateSet`). Si
    // cette fonction renvoyait `undefined` pour un champ vidé, la note
    // resterait inchangée en base malgré l'interface qui l'affiche effacée.
    expect(resolveNoteForSubmit("")).toBe("");
    expect(resolveNoteForSubmit("   ")).toBe("");
    expect(resolveNoteForSubmit(null)).toBe("");
  });

  test("nettoie les espaces superflus autour d'une note renseignée", () => {
    expect(resolveNoteForSubmit("  Contexte de séance  ")).toBe(
      "Contexte de séance",
    );
  });
});
