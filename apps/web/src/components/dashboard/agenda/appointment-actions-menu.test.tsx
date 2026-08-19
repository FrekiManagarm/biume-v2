// @vitest-environment jsdom

import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import { cloneElement } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Base UI (Menu) et le composant `AlertDialog` du design system s'appuient
// sur des API de layout (portails, mesure de position) que jsdom n'implémente
// pas. `EntityRowActions` (apps/web/src/components/dashboard/lists) a déjà
// posé ce motif de doublage pour un menu d'actions comparable : on le reprend
// ici pour rester isolé de Base UI tout en exerçant réellement le
// comportement accessible et les callbacks du composant.
vi.mock("@biume/ui/components/dropdown-menu", () => {
  let menu: HTMLDivElement | null = null;

  return {
    DropdownMenu: ({ children }: { children: ReactNode }) => {
      menu = null;
      return <>{children}</>;
    },
    DropdownMenuTrigger: ({
      render,
    }: {
      render: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
    }) =>
      cloneElement(render, {
        "aria-expanded": false,
        onClick: () => {
          if (menu) menu.hidden = false;
        },
      }),
    DropdownMenuContent: ({ children }: { children: ReactNode }) => (
      <div
        role="menu"
        hidden
        ref={(element) => {
          menu = element;
        }}
      >
        {children}
      </div>
    ),
    DropdownMenuItem: ({
      children,
      onClick,
      variant,
    }: {
      children: ReactNode;
      onClick?: () => void;
      variant?: "default" | "destructive";
    }) => (
      <button
        type="button"
        role="menuitem"
        data-variant={variant}
        onClick={onClick}
      >
        {children}
      </button>
    ),
    DropdownMenuSeparator: () => <hr role="separator" />,
  };
});

vi.mock("#/components/ui/alert-dialog", () => {
  let changeOpen: (open: boolean) => void = () => undefined;

  return {
    AlertDialog: ({
      children,
      open,
      onOpenChange,
    }: {
      children: ReactNode;
      open: boolean;
      onOpenChange: (open: boolean) => void;
    }) => {
      changeOpen = onOpenChange;
      return open ? <>{children}</> : null;
    },
    AlertDialogContent: ({ children }: { children: ReactNode }) => (
      <div role="alertdialog">{children}</div>
    ),
    AlertDialogHeader: ({ children }: { children: ReactNode }) => (
      <header>{children}</header>
    ),
    AlertDialogTitle: ({ children }: { children: ReactNode }) => (
      <h2>{children}</h2>
    ),
    AlertDialogDescription: ({ children }: { children: ReactNode }) => (
      <p>{children}</p>
    ),
    AlertDialogFooter: ({ children }: { children: ReactNode }) => (
      <footer>{children}</footer>
    ),
    AlertDialogCancel: ({ children }: { children: ReactNode }) => (
      <button type="button" onClick={() => changeOpen(false)}>
        {children}
      </button>
    ),
    AlertDialogAction: ({
      children,
      onClick,
    }: ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button type="button" onClick={onClick}>
        {children}
      </button>
    ),
  };
});

import { AppointmentActionsMenu } from "./appointment-actions-menu";

afterEach(cleanup);

const appointmentLabel = "rendez-vous de Nox à 14:00";

describe("AppointmentActionsMenu", () => {
  it("nomme le déclencheur d'après le rendez-vous concerné et expose les gestes dans l'ordre attendu", () => {
    const onEdit = vi.fn();
    render(
      <AppointmentActionsMenu
        appointmentLabel={appointmentLabel}
        onEdit={onEdit}
        onCancel={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    // Nom accessible exact : sur une journée à dix rendez-vous, un libellé
    // générique « Actions » ne permettrait plus de les distinguer.
    fireEvent.click(
      screen.getByRole("button", { name: "Actions – rendez-vous de Nox à 14:00" }),
    );

    const menu = screen.getByRole("menu");
    expect(
      within(menu)
        .getAllByRole("menuitem")
        .map((item) => item.textContent),
    ).toEqual(["Modifier", "Annuler la séance", "Supprimer"]);

    expect(
      within(menu).getByRole("menuitem", { name: "Supprimer" }).dataset
        .variant,
    ).toBe("destructive");

    fireEvent.click(within(menu).getByRole("menuitem", { name: "Modifier" }));
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it("appelle le rappel d'annulation directement, sans confirmation", () => {
    const onCancel = vi.fn();
    render(
      <AppointmentActionsMenu
        appointmentLabel={appointmentLabel}
        onEdit={vi.fn()}
        onCancel={onCancel}
        onDelete={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Actions – rendez-vous de Nox à 14:00" }),
    );
    fireEvent.click(
      screen.getByRole("menuitem", { name: "Annuler la séance" }),
    );

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("ne supprime qu'après confirmation, et pas quand le praticien renonce", () => {
    const onDelete = vi.fn();
    render(
      <AppointmentActionsMenu
        appointmentLabel={appointmentLabel}
        onEdit={vi.fn()}
        onCancel={vi.fn()}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Actions – rendez-vous de Nox à 14:00" }),
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Supprimer" }));

    // Le clic sur l'entrée de menu ouvre une confirmation, il ne supprime pas.
    expect(onDelete).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { name: "Supprimer ce rendez-vous ?" }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Ne pas supprimer" }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("supprime une fois la confirmation acceptée", () => {
    const onDelete = vi.fn();
    render(
      <AppointmentActionsMenu
        appointmentLabel={appointmentLabel}
        onEdit={vi.fn()}
        onCancel={vi.fn()}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Actions – rendez-vous de Nox à 14:00" }),
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Supprimer" }));
    fireEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Supprimer",
      }),
    );

    expect(onDelete).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  it("désactive le déclencheur quand `disabled` est posé", () => {
    render(
      <AppointmentActionsMenu
        appointmentLabel={appointmentLabel}
        disabled
        onEdit={vi.fn()}
        onCancel={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(
      (
        screen.getByRole("button", {
          name: "Actions – rendez-vous de Nox à 14:00",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });
});
