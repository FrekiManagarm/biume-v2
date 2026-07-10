// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  createRootRouteWithContext: () => () => (options: unknown) => ({ options }),
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

import { RootDocument } from "./__root";

describe("RootDocument", () => {
  test("mounts the global toaster so report save feedback is visible", () => {
    render(<RootDocument />);

    expect(screen.getByTestId("global-toaster")).not.toBeNull();
  });
});
