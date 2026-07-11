import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, mock, test } from "bun:test";

import { CTASection } from "../components/cta";
import { LandingFaq } from "../components/faq";
import { FeaturesSection } from "../components/features";
import { HeroSection } from "../components/hero";
import { JourneyStory } from "../components/landing/journey-story";
import { MotionReveal } from "../components/landing/motion-reveal";
import { PricingSection } from "../components/pricing";

mock.module("next/font/google", () => ({
  Geist: () => ({ variable: "font-geist-sans" }),
  Geist_Mono: () => ({ variable: "font-geist-mono" }),
  Manrope: () => ({ variable: "font-manrope" }),
}));

const { default: HomePage } = await import("../app/page");

describe("Biume home landing", () => {
  test("motion reveal keeps content visible in server markup", () => {
    const html = renderToStaticMarkup(
      <MotionReveal delay={0.08}>
        <p>Contenu visible sans JavaScript</p>
      </MotionReveal>,
    );

    expect(html).toContain("Contenu visible sans JavaScript");
    expect(html).not.toContain("opacity:0");
    expect(html).not.toContain("visibility:hidden");
  });

  test("journey story exposes every step before hydration", () => {
    const html = renderToStaticMarkup(
      <JourneyStory
        steps={[
          { title: "Observer", body: "Noter l’essentiel." },
          { title: "Valider", body: "Relire chaque mot." },
          { title: "Suivre", body: "Recevoir le retour." },
          { title: "Revoir", body: "Garder l’évolution." },
        ]}
      />,
    );

    expect(html.match(/data-journey-step=/g)?.length).toBe(4);
    expect(html).toContain("Observer");
    expect(html).toContain("Revoir");
    expect(html).not.toContain("opacity:0");
  });

  test("hero leads with post-session value and factual reassurance", () => {
    const html = renderToStaticMarkup(<HeroSection />);

    expect(html).toContain("Le suivi post-séance des ostéopathes animaliers");
    expect(html).toContain("Chaque séance mérite une suite.");
    expect(html).toContain("Essayer gratuitement");
    expect(html).toContain("Voir le parcours");
    expect(html).toContain("15 jours");
    expect(html).toContain("Sans carte bancaire");
    expect(html).toContain("Validé par vous");
    expect(html).toContain("landing-hero-media");
    expect(html).toContain("landing-reassurance");
    expect(html).toContain("hero-practitioner-horse.png");
    expect(html).not.toContain("Exemple de suivi");
    expect(html).not.toContain("Naya va mieux depuis la séance");
    expect(html).not.toContain("Retour reçu à J+7");
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
    expect(html).toContain("data-problem-composition");
    expect(html).toContain("data-product-outcome");
    expect(html).toContain("data-control-interlude");
    expect(html.match(/data-journey-step=/g)?.length).toBe(4);
    expect(html).not.toContain("Après la séance</p>");
    expect(html).not.toContain("Le parcours</p>");
    expect(html).not.toContain("Le résultat</p>");
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
    expect(pricing).toContain("data-billing-selector");
    expect(pricing).toContain("data-billing-price");
    expect(pricing).not.toContain("Plan complet");
    expect(faq.match(/<details/g)?.length).toBe(5);
    expect(faq.match(/data-faq-item=/g)?.length).toBe(5);
    expect(faq).toContain("data-faq-indicator");
    expect(faq).toContain("Est-ce que l&#x27;IA écrit à ma place ?");
    expect(faq).toContain("Comment mes données sont-elles protégées ?");
    expect(cta).toContain("data-final-cta");
    expect(cta).toContain("Donnez une suite claire à chaque séance.");
    expect(cta).toContain("practitioner-owner-animal.png");
    expect(cta).toContain("Essayer gratuitement");
  });

  test("assembled page preserves the conversion and anti-slop contract", () => {
    const html = renderToStaticMarkup(<HomePage />);
    const primaryCtaHrefs = Array.from(
      html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g),
    )
      .filter(([, , content]) =>
        content.replace(/<[^>]+>/g, "").includes("Essayer gratuitement"),
      )
      .map(([, attributes]) => attributes.match(/\bhref="([^"]+)"/)?.[1]);
    const signupHref = "http://localhost:3001/signup";

    expect(html).toContain("landing-theme");
    expect(html).toContain("Chaque séance mérite une suite.");
    expect(html).toContain("Un abonnement simple. Une seule offre.");
    expect(html).toContain("Les questions avant de commencer.");
    expect(html).toContain("Hébergé en France, conforme au RGPD");
    expect(primaryCtaHrefs.length).toBeGreaterThanOrEqual(4);
    expect(primaryCtaHrefs).toEqual(
      Array(primaryCtaHrefs.length).fill(signupHref),
    );
    expect(html).not.toMatch(/[—–]/);
    expect(html).not.toContain("4.9/5");
    expect(html).not.toContain("IA au service");
    expect(html).not.toContain("hero-scan-line");
    expect(html).not.toContain("hero-field-drift");
    expect(html).not.toContain("bg-clip-text");
    expect(html).not.toContain("Commencer gratuitement");
    expect(html).not.toContain("Démarrer l");
  });
});
