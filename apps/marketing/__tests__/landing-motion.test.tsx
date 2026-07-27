import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { REPORT_TRANSFORMATION_DEMO } from "../components/landing/report-transformation-demo";
import { V2Atelier } from "../components/v2/atelier";
import { V2Control } from "../components/v2/sections";
import {
  DECIDING_SENTENCE,
  MANIFESTO,
  V2Manifesto,
} from "../components/v2/manifesto";
import {
  exactZeroOpacity,
  renderWithLandingImageConfig,
  textOnly,
} from "./landing-test-utils";

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

describe("atelier de l'accueil", () => {
  test("rend la démonstration entière et validée avant toute hydratation", () => {
    const html = renderToStaticMarkup(<V2Atelier />);
    const text = textOnly(html);

    // L'état de repos est l'état final : sans script, la démonstration
    // se lit d'un coup, complète. L'animation ne conditionne jamais la
    // compréhension.
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.note);
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.ownerSummary);
    for (const section of REPORT_TRANSFORMATION_DEMO.sections) {
      // Les libellés sont mis en capitales par CSS (`uppercase`), donc le
      // texte du document les porte tels quels. Ne pas asserter sur une
      // version majuscule : elle n'existe qu'à l'écran.
      expect(text).toContain(section.label);
      expect(text).toContain(section.value);
    }
    expect(text).toContain("Validé par vous");
    expect(html).not.toMatch(exactZeroOpacity);
  });

  test("porte l'ancre produit et la mention de démonstration", () => {
    const html = renderToStaticMarkup(<V2Atelier />);

    expect(html).toContain('id="produit"');
    expect(textOnly(html)).toContain(
      "Démonstration à partir d'un exemple de séance.",
    );
  });

  test("expose les accroches que la séquence ira chercher", () => {
    const html = renderToStaticMarkup(<V2Atelier />);

    expect(html.match(/data-fragment="\d"/g)).toHaveLength(3);
    expect(html.match(/data-slot="\d"/g)).toHaveLength(3);
    expect(html.match(/data-value="\d"/g)).toHaveLength(3);
    expect(html.match(/data-rail-node="\d"/g)).toHaveLength(3);
    expect(html).toContain("data-atelier-root");
    expect(html).toContain("data-rail-progress");
    expect(html).toContain("data-seal");
    expect(html).toContain("data-owner");
  });

  test("laisse les décors hors de l'arbre d'accessibilité", () => {
    const html = renderToStaticMarkup(<V2Atelier />);
    // Le rail, ses pastilles et le sceau sont du décor : ils redisent
    // visuellement ce que le texte porte déjà.
    const railHost = html.match(/<div\b[^>]*\sdata-rail="[^"]*"[^>]*>/)?.[0];

    expect(railHost).toBeDefined();
    expect(railHost).toContain('aria-hidden="true"');
  });
});

describe("séquence de l'atelier", () => {
  test("réserve les gestes lourds aux écrans larges et ne rejoue pas à l'envers", async () => {
    const source = await Bun.file(
      new URL("../components/v2/atelier-sequence.ts", import.meta.url),
    ).text();

    // Le pinning et Flip ne se montent qu'au-dessus de 1024px : sur
    // petit écran le scroll n'est jamais capturé.
    expect(source).toContain("WIDE");
    expect(source).toContain("Flip.getState");
    expect(source).toContain("Flip.from");

    // Au scroll inverse, les états sont reposés instantanément. Une
    // animation jouée à l'envers pendant qu'on remonte donne le mal de
    // mer et brouille la lecture.
    expect(source).toContain("direction");

    // Aucune garde reduced-motion, aucun second observateur du scroll.
    expect(source).not.toContain("prefers-reduced-motion");
    expect(source).not.toMatch(/window\.addEventListener\(\s*["']scroll/);
  });

  test("le double en vol reste hors de l'arbre d'accessibilité", async () => {
    const source = await Bun.file(
      new URL("../components/v2/atelier-sequence.ts", import.meta.url),
    ).text();

    // Le texte est déjà lu deux fois dans l'arbre — dans la note et dans
    // le champ. Le double ne doit pas le faire lire une troisième fois.
    expect(source).toContain('setAttribute("aria-hidden", "true")');
  });
});

describe("contrôle du praticien", () => {
  test("montre le compte rendu relu, jamais une capture générique", () => {
    const html = renderWithLandingImageConfig(<V2Control />);
    const text = textOnly(html);

    // Biume n'a aucune preuve sociale : la crédibilité ne repose que sur
    // des démonstrations fidèles du produit. Une photo stock de
    // dashboard analytique n'en est pas une.
    expect(html).not.toContain("dashboard-image");
    expect(text).toContain("Biume prépare. Vous gardez la main.");
    expect(text).toContain("Rien n’est partagé automatiquement");
    expect(text).toContain(REPORT_TRANSFORMATION_DEMO.sections[0]!.value);
    expect(html).toContain('data-control-panel="true"');
  });
});

describe("mouvement du reste de la page", () => {
  test("le masthead n'ouvre pas son propre écouteur de scroll", async () => {
    const source = await Bun.file(
      new URL("../components/v2/masthead.tsx", import.meta.url),
    ).text();

    // Un seul observateur du défilement sur la page : celui de
    // ScrollTrigger, alimenté par Lenis.
    expect(source).not.toMatch(/window\.addEventListener\(\s*["']scroll/);
    expect(source).toContain("ScrollTrigger");
    expect(source).not.toContain("prefers-reduced-motion");
  });

  test("les CTA ne sont jamais retenus par une entrée animée", async () => {
    const source = await Bun.file(
      new URL("../components/v2/sections.tsx", import.meta.url),
    ).text();

    // Un bouton qui apparaît en retard est un bouton qu'on ne clique
    // pas. Les blocs de conversion ne sont pas enveloppés d'un Reveal.
    const closeBlock = source.slice(source.indexOf("export function V2Close"));
    const ctaIndex = closeBlock.indexOf('data-conversion="close-signup"');
    const revealBefore = closeBlock.lastIndexOf("<Reveal", ctaIndex);
    const revealClosed = closeBlock.lastIndexOf("</Reveal>", ctaIndex);

    expect(ctaIndex).toBeGreaterThan(0);
    expect(revealClosed).toBeGreaterThan(revealBefore);
  });
});
