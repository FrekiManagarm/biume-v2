import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import { ProductProof } from "../components/landing/product-proof";
import { exactZeroOpacity, textOnly } from "./landing-test-utils";

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
    expect(html).toContain("Scène 03 · Le document");
    expect(html).toContain('data-product-stage="editor"');
    expect(html).toContain('data-product-outcomes="true"');
    expect(html.match(/data-product-editor=/g)).toHaveLength(1);
    expect(html.match(/data-product-output=/g)).toHaveLength(2);
    expect(html).not.toMatch(exactZeroOpacity);
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

  test("keeps the labelled rubric navigation visible on mobile", () => {
    const html = renderToStaticMarkup(<ProductProof />);
    const rubricAside = html.match(
      /<aside\b(?=[^>]*aria-label="Rubriques illustrées du compte rendu")[^>]*>/,
    )?.[0];

    expect(rubricAside).toBeDefined();
    expect(rubricAside).not.toMatch(/\b(?:hidden|sr-only)\b/);
  });

  test("stacks the desktop connector above the editor surface", async () => {
    const css = await Bun.file(
      new URL("../app/globals.css", import.meta.url),
    ).text();
    const editorRule = css.match(
      /\.cinematic-product-stage \[data-product-editor\]\s*\{([^}]*)\}/,
    )?.[1];
    const outcomesRule = css.match(
      /\.cinematic-product-stage \[data-product-outcomes="true"\]\s*\{([^}]*)\}/,
    )?.[1];
    const connectorRule = css.match(
      /\.cinematic-product-stage \[data-product-outcomes="true"\]::before\s*\{([^}]*)\}/,
    )?.[1];
    const editorZIndex = Number(editorRule?.match(/z-index:\s*(\d+)/)?.[1]);
    const outcomesZIndex = Number(
      outcomesRule?.match(/z-index:\s*(\d+)/)?.[1],
    );

    expect(outcomesZIndex).toBeGreaterThan(editorZIndex);
    expect(connectorRule).toContain("pointer-events: none");
  });
});
