import { afterEach, describe, expect, test } from "bun:test";
import { createElement } from "react";

import { LandingHeader } from "../components/landing/landing-header";
import { cleanup, fireEvent, render, within } from "./dom-test-utils";
import { renderWithLandingImageConfig } from "./landing-test-utils";

afterEach(cleanup);

describe("native mobile menu island", () => {
  test("keeps the header server-rendered and delegates only the details menu", async () => {
    const [headerSource, menuExists] = await Promise.all([
      Bun.file(
        new URL("../components/landing/landing-header.tsx", import.meta.url),
      ).text(),
      Bun.file(
        new URL("../components/landing/mobile-menu.tsx", import.meta.url),
      ).exists(),
    ]);

    expect(headerSource).not.toMatch(/^\s*["']use client["'];/m);
    expect(headerSource).toContain('from "./mobile-menu"');
    expect(headerSource).toContain("<MobileMenu>");
    expect(menuExists).toBe(true);
  });

  test("removes open only when a menu link is activated", async () => {
    const moduleUrl = new URL(
      "../components/landing/mobile-menu.tsx",
      import.meta.url,
    );
    const menuExists = await Bun.file(moduleUrl).exists();

    expect(menuExists).toBe(true);
    if (!menuExists) {
      return;
    }

    const menuModule = (await import(moduleUrl.href)) as {
      dismissMobileMenuOnLinkActivation: (event: {
        currentTarget: { removeAttribute: (name: string) => void };
        target: { closest: (selector: string) => unknown };
      }) => void;
    };
    const removedAttributes: string[] = [];
    const currentTarget = {
      removeAttribute(name: string) {
        removedAttributes.push(name);
      },
    };

    menuModule.dismissMobileMenuOnLinkActivation({
      currentTarget,
      target: {
        closest: (selector) => (selector === "a" ? { href: "#produit" } : null),
      },
    });
    expect(removedAttributes).toEqual(["open"]);

    menuModule.dismissMobileMenuOnLinkActivation({
      currentTarget,
      target: { closest: () => null },
    });
    expect(removedAttributes).toEqual(["open"]);
  });

  test("renders a single-depth mobile surface", () => {
    const html = renderWithLandingImageConfig(createElement(LandingHeader));
    const panelClass = html.match(
      /<div class="([^"]*absolute right-0 top-\[calc\(100%\+0\.75rem\)\][^"]*)"/,
    )?.[1];

    expect(panelClass).toBeDefined();
    expect(Boolean(panelClass?.match(/(?:^|\s)border(?:\s|$)/))).not.toBe(
      Boolean(panelClass?.match(/(?:^|\s)shadow-/)),
    );
  });

  test("opens through the native summary and closes after a real menu link click", () => {
    const { container } = render(createElement(LandingHeader));
    const details = container.querySelector("details");
    const summary = container.querySelector("summary");

    expect(details).not.toBeNull();
    expect(summary).not.toBeNull();
    if (!details || !summary) {
      return;
    }

    summary.focus();
    expect(document.activeElement).toBe(summary);
    expect(summary.tabIndex).toBe(0);

    fireEvent.click(summary);
    expect(details.open).toBe(true);

    const mobileNavigation = within(details).getByRole("navigation", {
      name: "Navigation mobile",
    });
    fireEvent.click(
      within(mobileNavigation).getByRole("link", { name: "Produit" }),
    );
    expect(details.open).toBe(false);
  });
});
