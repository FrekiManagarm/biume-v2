import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import { HeroSection } from "../components/hero";

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
});
