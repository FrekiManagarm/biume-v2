import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { AfterDarkLanding, LaboratoireLanding } from "./prototype-landings";
import { NarrativeSaasSections } from "./prototype-saas-sections";

const requiredSectionIds = ["preuve", "methode", "produit", "cas", "comparatif", "tarifs", "faq"];

describe("NarrativeSaasSections", () => {
  test("renders every required section anchor for both visual tones", () => {
    const outputs = [
      renderToStaticMarkup(<NarrativeSaasSections tone="light" />),
      renderToStaticMarkup(<NarrativeSaasSections tone="night" />),
    ];

    for (const html of outputs) {
      for (const id of requiredSectionIds) {
        expect(html).toContain(`id=\"${id}\"`);
      }
    }
  });

  test("keeps the document triptych to the product section on each route", () => {
    const outputs = [
      renderToStaticMarkup(<LaboratoireLanding />),
      renderToStaticMarkup(<AfterDarkLanding />),
    ];

    for (const html of outputs) {
      expect(html.split("Ce que vous observez").length - 1).toBe(1);
    }
  });
});
