import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import LandingFooter from "../components/footer";
import { LandingClose } from "../components/landing/landing-close";
import { LandingFaq } from "../components/landing/landing-faq";
import { webAppPath } from "../lib/web-app-url";
import {
  conversionAnchors,
  renderWithLandingImageConfig,
  textOnly,
} from "./landing-test-utils";

describe("landing objection handling and close", () => {
  test("preserves the five approved FAQ answers in native disclosures", () => {
    const html = renderToStaticMarkup(<LandingFaq />);
    const text = textOnly(html);

    expect(text).toContain("Avant de commencer.");
    expect(html).not.toContain("machine-");
    expect(html.match(/<details/g)).toHaveLength(5);
    expect(html.match(/data-faq-item=/g)).toHaveLength(5);
    for (const question of [
      "Biume remplace-t-il un logiciel de gestion ?",
      "Biume écrit-il à la place du praticien ?",
      "Chaque texte peut-il être modifié avant le partage ?",
      "Que reçoit le propriétaire ?",
      "Comment arrêter l&#x27;abonnement ?",
    ]) {
      expect(html).toContain(question);
    }
    for (const answer of [
      "Non. Biume se concentre sur le compte rendu propriétaire et le suivi post-séance. Il complète votre organisation actuelle.",
      "Biume prépare une proposition à partir de vos notes. Lorsque vous l'appliquez, elle remplace le texte du champ courant et reste entièrement modifiable.",
      "Oui. Vous pouvez modifier chaque champ avant de déclencher vous-même le téléchargement ou l'envoi.",
      "Le propriétaire reçoit le PDF professionnel joint à l'email que vous choisissez d'envoyer.",
      "Vous pouvez demander l'annulation depuis les paramètres de facturation. Elle prend effet à la fin de la période en cours.",
    ]) {
      expect(text).toContain(answer);
    }
    expect(html).not.toContain("hébergé en France");
    expect(html).not.toContain("conforme au RGPD");
  });

  test("keeps legal links as 44-pixel targets", () => {
    const html = renderToStaticMarkup(<LandingFaq />);

    for (const href of ["/privacy", "/cgu"]) {
      const anchor = html.match(
        new RegExp(`<a\\b[^>]*href="${href}"[^>]*>`),
      )?.[0];

      expect(anchor).toBeDefined();
      expect(anchor).toContain("inline-flex");
      expect(anchor).toContain("min-h-11");
    }
  });

  test("closes with the approved heading and both approved conversions", () => {
    const html = renderWithLandingImageConfig(<LandingClose />);
    const text = textOnly(html);
    const signupAnchors = conversionAnchors(html, "final-signup");
    const demoAnchors = conversionAnchors(html, "final-demo");

    expect(text).toContain("Préparez votre prochain compte rendu.");
    expect(text).toContain(
      "15 jours pour découvrir tout le parcours, sans carte bancaire.",
    );
    expect(html).toContain("bg-[color:var(--atelier-blue)]");
    expect(html).toContain("min-h-full");
    expect(signupAnchors).toHaveLength(1);
    expect(demoAnchors).toHaveLength(1);
    expect(signupAnchors[0]).toContain(`href="${webAppPath("/signup")}"`);
    expect(signupAnchors[0]).toContain("whitespace-nowrap");
    expect(demoAnchors[0]).toContain(
      'href="https://cal.com/mathieu-chambaud-biume"',
    );
    expect(demoAnchors[0]).toContain('target="_blank"');
    expect(demoAnchors[0]).toContain('rel="noopener noreferrer"');
    expect(demoAnchors[0]).toContain("whitespace-nowrap");
  });

  test("keeps every footer destination and external attribute on atelier tokens", () => {
    const html = renderWithLandingImageConfig(<LandingFooter />);
    const anchors = html.match(/<a\b[^>]*>/g) ?? [];
    const hrefs = anchors.map(
      (anchor) => anchor.match(/\shref="([^"]+)"/)?.[1],
    );

    expect(hrefs).toEqual([
      "/",
      "/osteopathe-animalier",
      "/logiciel-osteopathe-animalier",
      "/compte-rendu-osteopathe-animalier",
      "/modele-compte-rendu-osteopathe-animalier",
      "/suivi-post-seance-animal",
      "/blog",
      "/tarifs",
      "/comparatifs",
      "/alternatives/animalib",
      "/alternatives/kiwiappli",
      "/alternatives/mytour",
      "/comparatifs/neovoice-vs-biume",
      "/alternatives/neovoice",
      "https://cal.com/mathieu-chambaud-biume",
      "/privacy",
      "/cgu",
    ]);
    const demoAnchor = anchors.find((anchor) => anchor.includes("cal.com"));
    expect(demoAnchor).toContain('target="_blank"');
    expect(demoAnchor).toContain('rel="noopener noreferrer"');
    expect(html).toContain("var(--atelier-anthracite)");
    expect(html).toContain("var(--atelier-line)");
    expect(html).toContain("var(--atelier-muted");
    expect(html).toContain("var(--atelier-violet)");
    expect(html).not.toContain("machine-");
    expect(html).not.toContain('href="/contact"');
    expect(html).not.toContain("Hébergé en France");
    expect(html).not.toContain("conforme au RGPD");
    for (const anchor of anchors) {
      expect(anchor).toContain("min-h-11");
    }
  });
});
