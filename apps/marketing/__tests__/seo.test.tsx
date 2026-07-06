import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "bun:test";

import HomePage from "../app/page";
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
    path: "/logiciel-osteopathe-animalier",
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
    path: "/compte-rendu-osteopathe-animalier",
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
    path: "/tarifs",
    Page: PricingPage,
    metadata: pricingMetadata,
    title: "Tarif logiciel ostéopathe animalier",
    keywords: ["15 jours", "sans carte", "rendez-vous repris"],
  },
  {
    name: "comparisons",
    path: "/comparatifs",
    Page: ComparisonHubPage,
    metadata: comparisonMetadata,
    title: "Alternatives aux logiciels ostéopathe animalier",
    keywords: ["Animalib", "Hunimalis", "Stenko", "Biume"],
  },
];

function getJsonLdSchemas(html: string) {
  return [
    ...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g),
  ].map(([, json]) => JSON.parse(json ?? "{}") as Record<string, unknown>);
}

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
    path,
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
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain('"name":"Accueil"');
    expect(html).toContain(`"item":"https://biume.com${path}"`);
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

  test("product page mentions agenda and owner patient management", () => {
    const html = renderToStaticMarkup(<ProductPage />);

    expect(html).toContain("agenda");
    expect(html).toContain("propriétaires");
    expect(html).toContain("patients");
  });

  test("pricing schema uses software offer details instead of product snippets", () => {
    const html = renderToStaticMarkup(<PricingPage />);
    const schemas = getJsonLdSchemas(html);
    const productSchema = schemas.find(
      (schema) => schema["@type"] === "Product",
    );
    const softwareSchema = schemas.find(
      (schema) => schema["@type"] === "SoftwareApplication",
    );

    expect(productSchema).toBeUndefined();
    expect(softwareSchema).toBeDefined();
    expect(softwareSchema?.audience).toBeUndefined();
    expect(softwareSchema?.applicationCategory).toBe("BusinessApplication");
    expect(softwareSchema?.operatingSystem).toBe("Web");

    const offer = softwareSchema?.offers as Record<string, unknown>;
    const shippingDetails = offer.shippingDetails as Record<string, unknown>;
    expect(offer.url).toBe("https://biume.com/tarifs");
    expect(shippingDetails["@type"]).toBe("OfferShippingDetails");
    expect(shippingDetails.shippingRate).toEqual({
      "@type": "MonetaryAmount",
      value: 0,
      currency: "EUR",
    });
    expect(offer.hasMerchantReturnPolicy).toEqual({
      "@type": "MerchantReturnPolicy",
      applicableCountry: "FR",
      returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
    });
  });

  test("home software schema reuses complete offer details without unsupported audience", () => {
    const html = renderToStaticMarkup(<HomePage />);
    const softwareSchema = getJsonLdSchemas(html).find(
      (schema) => schema["@type"] === "SoftwareApplication",
    );

    expect(softwareSchema).toBeDefined();
    expect(softwareSchema?.audience).toBeUndefined();
    const offer = softwareSchema?.offers as Record<string, unknown>;
    const shippingDetails = offer.shippingDetails as Record<string, unknown>;
    const returnPolicy = offer.hasMerchantReturnPolicy as Record<
      string,
      unknown
    >;

    expect(shippingDetails["@type"]).toBe("OfferShippingDetails");
    expect(returnPolicy["@type"]).toBe("MerchantReturnPolicy");
  });
});
