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
  test.each(pages)("$name page uses the landing design system", ({
    Page,
    path,
    titleParts,
  }) => {
    const html = renderToStaticMarkup(<Page />);

    expect(html).toContain("Essai gratuit");
    expect(html).toContain("Heberge en France, conforme RGPD");
    expect(html).toContain("selection:bg-primary/20");
    expect(html).toContain("landing-reveal");
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain('"name":"Accueil"');
    expect(html).toContain(`"item":"https://biume.com${path}"`);
    for (const titlePart of titleParts) {
      expect(html).toContain(titlePart);
    }
  });
});
