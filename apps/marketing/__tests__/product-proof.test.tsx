import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import { ProductProof } from "../components/landing/product-proof";
import { textOnly } from "./landing-test-utils";

describe("product proof", () => {
  test("shows the supported editor and two factual outputs", () => {
    const html = renderToStaticMarkup(<ProductProof />);
    const text = textOnly(html);

    expect(text).toContain(
      "Pas une promesse abstraite. Les outils réellement disponibles.",
    );
    for (const capability of [
      "Observations",
      "Anatomie",
      "Recommandations",
      "Notes",
      "Adapter le langage",
      "Prévisualiser",
      "Finaliser",
    ]) {
      expect(html).toContain(capability);
    }
    expect(html).toContain("PDF professionnel");
    expect(html).toContain("Compte-rendu-seance.pdf");
    expect(html).toContain("Relance de rendez-vous");
    expect(html).toContain("Échéance choisie par le praticien : dans 30 jours");
    expect(html.match(/data-product-output=/g)).toHaveLength(2);
  });

  test("does not sell unsupported results or owner-response features", () => {
    const html = renderToStaticMarkup(<ProductProof />).toLowerCase();

    for (const forbidden of [
      "timeline animal",
      "retour à j+7",
      "réponse propriétaire",
      "questionnaire",
      "documents illimités",
      "4.9/5",
      "gagnez du temps",
      "comptes rendus pour les chats",
    ]) {
      expect(html).not.toContain(forbidden);
    }
  });
});
