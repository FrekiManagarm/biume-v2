import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import robots from "../app/robots";
import sitemap from "../app/sitemap";
import ReportPage, {
  metadata as reportMetadata,
} from "../app/compte-rendu-osteopathe-animalier/page";
import ComparisonHubPage, {
  metadata as comparisonMetadata,
} from "../app/comparatifs/page";
import ProductPage, {
  metadata as productMetadata,
} from "../app/logiciel-osteopathe-animalier/page";
import PricingPage, { metadata as pricingMetadata } from "../app/tarifs/page";
import { rootMetadata } from "../lib/metadata";

const pageChecks = [
  {
    name: "product",
    Page: ProductPage,
    metadata: productMetadata,
    title: "Logiciel ostéopathe animalier",
    keywords: [
      "logiciel ostéopathe animalier",
      "suivi post-séance",
      "timeline animal",
    ],
  },
  {
    name: "report",
    Page: ReportPage,
    metadata: reportMetadata,
    title: "Compte rendu ostéopathe animalier",
    keywords: [
      "compte rendu ostéopathe animalier",
      "résumé propriétaire",
      "relance de suivi",
    ],
  },
  {
    name: "pricing",
    Page: PricingPage,
    metadata: pricingMetadata,
    title: "Tarif logiciel ostéopathe animalier",
    keywords: ["15 jours", "sans carte", "rendez-vous repris"],
  },
  {
    name: "comparisons",
    Page: ComparisonHubPage,
    metadata: comparisonMetadata,
    title: "Alternatives aux logiciels ostéopathe animalier",
    keywords: ["Animalib", "Hunimalis", "Stenko", "Biume"],
  },
];

describe("marketing SEO", () => {
  test("root metadata targets the primary acquisition keyword", () => {
    expect(rootMetadata.metadataBase?.toString()).toBe("https://biume.com/");
    expect(rootMetadata.title).toEqual({
      default: "Logiciel de compte rendu pour ostéopathe animalier | Biume",
      template: "%s | Biume",
    });
    expect(rootMetadata.description).toContain("suivi post-séance");
    expect(rootMetadata.openGraph?.locale).toBe("fr_FR");
  });

  test.each(pageChecks)("$name page has unique metadata and keyword-focused copy", ({
    Page,
    metadata,
    title,
    keywords,
  }) => {
    const html = renderToStaticMarkup(<Page />);

    expect(metadata.title).toBe(title);
    expect(metadata.description).toBeString();
    expect(String(metadata.description).length).toBeGreaterThan(120);
    expect(String(metadata.description).length).toBeLessThanOrEqual(170);
    expect(html).toContain("application/ld+json");
    for (const keyword of keywords) {
      expect(html.toLowerCase()).toContain(keyword.toLowerCase());
    }
  });

  test("sitemap and robots expose the public marketing acquisition routes", () => {
    const urls = sitemap().map((entry) => entry.url);
    const rules = robots();

    expect(urls).toContain("https://biume.com/logiciel-osteopathe-animalier");
    expect(urls).toContain("https://biume.com/compte-rendu-osteopathe-animalier");
    expect(urls).toContain("https://biume.com/tarifs");
    expect(urls).toContain("https://biume.com/comparatifs");
    expect(rules.sitemap).toBe("https://biume.com/sitemap.xml");
    expect(JSON.stringify(rules)).toContain("/dashboard");
  });
});
