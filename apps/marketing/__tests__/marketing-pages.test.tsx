import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import AboutPage, { metadata as aboutMetadata } from "../app/about/page";
import TermsPage, { metadata as termsMetadata } from "../app/cgu/page";
import PrivacyPage, { metadata as privacyMetadata } from "../app/privacy/page";
import { rootMetadata } from "../lib/metadata";

const pages = [
  {
    name: "about",
    Page: AboutPage,
    metadata: aboutMetadata,
    path: "/about",
    title: "À propos",
    titleParts: ["Biume aide les thérapeutes animaliers", "gagner du temps"],
  },
  {
    name: "privacy",
    Page: PrivacyPage,
    metadata: privacyMetadata,
    path: "/privacy",
    title: "Politique de confidentialité",
    titleParts: ["Politique de", "confidentialité"],
  },
  {
    name: "terms",
    Page: TermsPage,
    metadata: termsMetadata,
    path: "/cgu",
    title: "Conditions générales d'utilisation",
    titleParts: ["Conditions générales", "d&#x27;utilisation"],
  },
];

describe("marketing sub pages", () => {
  test.each(pages)(
    "$name page uses the landing design system",
    ({ Page, path, titleParts }) => {
      const html = renderToStaticMarkup(<Page />);

      expect(html).toContain("Essayer gratuitement");
      expect(html).toContain('href="/privacy"');
      expect(html).toContain('href="/cgu"');
      expect(html).toContain('href="https://cal.com/mathieu-chambaud-biume"');
      expect(html).not.toContain('href="/contact"');
      expect(html).not.toContain("Hébergé en France");
      expect(html).not.toContain("conforme au RGPD");
      expect(html).toContain("selection:bg-[color:var(--v2-accent)]/25");
      expect(html).toContain("v2-display");
      expect(html).toContain("landing-reveal");
      expect(html).toContain('"@type":"BreadcrumbList"');
      expect(html).toContain('"name":"Accueil"');
      expect(html).toContain(`"item":"https://biume.com${path}"`);
      for (const titlePart of titleParts) {
        expect(html).toContain(titlePart);
      }
    },
  );
});

describe("marketing sub pages metadata", () => {
  // Ces trois pages heritaient du titre, de la description et de la canonique
  // de l'accueil. Resultat observe dans les SERP : /cgu se positionnait sur des
  // requetes commerciales a la place des pages dediees.
  test.each(pages)(
    "$name page owns its title, description and canonical",
    ({ metadata, path, title }) => {
      expect(metadata.title).toBe(title);
      expect(metadata.title).not.toBe(
        "Logiciel de compte rendu pour ostéopathe animalier | Biume",
      );

      expect(metadata.description).toBeString();
      expect(String(metadata.description).length).toBeGreaterThan(70);
      expect(String(metadata.description).length).toBeLessThanOrEqual(170);
      expect(metadata.description).not.toBe(rootMetadata.description);

      expect(metadata.alternates?.canonical).toBe(`https://biume.com${path}`);
    },
  );

  test("root metadata no longer forces the home canonical site-wide", () => {
    // Toute page sans alternates propre heritait de cette valeur.
    expect(rootMetadata.alternates?.canonical).toBeUndefined();
  });

  test("every sub page title and description is unique", () => {
    const titles = pages.map((page) => page.metadata.title);
    const descriptions = pages.map((page) => page.metadata.description);

    expect(new Set(titles).size).toBe(pages.length);
    expect(new Set(descriptions).size).toBe(pages.length);
  });
});
