import { describe, expect, test } from "bun:test";

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
});
