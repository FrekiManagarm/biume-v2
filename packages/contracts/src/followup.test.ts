import { describe, expect, it } from "vitest";

import {
  canTransitionFollowUp,
  defaultFollowUpQuestionnaire,
  evaluateAlertRules,
  followUpAnswerSchema,
  followUpQuestionnaireSchema,
} from "./followup";

const answer = {
  evolution: "better" as const,
  reaction: "",
  wantsContact: false,
};

describe("questionnaire par défaut", () => {
  /**
   * Le modèle du PRODUCT.md : une échelle simple, un commentaire libre, et une
   * demande explicite de contact. Trois questions, pas une de plus — un
   * propriétaire répond depuis son téléphone, souvent d'une main.
   */
  it("pose exactement les trois questions du modèle", () => {
    expect(defaultFollowUpQuestionnaire.questions).toHaveLength(3);
    expect(
      followUpQuestionnaireSchema.parse(defaultFollowUpQuestionnaire),
    ).toBeTruthy();
  });

  it("parle au propriétaire, pas au praticien", () => {
    const texte = JSON.stringify(defaultFollowUpQuestionnaire);

    expect(texte).not.toMatch(/dysfonction|amyotrophie|sacro-iliaque/i);
  });

  it("reste modifiable par le praticien", () => {
    expect(
      followUpQuestionnaireSchema.parse({
        ...defaultFollowUpQuestionnaire,
        questions: defaultFollowUpQuestionnaire.questions.map((question) =>
          question.kind === "text"
            ? { ...question, label: "Autre chose ?" }
            : question,
        ),
      }),
    ).toBeTruthy();
  });
});

describe("réponse du propriétaire", () => {
  it("accepte une réponse minimale", () => {
    expect(followUpAnswerSchema.parse(answer)).toEqual(answer);
  });

  it("rejette une évolution hors échelle", () => {
    expect(() =>
      followUpAnswerSchema.parse({ ...answer, evolution: "excellent" }),
    ).toThrow();
  });

  it("rejette un champ non déclaré", () => {
    expect(() =>
      followUpAnswerSchema.parse({ ...answer, reportId: "report-1" }),
    ).toThrow();
  });
});

describe("règles d'alerte", () => {
  it("ne signale rien quand tout va mieux", () => {
    expect(evaluateAlertRules(answer)).toEqual([]);
  });

  /**
   * Trois règles explicites, et elles seules déclenchent une alerte : une
   * dégradation déclarée, une réaction rapportée, une demande de contact. Le
   * praticien doit pouvoir prédire ce qui va le déranger.
   */
  it("signale une dégradation déclarée", () => {
    expect(evaluateAlertRules({ ...answer, evolution: "worse" })).toContain(
      "declared_worsening",
    );
  });

  it("signale une réaction rapportée", () => {
    expect(
      evaluateAlertRules({ ...answer, reaction: "Il a boité deux jours après." }),
    ).toContain("reported_reaction");
  });

  it("signale une demande de contact", () => {
    expect(evaluateAlertRules({ ...answer, wantsContact: true })).toContain(
      "contact_requested",
    );
  });

  it("cumule les motifs sans les confondre", () => {
    const reasons = evaluateAlertRules({
      evolution: "worse",
      reaction: "Beaucoup de fatigue.",
      wantsContact: true,
    });

    expect(reasons).toHaveLength(3);
    expect(new Set(reasons).size).toBe(3);
  });

  it("ignore un commentaire vide ou blanc", () => {
    expect(evaluateAlertRules({ ...answer, reaction: "   " })).toEqual([]);
  });

  /**
   * « Pareil » n'est pas une dégradation. Alerter dessus noierait les vraies
   * alertes, et le praticien cesserait de les lire.
   */
  it("ne signale pas une stabilité", () => {
    expect(evaluateAlertRules({ ...answer, evolution: "same" })).toEqual([]);
  });
});

describe("cycle de vie du suivi", () => {
  it("suit le chemin nominal", () => {
    expect(canTransitionFollowUp("scheduled", "sent")).toBe(true);
    expect(canTransitionFollowUp("sent", "answered")).toBe(true);
  });

  it("permet d'annuler un suivi non encore envoyé", () => {
    expect(canTransitionFollowUp("scheduled", "cancelled")).toBe(true);
  });

  /**
   * Une réponse de propriétaire est une donnée reçue. Rien ne doit pouvoir la
   * défaire, ni une annulation, ni un renvoi.
   */
  it("rend la réponse terminale", () => {
    expect(canTransitionFollowUp("answered", "sent")).toBe(false);
    expect(canTransitionFollowUp("answered", "cancelled")).toBe(false);
  });
});
