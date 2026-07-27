import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  DECIDING_SENTENCE,
  MANIFESTO,
  V2Manifesto,
} from "../components/v2/manifesto";
import { exactZeroOpacity, textOnly } from "./landing-test-utils";

const MANIFESTO_TEXT =
  "Vous notez « restriction thoracique gauche ». Le propriétaire lit « la mobilité du thorax a été travaillée pendant la séance ». Même observation, deux lecteurs. Biume écrit la seconde phrase. Vous gardez la première.";

describe("manifeste de l'accueil", () => {
  test("rend le texte entier avant toute hydratation", () => {
    const html = renderToStaticMarkup(<V2Manifesto />);
    const text = textOnly(html);

    // Le mouvement colore un texte déjà là. Il ne le révèle pas depuis
    // rien : sans script, la promesse reste lisible.
    expect(text).toContain(MANIFESTO_TEXT);
    expect(html).not.toMatch(exactZeroOpacity);
  });

  test("donne un titre au plan du document sans l'imposer à la page", () => {
    const html = renderToStaticMarkup(<V2Manifesto />);

    expect(html).toMatch(/<h2[^>]*class="[^"]*sr-only/);
  });

  test("découpe par mots, jamais par caractères", async () => {
    const source = await Bun.file(
      new URL("../components/v2/manifesto.tsx", import.meta.url),
    ).text();

    expect(source).toContain('type: "words,lines"');
    expect(source).not.toContain("chars");
    expect(source).not.toContain("prefers-reduced-motion");
  });

  test("garde la phrase décisive rattachée au texte qu'elle termine", () => {
    // Le pivot violet se calcule en comptant les mots de la fin. Si la
    // phrase décisive cesse d'être le suffixe exact du manifeste, la
    // coloration part sur les mauvais mots — sans rien casser d'autre,
    // donc sans être remarquée.
    expect(MANIFESTO.endsWith(DECIDING_SENTENCE)).toBe(true);
    expect(DECIDING_SENTENCE.split(" ")).toHaveLength(4);
  });
});
