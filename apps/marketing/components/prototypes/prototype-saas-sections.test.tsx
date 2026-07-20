import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import * as landings from "./prototype-landings";
import { AfterDarkLanding } from "./prototype-landings";
import { NarrativeSaasSections } from "./prototype-saas-sections";

const requiredSectionIds = ["preuve", "methode", "produit", "cas", "comparatif", "tarifs", "faq"];

describe("NarrativeSaasSections", () => {
  test("exports only the After dark landing", () => {
    expect(Object.keys(landings)).toEqual(["AfterDarkLanding"]);
  });

  test("renders every required section anchor", () => {
    const html = renderToStaticMarkup(<NarrativeSaasSections />);

    for (const id of requiredSectionIds) {
      expect(html).toContain(`id=\"${id}\"`);
    }
  });

  test("keeps the document triptych to the product section", () => {
    const html = renderToStaticMarkup(<landings.AfterDarkLanding />);
    const documentLabel = "Ce que vous observez";
    const productStart = html.indexOf('id="produit"');
    const casesStart = html.indexOf('id="cas"');

    expect(html.indexOf(documentLabel)).toBeGreaterThan(productStart);
    expect(html.lastIndexOf(documentLabel)).toBeLessThan(casesStart);
  });

  test("keeps the orbital scroll choreography in the dark route", () => {
    const html = renderToStaticMarkup(<AfterDarkLanding />);

    expect(html).toContain('data-orbit-hero="true"');
    expect(html).toContain('data-orbit-trajectory="true"');
    expect(html).toContain('data-orbit-documents="true"');
    expect(html).toContain('data-orbit-cases="true"');
  });

  test("does not remount the global TransitRail loop", async () => {
    const source = await Bun.file(
      "apps/marketing/components/prototypes/prototype-landings.tsx",
    ).text();

    expect(source).not.toContain("TransitRail");
  });
});
