import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { PractitionerControl } from "../components/landing/practitioner-control";
import { textOnly } from "./landing-test-utils";

describe("practitioner control", () => {
  test("shows source, editable owner version and explicit validation", () => {
    const html = renderToStaticMarkup(<PractitionerControl />);
    const text = textOnly(html);

    expect(text).toContain("Biume prépare. Vous gardez la main.");
    expect(text).toContain("Texte professionnel");
    expect(text).toContain("Version propriétaire");
    expect(text).toContain("Reformuler");
    expect(text).toContain("Valider ce passage");
    expect(text).toContain("Rien n’est partagé automatiquement");
    expect(html).toContain('data-control-status="ready"');
  });

  test("keeps the local alternate reformulation factual", async () => {
    const source = await Bun.file(
      new URL(
        "../components/landing/practitioner-control-demo.tsx",
        import.meta.url,
      ),
    ).text();

    expect(source).toContain(
      "La mobilité du thorax s’est améliorée après le travail manuel.",
    );
    expect(source).not.toContain("Le travail manuel a amélioré");
  });

  test("keeps normal-size body copy AA against the violet surface", () => {
    const html = renderToStaticMarkup(<PractitionerControl />);
    const bodyCopyClass = html.match(
      /<p class="([^"]*)">Biume structure vos notes/,
    )?.[1];

    expect(bodyCopyClass).toBeDefined();
    expect(bodyCopyClass).toContain("text-white");
    expect(bodyCopyClass).not.toMatch(/text-white\/\d+/);
  });
});
