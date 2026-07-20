import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

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
});
