import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import { DailyFlow } from "../components/landing/daily-flow";
import { textOnly } from "./landing-test-utils";

const steps = [
  {
    label: "Séance",
    detail: "Vous restez concentré sur l’animal.",
  },
  {
    label: "Notes",
    detail: "Vos observations gardent votre vocabulaire.",
  },
  {
    label: "Compte rendu",
    detail: "Biume structure une base précise.",
  },
  {
    label: "Partage",
    detail: "Vous relisez avant chaque envoi.",
  },
  {
    label: "Suivi",
    detail: "La prochaine étape reste visible.",
  },
] as const;

const forbiddenTimeClaims = [
  "une heure",
  "deux heures",
  "minutes gagnées",
  "gagnez une heure",
  "gain de temps chiffré",
] as const;

describe("daily workflow", () => {
  test("uses high-contrast ink for the decorative step numbers", () => {
    const html = renderToStaticMarkup(<DailyFlow />);
    const numberClassLists = Array.from(
      html.matchAll(
        /<span\b[^>]*class="([^"]*)"[^>]*>\s*0[1-5]\s*<\/span>/g,
      ),
      (match) => match[1].split(/\s+/),
    );

    expect(numberClassLists).toHaveLength(5);
    for (const classList of numberClassLists) {
      expect(classList).toContain("text-[color:var(--carnet-ink)]");
    }
  });

  test("hides decorative step numbers from assistive technology", () => {
    const html = renderToStaticMarkup(<DailyFlow />);
    const numberOpeningTags = Array.from(
      html.matchAll(/<span\b[^>]*>(?=\s*0[1-5]\s*<\/span>)/g),
      (match) => match[0],
    );

    expect(numberOpeningTags).toHaveLength(5);
    for (const openingTag of numberOpeningTags) {
      expect(openingTag).toContain('aria-hidden="true"');
    }
  });

  test("keeps every workflow step visible", () => {
    const html = renderToStaticMarkup(<DailyFlow />);
    const stepOpeningTags = Array.from(
      html.matchAll(
        /<li\b(?=[^>]*data-daily-step="[^"]+")[^>]*>/g,
      ),
      (match) => match[0],
    );

    expect(stepOpeningTags).toHaveLength(5);
    for (const openingTag of stepOpeningTags) {
      const classTokens =
        openingTag.match(/\bclass="([^"]*)"/)?.[1].split(/\s+/) ?? [];

      expect(classTokens).not.toContain("hidden");
      expect(classTokens).not.toContain("invisible");
      expect(classTokens).not.toContain("opacity-0");
      expect(openingTag).not.toMatch(
        /\shidden(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?(?=\s|>)/,
      );
    }
  });

  test("shows the complete five-step cabinet workflow", () => {
    const html = renderToStaticMarkup(<DailyFlow />);
    const text = textOnly(html);
    const orderedList = html.match(/<ol\b[^>]*>[\s\S]*?<\/ol>/)?.[0];
    const orderedListText = textOnly(orderedList ?? "");
    const introParagraphs = Array.from(
      html.slice(0, html.indexOf("<ol")).matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g),
      (match) => textOnly(match[1]),
    );
    const renderedSteps = Array.from(
      (orderedList ?? "").matchAll(
        /<li\b(?=[^>]*data-daily-step="([^"]+)")[^>]*>([\s\S]*?)<\/li>/g,
      ),
      (match) => ({ label: match[1], text: textOnly(match[2]) }),
    );

    expect(html).toContain('data-landing-section="daily-flow"');
    expect(html).toContain('id="comment-ca-marche"');
    expect(introParagraphs[0]).toBe("Le temps retrouvé");
    expect(text).toContain("Une journée de cabinet, sans ressaisie.");
    expect(introParagraphs[1]).toBe(
      "De la séance au suivi, Biume garde le même fil pour éviter de recommencer le travail à chaque étape.",
    );
    expect(orderedList).toBeDefined();
    expect(html.match(/data-daily-step=/g)).toHaveLength(5);
    expect(renderedSteps.map((step) => step.label)).toEqual(
      steps.map((step) => step.label),
    );
    expect(
      renderedSteps.map((step) => step.text.match(/^\d{2}\b/)?.[0]),
    ).toEqual(["01", "02", "03", "04", "05"]);

    for (const step of steps) {
      expect(orderedListText).toContain(step.label);
      expect(orderedListText).toContain(step.detail);
      expect(orderedList).toContain(`data-daily-step="${step.label}"`);
    }

    const normalizedText = text.toLowerCase();

    expect(normalizedText).not.toMatch(/\d+\s*(?:h|heure|minute)/);
    for (const forbiddenClaim of forbiddenTimeClaims) {
      expect(normalizedText).not.toContain(forbiddenClaim);
    }
  });
});
