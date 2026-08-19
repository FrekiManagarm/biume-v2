// @vitest-environment jsdom

import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import { cloneElement, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * Base UI (menu, dialogue) s'appuie sur des API de layout que jsdom
 * n'implémente pas. On reprend ici le doublage déjà posé par
 * `appointment-actions-menu.test.tsx` : ce test-ci ne vérifie pas le rendu du
 * menu, mais le câblage de la page — quelle mutation part quand le praticien
 * clique.
 */
vi.mock("@biume/ui/components/dropdown-menu", () => {
  const menus: HTMLDivElement[] = [];

  return {
    DropdownMenu: ({ children }: { children: ReactNode }) => <>{children}</>,
    DropdownMenuTrigger: ({
      render: trigger,
    }: {
      render: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
    }) =>
      cloneElement(trigger, {
        onClick: () => {
          for (const menu of menus) menu.hidden = false;
        },
      }),
    DropdownMenuContent: ({ children }: { children: ReactNode }) => (
      <div
        role="menu"
        hidden
        ref={(element) => {
          if (element) menus.push(element);
        }}
      >
        {children}
      </div>
    ),
    DropdownMenuItem: ({
      children,
      onClick,
    }: {
      children: ReactNode;
      onClick?: () => void;
      variant?: "default" | "destructive";
    }) => (
      <button type="button" role="menuitem" onClick={onClick}>
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

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const navigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
}));

const beginAt = new Date();
beginAt.setHours(9, 0, 0, 0);
const endAt = new Date();
endAt.setHours(10, 0, 0, 0);

const appointment = {
  id: "appointment-1",
  beginAt,
  endAt,
  status: "CREATED" as const,
  atHome: false,
  note: null,
  reports: [],
  patient: {
    id: "pet-1",
    name: "Oslo",
    animal: { name: "Chien", code: "dog" },
    owner: { id: "owner-1", name: "Camille Martin" },
  },
};

// Une séance annulée, demain : elle n'apparaît pas dans la journée
// sélectionnée (aujourd'hui) mais bien dans « À venir », où son état décide de
// ce que le praticien fera de sa journée.
const cancelledBeginAt = new Date(beginAt);
cancelledBeginAt.setDate(cancelledBeginAt.getDate() + 1);
const cancelledEndAt = new Date(endAt);
cancelledEndAt.setDate(cancelledEndAt.getDate() + 1);

const cancelledAppointment = {
  ...appointment,
  id: "appointment-2",
  beginAt: cancelledBeginAt,
  endAt: cancelledEndAt,
  status: "CANCELLED" as const,
  patient: { ...appointment.patient, id: "pet-2", name: "Nox" },
};

// Les paramètres sont déclarés (même inutilisés) pour que les assertions
// `toHaveBeenCalledWith` typent bien l'argument attendu.
const getAppointments = vi.fn(
  async (_range: { fromISO: string; toISO: string }) => [
    appointment,
    cancelledAppointment,
  ],
);
const createAppointment = vi.fn(async (_input: unknown) => ({ success: true }));
const updateAppointment = vi.fn(async (_input: unknown) => ({ success: true }));
const deleteAppointment = vi.fn(async (_input: unknown) => ({ success: true }));

vi.mock("#/lib/api/actions/appointments.action", () => ({
  getAppointments: (range: { fromISO: string; toISO: string }) =>
    getAppointments(range),
  createAppointment: (input: unknown) => createAppointment(input),
  updateAppointment: (input: unknown) => updateAppointment(input),
  deleteAppointment: (input: unknown) => deleteAppointment(input),
}));

const createReport = vi.fn(async (_input: unknown) => ({
  success: true as const,
  status: "draft" as const,
  reportId: "report-42",
}));

vi.mock("#/lib/api/actions/reports.action", () => ({
  createReport: (input: unknown) => createReport(input),
}));

vi.mock("#/lib/api/queries/patients.query", () => ({
  patientsQueryOptions: () => ({
    queryKey: ["patients", "list"] as const,
    queryFn: async () => [],
  }),
}));

import { AgendaPage } from "./agenda-page";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

const actionsLabel = `Actions – rendez-vous de Oslo à ${formatTime(beginAt)}`;

async function renderAgenda() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<p>Chargement</p>}>
        <AgendaPage />
      </Suspense>
    </QueryClientProvider>,
  );

  await screen.findByRole("button", { name: actionsLabel });
}

describe("AgendaPage", () => {
  it("crée le compte rendu manquant puis emmène le praticien dessus", async () => {
    await renderAgenda();

    fireEvent.click(
      screen.getByRole("button", { name: "Créer le compte rendu pour Oslo" }),
    );

    await waitFor(() => {
      expect(createReport).toHaveBeenCalledWith({
        petId: "pet-1",
        appointmentId: "appointment-1",
        status: "draft",
      });
    });

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({
        to: "/dashboard/reports/$id/edit",
        params: { id: "report-42" },
      });
    });
  });

  it("annule la séance en posant le statut CANCELLED, sans la supprimer", async () => {
    await renderAgenda();

    fireEvent.click(screen.getByRole("button", { name: actionsLabel }));
    fireEvent.click(
      screen.getByRole("menuitem", { name: "Annuler la séance" }),
    );

    await waitFor(() => {
      expect(updateAppointment).toHaveBeenCalledWith({
        appointmentId: "appointment-1",
        status: "CANCELLED",
      });
    });
    expect(deleteAppointment).not.toHaveBeenCalled();
  });

  it("ne supprime le rendez-vous qu'une fois la confirmation acceptée", async () => {
    await renderAgenda();

    fireEvent.click(screen.getByRole("button", { name: actionsLabel }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Supprimer" }));

    expect(deleteAppointment).not.toHaveBeenCalled();

    fireEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Supprimer",
      }),
    );

    await waitFor(() => {
      expect(deleteAppointment).toHaveBeenCalledWith("appointment-1");
    });
  });

  it("annonce l'état d'une séance annulée dans la ligne « À venir »", async () => {
    await renderAgenda();

    expect(
      screen.getByRole("heading", { name: "Prochains rendez-vous" }),
    ).toBeTruthy();

    // Correspondance exacte : l'animal d'abord, son état ensuite, et jamais la
    // date (le `meta`). Sans `statusLabel` composé dans le nom accessible,
    // « Annulé » ne serait qu'une pastille visuelle et cette requête
    // échouerait — un praticien au lecteur d'écran se déplacerait pour une
    // séance qui n'a plus lieu.
    const row = screen.getByRole("button", { name: "Nox, Annulé" });

    // La ligne ramène la journée sélectionnée sur ce rendez-vous : le panneau
    // de gauche affiche alors la séance annulée de demain.
    fireEvent.click(row);

    expect(
      screen.getByRole("article", {
        name: `Rendez-vous de Nox à ${formatTime(cancelledBeginAt)}`,
      }),
    ).toBeTruthy();
  });
});
