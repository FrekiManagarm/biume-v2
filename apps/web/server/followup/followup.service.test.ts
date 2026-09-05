import { describe, expect, it } from "vitest";

import { isActionable, summarizeAlert, validateDueDate } from "./followup.service";

const now = new Date("2026-08-21T10:00:00.000Z");
const inDays = (days: number) =>
  new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

describe("validation de l'échéance", () => {
  it("accepte une échéance raisonnable", () => {
    expect(validateDueDate(inDays(7), now)).toBe("ok");
  });

  it("refuse une échéance passée", () => {
    expect(validateDueDate(inDays(-1), now)).toBe("past");
  });

  /**
   * Un questionnaire envoyé le lendemain d'une séance ne mesure rien : le corps
   * n'a pas eu le temps de répondre au travail. Trois jours est le plancher
   * métier, pas une limite technique.
   */
  it("refuse une échéance trop proche", () => {
    expect(validateDueDate(inDays(1), now)).toBe("too_soon");
  });

  it("refuse une échéance trop lointaine", () => {
    expect(validateDueDate(inDays(200), now)).toBe("too_far");
  });

  it("accepte exactement les bornes", () => {
    expect(validateDueDate(inDays(3), now)).toBe("ok");
    expect(validateDueDate(inDays(90), now)).toBe("ok");
  });
});

describe("suivi actionnable", () => {
  const answered = {
    status: "answered" as const,
    alertReasons: ["contact_requested" as const],
    handledAt: null,
  };

  /**
   * Ce que le praticien doit voir : une réponse qui a déclenché une règle et
   * qu'il n'a pas encore traitée. Rien d'autre ne mérite de l'interrompre.
   */
  it("signale une alerte non traitée", () => {
    expect(isActionable(answered)).toBe(true);
  });

  it("ne signale plus une alerte traitée", () => {
    expect(isActionable({ ...answered, handledAt: now })).toBe(false);
  });

  it("ne signale pas une réponse sans motif d'alerte", () => {
    expect(isActionable({ ...answered, alertReasons: [] })).toBe(false);
  });

  it("ne signale pas un suivi encore en attente de réponse", () => {
    expect(isActionable({ ...answered, status: "sent" })).toBe(false);
  });
});

describe("résumé d'alerte", () => {
  it("dit ce qui s'est passé, en français, sans jargon", () => {
    expect(summarizeAlert(["declared_worsening"])).toBe(
      "Le propriétaire signale que son animal va moins bien.",
    );
    expect(summarizeAlert(["contact_requested"])).toBe(
      "Le propriétaire souhaite être recontacté.",
    );
    expect(summarizeAlert(["reported_reaction"])).toBe(
      "Le propriétaire a observé une réaction après la séance.",
    );
  });

  it("compose plusieurs motifs sans les empiler bêtement", () => {
    const summary = summarizeAlert(["declared_worsening", "contact_requested"]);

    expect(summary).toContain("moins bien");
    expect(summary).toContain("recontacté");
  });

  it("ne dit rien sans motif", () => {
    expect(summarizeAlert([])).toBe("");
  });
});
