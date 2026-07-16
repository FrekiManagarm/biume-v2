import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import LandingFooter from "../components/footer";
import { FinalCta } from "../components/landing/final-cta";
import { LandingFaq } from "../components/landing/landing-faq";
import { webAppPath } from "../lib/web-app-url";
import {
  conversionAnchors,
  renderWithLandingImageConfig,
  textOnly,
} from "./landing-test-utils";

describe("landing objection handling and close", () => {
  test("answers the five approved objections with native disclosures", () => {
    const html = renderToStaticMarkup(<LandingFaq />);
    const text = textOnly(html);

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
    expect(html).toContain('href="/privacy"');
    expect(html).toContain('href="/cgu"');
    expect(html).not.toContain("hébergé en France");
    expect(html).not.toContain("conforme au RGPD");
  });

  test("gives the inline legal links a 44-pixel minimum target", () => {
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

  test("final moment presents one signup action and no competing demo", () => {
    const html = renderWithLandingImageConfig(<FinalCta />);
    const text = textOnly(html);
    const signupAnchors = conversionAnchors(html, "final-signup");

    expect(html).toContain("Votre prochaine séance");
    expect(text).toContain("Retrouvez du temps dès votre prochaine séance.");
    expect(text).toContain(
      "Créez votre espace, préparez un premier compte rendu et gardez la main jusqu’à l’envoi.",
    );
    expect(html).toContain("practitioner-owner-animal.png");
    expect(signupAnchors).toHaveLength(1);
    expect(signupAnchors[0]).toContain(`href="${webAppPath("/signup")}"`);
    expect(html.match(/<a\b/g)).toHaveLength(1);
    expect(html).not.toContain("cal.com");
  });

  test("keeps demo contextual near the FAQ without competing in the final CTA", () => {
    const faqHtml = renderToStaticMarkup(<LandingFaq />);
    const finalHtml = renderWithLandingImageConfig(<FinalCta />);

    expect(faqHtml).toContain(
      'href="https://cal.com/mathieu-chambaud-biume"',
    );
    expect(faqHtml).toContain('target="_blank"');
    expect(faqHtml).toContain('rel="noopener noreferrer"');
    expect(faqHtml).toContain('data-conversion="faq-demo"');
    expect(faqHtml).toContain("carnet-action");
    expect(faqHtml).toContain("Réserver une démonstration");
    expect(faqHtml).toContain('aria-describedby="faq-demo-new-tab"');
    expect(faqHtml).toContain('id="faq-demo-new-tab"');
    expect(faqHtml).toContain("sr-only");
    expect(faqHtml).toContain("Ouvre dans un nouvel onglet.");
    expect(finalHtml).not.toContain("cal.com");
    expect(finalHtml.match(/<a\b/g)).toHaveLength(1);
  });

  test("shared footer keeps legal and demo links without unsupported claims", () => {
    const html = renderWithLandingImageConfig(<LandingFooter />);
    const anchors = html.match(/<a\b[^>]*>/g) ?? [];

    expect(html).toContain('href="/privacy"');
    expect(html).toContain('href="/cgu"');
    expect(html).toContain('href="https://cal.com/mathieu-chambaud-biume"');
    expect(html).not.toContain('href="/contact"');
    expect(html).not.toContain("Hébergé en France");
    expect(html).not.toContain("conforme au RGPD");
    expect(anchors.length).toBeGreaterThan(0);
    for (const anchor of anchors) {
      expect(anchor).toContain("min-h-11");
    }
  });
});
