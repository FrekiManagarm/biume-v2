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

  test("final moment presents one signup action and no competing demo", () => {
    const html = renderWithLandingImageConfig(<FinalCta />);
    const text = textOnly(html);
    const signupAnchors = conversionAnchors(html, "final-signup");

    expect(html).toContain("Votre prochain compte rendu");
    expect(text).toContain("La séance est terminée. Le suivi peut commencer.");
    expect(text).toContain(
      "Créez votre espace et préparez un premier document.",
    );
    expect(html).toContain("practitioner-owner-animal.png");
    expect(signupAnchors).toHaveLength(1);
    expect(signupAnchors[0]).toContain(`href="${webAppPath("/signup")}"`);
    expect(html.match(/<a\b/g)).toHaveLength(1);
    expect(html).not.toContain("cal.com");
  });

  test("shared footer keeps legal and demo links without unsupported claims", () => {
    const html = renderWithLandingImageConfig(<LandingFooter />);

    expect(html).toContain('href="/privacy"');
    expect(html).toContain('href="/cgu"');
    expect(html).toContain('href="https://cal.com/mathieu-chambaud-biume"');
    expect(html).not.toContain('href="/contact"');
    expect(html).not.toContain("Hébergé en France");
    expect(html).not.toContain("conforme au RGPD");
  });
});
