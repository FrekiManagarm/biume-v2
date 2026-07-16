import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import { FollowUpStory } from "../components/landing/follow-up-story";
import { PractitionerControl } from "../components/landing/practitioner-control";
import { textOnly } from "./landing-test-utils";

describe("landing continuity", () => {
  test("shows a practitioner-chosen follow-up without unsupported automation", async () => {
    const html = renderToStaticMarkup(<FollowUpStory />);
    const text = textOnly(html);
    const source = await Bun.file(
      new URL("../components/landing/follow-up-story.tsx", import.meta.url),
    ).text();

    expect(html).toContain('data-landing-section="follow-up"');
    expect(html).toContain("bg-[color:var(--carnet-blue-soft)]");
    const kicker = html.match(
      /<p\b[^>]*>La continuité après la séance<\/p>/,
    )?.[0];
    expect(kicker).toBeDefined();
    expect(kicker).toContain("text-[color:var(--carnet-ink)]");
    expect(text).toContain("Le suivi ne repose plus sur votre mémoire.");
    expect(text).toContain("Compte rendu prêt à relire");
    expect(text).toContain("Suivi prévu dans 30 jours");
    expect(text).toContain("Échéance choisie par le praticien");
    expect(text).not.toContain("questionnaire automatique");
    expect(source).not.toContain('"use client"');
    expect(source).not.toContain("'use client'");
  });

  test("states that nothing is sent without practitioner validation", async () => {
    const html = renderToStaticMarkup(<PractitionerControl />);
    const text = textOnly(html);
    const source = await Bun.file(
      new URL("../components/landing/practitioner-control.tsx", import.meta.url),
    ).text();

    expect(html).toContain('data-landing-section="control"');
    expect(html).toContain("bg-[color:var(--carnet-anthracite)]");
    expect(text).toContain("Biume prépare. Vous décidez.");
    expect(text).toContain("Rien ne part sans votre validation.");
    expect(html).toContain("bg-[color:var(--carnet-green)]");
    expect(source).not.toContain('"use client"');
    expect(source).not.toContain("'use client'");
  });
});
