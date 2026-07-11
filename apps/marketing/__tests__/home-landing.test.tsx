import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import { CTASection } from "../components/cta";
import { LandingFaq } from "../components/faq";
import { FeaturesSection } from "../components/features";
import { HeroSection } from "../components/hero";
import { PricingSection } from "../components/pricing";

describe("Biume home landing", () => {
  test("hero leads with post-session value and factual reassurance", () => {
    const html = renderToStaticMarkup(<HeroSection />);

    expect(html).toContain("Le suivi post-séance des ostéopathes animaliers");
    expect(html).toContain("Chaque séance mérite une suite.");
    expect(html).toContain("Essayer gratuitement");
    expect(html).toContain("Voir le parcours");
    expect(html).toContain("15 jours");
    expect(html).toContain("Sans carte bancaire");
    expect(html).toContain("Validé par vous");
    expect(html).toContain("Exemple de suivi");
    expect(html).toContain("Retour reçu à J+7");
    expect(html).toContain("hero-practitioner-horse.png");
    expect(html).not.toContain("4.9/5");
    expect(html).not.toContain("simplifiés par l");
    expect(html).not.toContain("diagnostics");
  });

  test("story explains the problem, journey, output and practitioner control", () => {
    const html = renderToStaticMarkup(<FeaturesSection />);

    expect(html).toContain("La séance ne s&#x27;arrête pas au rendez-vous.");
    expect(html).toContain(
      "Un fil clair, du rendez-vous au prochain échange.",
    );
    expect(html).toContain("Observer");
    expect(html).toContain("Valider");
    expect(html).toContain("Suivre");
    expect(html).toContain("Revoir");
    expect(html).toContain(
      "Le propriétaire comprend. Vous gardez le fil.",
    );
    expect(html).toContain("Résumé propriétaire");
    expect(html).toContain("Retour à J+7");
    expect(html).toContain("Timeline animal");
    expect(html).toContain("Biume prépare. Vous décidez.");
    expect(html).toContain("practitioner-dog.png");
    expect(html).not.toContain("Actions automatiques");
    expect(html).not.toContain("Patient timeline");
  });

  test("decision sections present one offer, real objections and the final CTA", () => {
    const pricing = renderToStaticMarkup(<PricingSection />);
    const faq = renderToStaticMarkup(<LandingFaq />);
    const cta = renderToStaticMarkup(<CTASection />);

    expect(pricing).toContain("Un abonnement simple. Une seule offre.");
    expect(pricing).toContain("24,99 €");
    expect(pricing).toContain("29,99 €");
    expect(pricing).toContain("Essayer gratuitement");
    expect(pricing).not.toContain("Plan complet");
    expect(faq.match(/<details/g)?.length).toBe(5);
    expect(faq).toContain("Est-ce que l&#x27;IA écrit à ma place ?");
    expect(faq).toContain("Comment mes données sont-elles protégées ?");
    expect(cta).toContain("Donnez une suite claire à chaque séance.");
    expect(cta).toContain("practitioner-owner-animal.png");
    expect(cta).toContain("Essayer gratuitement");
  });
});
