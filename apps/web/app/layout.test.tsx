// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@tanstack/react-query", () => ({
  QueryClient: class {},
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("autumn-js/react", () => ({
  AutumnProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@biume/ui/components/tooltip", () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@biume/ui/components/sonner", () => ({
  Toaster: () => <div data-testid="global-toaster" />,
}));

import RootLayout, { metadata } from "./layout";

describe("RootLayout", () => {
  test("mounts the global toaster so report save feedback is visible", () => {
    render(
      <RootLayout>
        <div>contenu</div>
      </RootLayout>,
    );

    expect(screen.getByTestId("global-toaster")).not.toBeNull();
  });
});

describe("app shell indexation", () => {
  // app.biume.com ne doit jamais etre indexe : l'acquisition passe uniquement
  // par le site marketing. Le robots.txt de biume.com ne couvre pas cet hote.
  test("declares noindex so the app subdomain never competes with marketing", () => {
    expect(metadata.robots).toBeDefined();
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  test("keeps accented French in the shell description", () => {
    const description = metadata.description;

    expect(description).toContain("propriétaires");
    expect(description).toContain("vétérinaires");
  });
});
