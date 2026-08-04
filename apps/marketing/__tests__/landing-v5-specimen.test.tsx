import { describe, expect, test } from "bun:test";

import { LandingV5Specimen } from "../components/landing-v5/specimen";
import { SPECIMEN_STEPS } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";

describe("landing-v5 specimen", () => {
  test("renders the subject, rail and all four steps' raw/out/body text", () => {
    const html = renderWithLandingImageConfig(<LandingV5Specimen />);
    const text = textOnly(html);

    expect(html).toContain('id="produit"');
    expect(html).toContain('aria-labelledby="demo-title"');
    expect(text).toContain("Nashira · jument selle français · 11 ans");
    for (const label of ["Motif", "Examen", "Traitement", "Suites"]) {
      expect(text).toContain(label);
    }
    for (const step of SPECIMEN_STEPS) {
      expect(text).toContain(step.raw);
      expect(text).toContain(step.heading);
      expect(text).toContain(step.out);
      expect(text).toContain(step.body);
    }
    expect(text).toContain("Séance fictive, écrite pour la démonstration.");
  });

  test("stacks all four panels in the same grid cell and shows only the first by default", () => {
    const html = renderWithLandingImageConfig(<LandingV5Specimen />);

    expect(html.match(/data-panel="[0-3]"/g)).toHaveLength(4);
    expect(html.match(/data-rail-item="[0-3]"/g)).toHaveLength(4);
    expect(html).toContain('data-demo-progress=""');
    expect(html).toMatch(/data-panel="0"[^>]*style="[^"]*display:flex/);
    expect(html).toMatch(/data-panel="1"[^>]*style="[^"]*display:none/);
    expect(html).toMatch(/data-panel="2"[^>]*style="[^"]*display:none/);
    expect(html).toMatch(/data-panel="3"[^>]*style="[^"]*display:none/);
  });

  test("owns its own scrubbed scroll trigger, no window listener, no reduced-motion guard", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/specimen.tsx", import.meta.url),
    ).text();

    expect(source.trimStart()).toMatch(/^"use client";/);
    expect(source).toContain("ScrollTrigger.create");
    expect(source).toContain('start: "top top"');
    expect(source).toContain('end: "bottom bottom"');
    expect(source).toContain("scrub: true");
    expect(source).toContain("biume-volet");
    expect(source).not.toContain("prefers-reduced-motion");
    expect(source).not.toMatch(/window\.addEventListener\(\s*["']scroll/);
  });
});
