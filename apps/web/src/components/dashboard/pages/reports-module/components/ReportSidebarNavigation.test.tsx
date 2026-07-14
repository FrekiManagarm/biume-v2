// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { ReportSidebarNavigation } from "./ReportSidebarNavigation";

afterEach(cleanup);

describe("ReportSidebarNavigation", () => {
  const defaultProps = {
    tabs: [
      { id: "clinical" as const, label: "Observations", count: 2 },
      { id: "anatomical" as const, label: "Anatomie", count: 1 },
      {
        id: "recommendations" as const,
        label: "Recommandations",
        count: 1,
      },
      { id: "notes" as const, label: "Notes additionnelles", count: 1 },
    ],
    activeTab: "clinical" as const,
    onChangeTab: vi.fn(),
    onGoBack: vi.fn(),
    onShortcuts: vi.fn(),
    ownerStatuses: {
      clinical: "stale" as const,
      anatomical: "ready" as const,
      recommendations: "missing" as const,
      notes: "ready" as const,
    },
    pendingOwnerCount: 2,
    onPrepareOwnerContent: vi.fn(),
  };

  test("keeps professional jargon and exposes owner preparation states", () => {
    render(<ReportSidebarNavigation {...defaultProps} />);

    expect(screen.getByText("Observations")).not.toBeNull();
    expect(screen.getByText("Anatomie")).not.toBeNull();
    expect(screen.getByText("Recommandations")).not.toBeNull();
    expect(screen.getByText("Notes additionnelles")).not.toBeNull();
    expect(screen.getByText("2 contenus à préparer")).not.toBeNull();
    expect(screen.getAllByText("Prêt")).toHaveLength(2);
    expect(screen.getByText("À actualiser")).not.toBeNull();
    expect(screen.getByText("À préparer")).not.toBeNull();
  });

  test("keeps direct navigation and the owner preparation action", () => {
    const onChangeTab = vi.fn();
    const onPrepareOwnerContent = vi.fn();
    render(
      <ReportSidebarNavigation
        {...defaultProps}
        onChangeTab={onChangeTab}
        onPrepareOwnerContent={onPrepareOwnerContent}
      />,
    );

    fireEvent.click(screen.getByText("Anatomie"));
    fireEvent.click(screen.getByText("2 contenus à préparer"));

    expect(onChangeTab).toHaveBeenCalledWith("anatomical");
    expect(onPrepareOwnerContent).toHaveBeenCalledOnce();
  });

  test("marks the active section and preserves its semantic owner color", () => {
    const { rerender } = render(<ReportSidebarNavigation {...defaultProps} />);

    const activeTab = screen.getByRole("button", { name: /Observations/ });
    const staleBadge = screen.getByText("À actualiser");

    expect(activeTab.getAttribute("aria-current")).toBe("page");
    expect(staleBadge.className).toContain("bg-amber-100");
    expect(staleBadge.className).not.toContain("bg-primary/10");

    rerender(
      <ReportSidebarNavigation {...defaultProps} activeTab="anatomical" />,
    );
    const readyBadge = within(
      screen.getByRole("button", { name: /Anatomie/ }),
    ).getByText("Prêt");
    expect(readyBadge.className).toContain("bg-emerald-100");
  });

  test("disables preparation while the professional draft is saving", () => {
    render(<ReportSidebarNavigation {...defaultProps} isPreparationDisabled />);

    expect(
      screen
        .getByRole("button", { name: "2 contenus à préparer" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });

  test("uses the primary application tokens", () => {
    const { container } = render(<ReportSidebarNavigation {...defaultProps} />);
    const shellClassName = container.firstElementChild?.className ?? "";

    expect(shellClassName).toContain("bg-primary");
    expect(shellClassName).toContain("text-primary-foreground");
    expect(shellClassName).not.toContain("slate-");
  });

  test("keeps collapsed rail controls centered with the same touch target", () => {
    const { container } = render(
      <ReportSidebarNavigation {...defaultProps} isCollapsed />,
    );
    const rail = within(container);

    expect(rail.getByLabelText("Retour").className).toContain("h-11 w-11");
    expect(
      rail.getByLabelText("Agrandir la barre latérale").className,
    ).toContain("h-11 w-11");
    expect(rail.getByLabelText("Observations").className).toContain(
      "h-11 w-11",
    );
    expect(rail.getByLabelText("Raccourcis clavier").className).toContain(
      "h-11 w-11",
    );
  });
});
