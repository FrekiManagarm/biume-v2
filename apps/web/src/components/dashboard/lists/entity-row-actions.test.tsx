// @vitest-environment jsdom

import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import { cloneElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// Base UI currently resolves through a second physical React copy in this test
// workspace. These small doubles isolate only its menu/dialog wrappers while the
// component's accessible behavior and callbacks remain exercised end-to-end.
vi.mock("#/components/ui/button", () => ({
  Button: ({
    size: _size,
    variant: _variant,
    ...props
  }: ButtonHTMLAttributes<HTMLButtonElement> & {
    size?: string;
    variant?: string;
  }) => <button {...props} />,
}));

vi.mock("#/components/ui/dropdown-menu", () => {
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
      <div>{children}</div>
    ),
    AlertDialogFooter: ({ children }: { children: ReactNode }) => (
      <footer>{children}</footer>
    ),
    AlertDialogCancel: ({
      children,
      disabled,
    }: {
      children: ReactNode;
      disabled?: boolean;
    }) => (
      <button type="button" disabled={disabled}>
        {children}
      </button>
    ),
    AlertDialogAction: ({
      children,
      disabled,
      onClick,
    }: ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button
        type="button"
        disabled={disabled}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) changeOpen(false);
        }}
      >
        {children}
      </button>
    ),
  };
});

import { DeleteEntityDialog, EntityRowActions } from "./entity-row-actions";

afterEach(cleanup);

describe("EntityRowActions", () => {
  test("exposes ordered actions and calls the edit callback", () => {
    const onEdit = vi.fn();
    render(
      <EntityRowActions
        entityName="Nala"
        onView={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Actions pour Nala" }));

    const menu = screen.getByRole("menu");
    expect(
      within(menu)
        .getAllByRole("menuitem")
        .map((item) => item.textContent),
    ).toEqual(["Consulter", "Modifier", "Supprimer"]);

    expect(
      within(menu).getByRole("menuitem", { name: "Supprimer" }).dataset.variant,
    ).toBe("destructive");

    fireEvent.click(within(menu).getByRole("menuitem", { name: "Modifier" }));
    expect(onEdit).toHaveBeenCalledOnce();
  });
});

describe("DeleteEntityDialog", () => {
  beforeEach(() => vi.clearAllMocks());

  test("shows cascade details and prevents automatic close on confirmation", () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <DeleteEntityDialog
        open
        onOpenChange={onOpenChange}
        title="Supprimer Nala ?"
        description="Ses rendez-vous et comptes rendus seront aussi supprimés."
        confirmLabel="Supprimer"
        onConfirm={onConfirm}
      />,
    );

    expect(
      screen.getByText(
        "Ses rendez-vous et comptes rendus seront aussi supprimés.",
      ),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Supprimer" }));

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toBeTruthy();
  });

  test("disables both buttons and shows pending copy while deleting", () => {
    render(
      <DeleteEntityDialog
        open
        onOpenChange={vi.fn()}
        title="Supprimer Nala ?"
        description="Cette suppression est définitive."
        isPending
        onConfirm={vi.fn()}
      />,
    );

    expect(
      (screen.getByRole("button", { name: "Annuler" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(
      (
        screen.getByRole("button", {
          name: "Suppression…",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });
});
