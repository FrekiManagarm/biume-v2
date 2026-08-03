import { afterEach, describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { LandingV5Masthead } from "../components/landing-v5/masthead";
import { webAppPath } from "../lib/web-app-url";
import { cleanup, fireEvent, render } from "./dom-test-utils";
import { textOnly } from "./landing-test-utils";

afterEach(cleanup);

describe("landing-v5 masthead", () => {
  test("renders the skip link, brand, five nav links and the CTA", () => {
    const html = renderToStaticMarkup(<LandingV5Masthead />);
    const text = textOnly(html);

    expect(html).toContain('href="#contenu"');
    expect(text).toContain("Aller au contenu");
    expect(text).toContain("Biume");
    for (const [href, label] of [
      ["#produit", "Le parcours"],
      ["#suivi", "Le suivi"],
      ["#proprietaire", "Le propriétaire"],
      ["#tarifs", "Tarifs"],
      ["#questions", "Questions"],
    ]) {
      expect(html).toContain(`href="${href}"`);
      expect(text).toContain(label as string);
    }
    expect(html).toContain(`href="${webAppPath("/signup")}"`);
    expect(html).toContain('data-conversion="masthead-signup"');
    expect(html).toContain('data-masthead=""');
    expect(html).toContain('data-scrolled="false"');
  });

  test("keeps every interactive target at least 44px tall", () => {
    const html = renderToStaticMarkup(<LandingV5Masthead />);
    const interactiveClasses = Array.from(
      html.matchAll(/<(?:a|summary|button)\b[^>]*class="([^"]*)"/g),
      (match) => match[1],
    );

    expect(interactiveClasses.length).toBeGreaterThan(0);
    for (const className of interactiveClasses) {
      expect(className).toMatch(/\bmin-h-11\b/);
    }
  });

  test("owns its own scroll trigger, not a raw window listener", async () => {
    const source = await Bun.file(
      new URL("../components/landing-v5/masthead.tsx", import.meta.url),
    ).text();

    expect(source.trimStart()).toMatch(/^"use client";/);
    expect(source).toContain("ScrollTrigger.create");
    expect(source).not.toMatch(/window\.addEventListener\(\s*["']scroll/);
  });

  test("closes the mobile panel when a link is activated", () => {
    const { container } = render(<LandingV5Masthead />);
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    if (!details) return;

    details.open = true;
    const link = details.querySelector("nav a");
    expect(link).not.toBeNull();
    if (!link) return;

    fireEvent.click(link);
    expect(details.open).toBe(false);
  });
});
