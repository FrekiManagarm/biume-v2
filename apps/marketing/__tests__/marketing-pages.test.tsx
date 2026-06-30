import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import AboutPage from "../app/about/page";
import TermsPage from "../app/cgu/page";
import PrivacyPage from "../app/privacy/page";

const pages = [
  {
    name: "about",
    Page: AboutPage,
    titleParts: ["Biume aide les therapeutes animaliers", "gagner du temps"],
  },
  {
    name: "privacy",
    Page: PrivacyPage,
    titleParts: ["Politique de", "confidentialite"],
  },
  {
    name: "terms",
    Page: TermsPage,
    titleParts: ["Conditions generales", "d&#x27;utilisation"],
  },
];

describe("marketing sub pages", () => {
  test.each(pages)("$name page uses the landing design system", ({ Page, titleParts }) => {
    const html = renderToStaticMarkup(<Page />);

    expect(html).toContain("Essai gratuit");
    expect(html).toContain("Heberge en France, conforme RGPD");
    expect(html).toContain("selection:bg-primary/20");
    expect(html).toContain("landing-reveal");
    for (const titlePart of titleParts) {
      expect(html).toContain(titlePart);
    }
  });
});
