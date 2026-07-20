import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import * as landings from "./prototype-landings";
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

    expect(html.split("Ce que vous observez").length - 1).toBe(1);
  });
});
