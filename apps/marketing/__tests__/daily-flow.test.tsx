import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import { DailyFlow } from "../components/landing/daily-flow";
import { exactZeroOpacity, textOnly } from "./landing-test-utils";

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

describe("daily workflow", () => {
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

    expect(text.toLowerCase()).not.toMatch(/\d+\s*(?:h|heure|minute)/);
    expect(html).not.toMatch(exactZeroOpacity);
    expect(html).not.toMatch(/\bhidden(?:=|\b)/);
  });
});
