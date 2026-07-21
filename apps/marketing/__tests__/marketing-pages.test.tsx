import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import AboutPage from "../app/about/page";
import TermsPage from "../app/cgu/page";
import PrivacyPage from "../app/privacy/page";

const pages = [
  {
    name: "about",
    Page: AboutPage,
    path: "/about",
    titleParts: ["Biume aide les therapeutes animaliers", "gagner du temps"],
  },
  {
    name: "privacy",
    Page: PrivacyPage,
    path: "/privacy",
    titleParts: ["Politique de", "confidentialite"],
  },
  {
    name: "terms",
    Page: TermsPage,
    path: "/cgu",
    titleParts: ["Conditions generales", "d&#x27;utilisation"],
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
