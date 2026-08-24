// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  createRootRouteWithContext: () => (options: unknown) => ({ options }),
  HeadContent: () => null,
  Outlet: () => null,
  Scripts: () => null,
}));

vi.mock("@tanstack/react-query", () => ({
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@tanstack/react-router-devtools", () => ({
  TanStackRouterDevtoolsPanel: () => null,
}));

vi.mock("@tanstack/react-devtools", () => ({
  TanStackDevtools: () => null,
}));

vi.mock("#/integrations/tanstack-query/root-provider", () => ({
  getContext: () => ({ queryClient: {} }),
}));

vi.mock("../integrations/tanstack-query/devtools", () => ({ default: {} }));

vi.mock("autumn-js/react", () => ({
  AutumnProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@biume/ui/components/tooltip", () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@biume/ui/components/sonner", () => ({
  Toaster: () => <div data-testid="global-toaster" />,
}));

import { RootDocument, Route } from "./__root";

type MetaTag = { name?: string; content?: string; title?: string };

function headMeta(): MetaTag[] {
  const options = (Route as unknown as { options: { head: () => { meta: MetaTag[] } } })
    .options;
  return options.head().meta;
}

describe("RootDocument", () => {
  test("mounts the global toaster so report save feedback is visible", () => {
    render(<RootDocument />);

    expect(screen.getByTestId("global-toaster")).not.toBeNull();
  });
});

describe("app shell indexation", () => {
  // app.biume.com ne doit jamais etre indexe : l'acquisition passe uniquement
  // par le site marketing. Le robots.txt de biume.com ne couvre pas cet hote.
  test("declares noindex so the app subdomain never competes with marketing", () => {
    const robots = headMeta().find((tag) => tag.name === "robots");

    expect(robots).toBeDefined();
    expect(robots?.content).toBe("noindex, nofollow");
  });

  test("keeps accented French in the shell description", () => {
    const description = headMeta().find((tag) => tag.name === "description");

    expect(description?.content).toContain("propriétaires");
    expect(description?.content).toContain("vétérinaires");
  });
});
