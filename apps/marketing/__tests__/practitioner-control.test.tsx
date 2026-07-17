import { afterEach, describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { PractitionerControl } from "../components/landing/practitioner-control";
import { cleanup, fireEvent, render, within } from "./dom-test-utils";
import { textOnly } from "./landing-test-utils";

afterEach(cleanup);

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

  test("reformulates, validates and resets a real passage control", () => {
    const { container } = render(<PractitionerControl />);
    const passage = container.querySelector<HTMLElement>(
      '[data-control-passage="mobility"]',
    );

    expect(passage).not.toBeNull();
    if (!passage) {
      return;
    }

    const control = within(passage);
    const reformulate = control.getByRole("button", { name: "Reformuler" });
    const validate = control.getByRole("button", {
      name: "Valider ce passage",
    }) as HTMLButtonElement;

    expect(passage.dataset.controlStatus).toBe("ready");
    expect(
      control.getByText(
        "La mobilité du thorax s’est améliorée pendant le travail manuel.",
      ),
    ).not.toBeNull();

    fireEvent.click(reformulate);
    expect(
      control.getByText(
        "La mobilité du thorax s’est améliorée après le travail manuel.",
      ),
    ).not.toBeNull();

    fireEvent.click(validate);
    expect(passage.dataset.controlStatus).toBe("confirmed");
    expect(control.getAllByText("Passage validé")).toHaveLength(2);
    expect(validate.disabled).toBe(true);

    fireEvent.click(reformulate);
    expect(passage.dataset.controlStatus).toBe("ready");
    expect(control.getByText("Prêt à valider")).not.toBeNull();
    expect(
      control.getByRole("button", { name: "Valider ce passage" }),
    ).not.toBeNull();
    expect(
      control.getByText(
        "La mobilité du thorax s’est améliorée pendant le travail manuel.",
      ),
    ).not.toBeNull();
  });
});
