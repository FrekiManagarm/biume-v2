// @vitest-environment jsdom

import { render, screen, within } from "@testing-library/react";
import { FileTextIcon } from "lucide-react";
import { describe, expect, test, vi } from "vitest";

import { ReportSidebarNavigation } from "./ReportSidebarNavigation";

describe("ReportSidebarNavigation", () => {
  const defaultProps = {
    title: "Rapport de suivi",
    categories: [
      {
        id: "main",
        name: "Rapport",
        icon: <FileTextIcon />,
        tabs: [
          {
            id: "clinical",
            label: "Clinique",
            icon: <FileTextIcon />,
          },
        ],
      },
    ],
    activeTab: "clinical",
    onChangeTab: vi.fn(),
    onGoBack: vi.fn(),
    onPreview: vi.fn(),
    onShortcuts: vi.fn(),
    onSave: vi.fn(),
    isSaving: false,
    getTabProgress: () => false,
    getTabCount: () => 0,
    hasUnsavedChanges: false,
    onTitleChange: vi.fn(),
    appointment: {
      beginAt: new Date("2026-07-10T09:00:00"),
      endAt: new Date("2026-07-10T10:00:00"),
      status: "CREATED",
      atHome: true,
    },
  };

  test("renders a simple report editing shell", () => {
    render(<ReportSidebarNavigation {...defaultProps} />);

    expect(screen.getByText("Edition du rapport")).not.toBeNull();
    expect(screen.getByText("Sections")).not.toBeNull();
    expect(screen.getByText("Rendez-vous")).not.toBeNull();
    expect(screen.getByDisplayValue("Rapport de suivi")).not.toBeNull();
  });

  test("uses application color tokens for the editor shell", () => {
    const { container } = render(<ReportSidebarNavigation {...defaultProps} />);
    const shellClassName = container.firstElementChild?.className ?? "";

    expect(shellClassName).toContain("border-border");
    expect(shellClassName).toContain("bg-card");
    expect(shellClassName).toContain("text-card-foreground");
    expect(shellClassName).not.toContain("slate-");
    expect(shellClassName).not.toContain("emerald-");
  });

  test("does not render focus mode controls", () => {
    render(<ReportSidebarNavigation {...defaultProps} />);

    expect(screen.queryByText("Mode focus")).toBeNull();
    expect(screen.queryByText("Quitter le mode focus")).toBeNull();
  });

  test("keeps collapsed rail controls centered with the same touch target", () => {
    const { container } = render(
      <ReportSidebarNavigation {...defaultProps} isCollapsed />,
    );
    const rail = within(container);

    expect(rail.getByLabelText("Retour").className).toContain("h-11 w-11");
    expect(rail.getByLabelText("Agrandir la barre latérale").className).toContain(
      "h-11 w-11",
    );
    expect(rail.getByLabelText("Clinique").className).toContain("h-11 w-11");
    expect(rail.getByLabelText("Aperçu").className).toContain("h-11 w-11");
    expect(rail.getByLabelText("Raccourcis clavier").className).toContain(
      "h-11 w-11",
    );
    expect(rail.getByLabelText("Finaliser le rapport").className).toContain(
      "h-11 w-11",
    );
    expect(rail.getByLabelText("Clinique").parentElement?.className).toContain(
      "items-center",
    );
  });
});
