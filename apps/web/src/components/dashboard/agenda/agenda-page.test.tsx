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
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";

/**
 * Base UI (menu, dialogue) s'appuie sur des API de layout que jsdom
 * n'implémente pas. On reprend ici le doublage déjà posé par
 * `appointment-actions-menu.test.tsx` : ce test-ci ne vérifie pas le rendu du
 * menu, mais le câblage de la page — quelle mutation part, sur quel
 * rendez-vous, quand le praticien clique.
 *
 * Les menus s'ouvrent tous ensemble parce que la page en monte un par carte :
 * chaque test cible ensuite le menu par la carte qui le contient, ce qui est
 * précisément ce qu'on veut vérifier (le bon rendez-vous, pas le premier).
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

// `vi.hoisted` : le module sous test lit `toast` à son initialisation, donc le
// doublure doit exister avant que la fabrique de `vi.mock` soit évaluée.
const { toast } = vi.hoisted(() => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));
vi.mock("sonner", () => ({ toast }));

const navigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
}));

/**
 * jsdom n'implémente pas ResizeObserver, dont le `Switch` du dialogue de
 * modification a besoin.
 */
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??=
  ResizeObserverStub as unknown as typeof ResizeObserver;

/**
 * L'horloge est figée pour toute la suite.
 *
 * `deriveSessionState` ne rend « terminé » qu'une fois l'heure de fin passée :
 * un fixture posé à 09:00 « aujourd'hui » propose « Créer le compte rendu »
 * l'après-midi et « Préparer le compte rendu » le matin. La suite passait donc
 * ou échouait selon l'heure à laquelle elle était lancée. Seul `Date` est
 * doublé — `setTimeout` reste réel, ce dont `waitFor` a besoin.
 */
const fixedNow = new Date(2026, 7, 17, 14, 0, 0);

function todayAt(hours: number, minutes: number) {
  return new Date(2026, 7, 17, hours, minutes, 0);
}

function tomorrowAt(hours: number, minutes: number) {
  return new Date(2026, 7, 18, hours, minutes, 0);
}

function patient(id: string, name: string) {
  return {
    id,
    name,
    animal: { name: "Chien", code: "dog" },
    owner: { id: `owner-${id}`, name: "Camille Martin" },
  };
}

// Séance terminée, aucun compte rendu : « Créer le compte rendu ».
const oslo = {
  id: "appointment-oslo",
  beginAt: todayAt(9, 0),
  endAt: todayAt(10, 0),
  status: "CREATED" as const,
  atHome: false,
  note: null,
  reports: [],
  patient: patient("pet-oslo", "Oslo"),
};

// Deuxième séance du même jour : c'est elle que les tests destructifs visent,
// pour qu'un identifiant partagé, un index réutilisé ou un état hissé au
// niveau de la page ne puissent pas passer inaperçus.
const ipso = {
  ...oslo,
  id: "appointment-ipso",
  beginAt: todayAt(11, 0),
  endAt: todayAt(11, 30),
  patient: patient("pet-ipso", "Ipso"),
};

// Compte rendu déjà envoyé au propriétaire : on l'ouvre en lecture.
const vega = {
  ...oslo,
  id: "appointment-vega",
  beginAt: todayAt(12, 0),
  endAt: todayAt(12, 30),
  patient: patient("pet-vega", "Vega"),
  reports: [
    {
      id: "report-sent",
      status: "sent" as const,
      updatedAt: todayAt(12, 45),
      consultationReason: "Contrôle annuel",
      notes: null,
      anatomicalIssueCount: 1,
      recommendationCount: 1,
    },
  ],
};

// Brouillon commencé : on le reprend dans l'éditeur.
const milo = {
  ...oslo,
  id: "appointment-milo",
  beginAt: todayAt(13, 0),
  endAt: todayAt(13, 30),
  patient: patient("pet-milo", "Milo"),
  reports: [
    {
      id: "report-draft",
      status: "draft" as const,
      updatedAt: todayAt(13, 45),
      consultationReason: "Boiterie postérieur droit",
      notes: null,
      anatomicalIssueCount: 0,
      recommendationCount: 0,
    },
  ],
};

// Séance annulée, demain : absente de la journée sélectionnée, présente dans
// « À venir », où son état décide de ce que le praticien fait de sa journée.
const nox = {
  ...oslo,
  id: "appointment-nox",
  beginAt: tomorrowAt(9, 0),
  endAt: tomorrowAt(10, 0),
  status: "CANCELLED" as const,
  patient: patient("pet-nox", "Nox"),
};

const dayAppointments = [oslo, ipso, vega, milo, nox];

// Les paramètres sont déclarés (même inutilisés) pour que les assertions
// `toHaveBeenCalledWith` typent bien l'argument attendu.
const getAppointments = vi.fn(
  async (_range: { fromISO: string; toISO: string }) => dayAppointments,
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
    queryFn: async () => [
      {
        id: "pet-oslo",
        name: "Oslo",
        owner: { name: "Camille Martin" },
        animal: { name: "Chien" },
      },
    ],
  }),
}));

import { AgendaPage } from "./agenda-page";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(fixedNow);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function cardOf(animalName: string, beginAt: Date) {
  return screen.getByRole("article", {
    name: `Rendez-vous de ${animalName} à ${formatTime(beginAt)}`,
  });
}

/** Ouvre le menu d'actions porté par la carte de ce rendez-vous précis. */
function openActionsMenu(animalName: string, beginAt: Date) {
  const card = cardOf(animalName, beginAt);
  fireEvent.click(
    within(card).getByRole("button", {
      name: `Actions – rendez-vous de ${animalName} à ${formatTime(beginAt)}`,
    }),
  );

  return within(card).getByRole("menu");
}

async function renderAgenda() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const invalidateQueries = vi.spyOn(
    queryClient,
    "invalidateQueries",
  ) as MockInstance;

  render(
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<p>Chargement</p>}>
        <AgendaPage />
      </Suspense>
    </QueryClientProvider>,
  );

  await screen.findByRole("button", {
    name: "Créer le compte rendu pour Oslo",
  });

  return { invalidateQueries };
}

describe("AgendaPage", () => {
  it("crée le compte rendu manquant du rendez-vous cliqué puis emmène le praticien dessus", async () => {
    await renderAgenda();

    fireEvent.click(
      screen.getByRole("button", { name: "Créer le compte rendu pour Ipso" }),
    );

    await waitFor(() => {
      expect(createReport).toHaveBeenCalledWith({
        petId: "pet-ipso",
        appointmentId: "appointment-ipso",
        status: "draft",
      });
    });
    expect(createReport).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({
        to: "/dashboard/reports/$id/edit",
        params: { id: "report-42" },
      });
    });
  });

  it("ne crée qu'un seul compte rendu quand le praticien double-clique", async () => {
    await renderAgenda();

    // Le geste reste en vol : c'est exactement la situation où une interface
    // qui ne bouge pas invite au second clic.
    let resolveCreation: (value: {
      success: true;
      status: "draft";
      reportId: string;
    }) => void = () => undefined;
    createReport.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveCreation = resolve;
        }),
    );

    const button = screen.getByRole("button", {
      name: "Créer le compte rendu pour Oslo",
    });
    // Les deux clics partent dans le même tick, avant tout rendu : c'est la
    // garde synchrone, et non le bouton désactivé, qui doit retenir le second.
    fireEvent.click(button);
    fireEvent.click(button);

    // `mutateAsync` n'appelle la fonction de mutation qu'au tour de boucle
    // suivant : on attend le premier appel avant de compter.
    await waitFor(() => {
      expect(createReport).toHaveBeenCalledTimes(1);
    });
    await Promise.resolve();
    expect(createReport).toHaveBeenCalledTimes(1);

    // Le retour visuel manque autant que la garde : sans bouton désactivé,
    // le praticien cliquerait de nouveau.
    await waitFor(() => {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    });

    resolveCreation({
      success: true,
      status: "draft",
      reportId: "report-42",
    });

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledTimes(1);
    });
  });

  it("ouvre en lecture le compte rendu déjà envoyé au propriétaire", async () => {
    await renderAgenda();

    fireEvent.click(
      screen.getByRole("button", { name: "Voir le compte rendu pour Vega" }),
    );

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({
        to: "/dashboard/reports/$id",
        params: { id: "report-sent" },
      });
    });
    expect(createReport).not.toHaveBeenCalled();
  });

  it("reprend dans l'éditeur le brouillon déjà commencé", async () => {
    await renderAgenda();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Continuer le compte rendu pour Milo",
      }),
    );

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({
        to: "/dashboard/reports/$id/edit",
        params: { id: "report-draft" },
      });
    });
    expect(createReport).not.toHaveBeenCalled();
  });

  it("annule la séance visée, et elle seule, sans la supprimer", async () => {
    await renderAgenda();

    const menu = openActionsMenu("Ipso", ipso.beginAt);
    fireEvent.click(
      within(menu).getByRole("menuitem", { name: "Annuler la séance" }),
    );

    await waitFor(() => {
      expect(updateAppointment).toHaveBeenCalledWith({
        appointmentId: "appointment-ipso",
        status: "CANCELLED",
      });
    });
    expect(updateAppointment).toHaveBeenCalledTimes(1);
    expect(deleteAppointment).not.toHaveBeenCalled();
  });

  it("ne supprime que le rendez-vous visé, et seulement après confirmation", async () => {
    await renderAgenda();

    const menu = openActionsMenu("Ipso", ipso.beginAt);
    fireEvent.click(within(menu).getByRole("menuitem", { name: "Supprimer" }));

    expect(deleteAppointment).not.toHaveBeenCalled();

    fireEvent.click(
      within(screen.getByRole("alertdialog")).getByRole("button", {
        name: "Supprimer",
      }),
    );

    await waitFor(() => {
      expect(deleteAppointment).toHaveBeenCalledWith("appointment-ipso");
    });
    expect(deleteAppointment).toHaveBeenCalledTimes(1);
  });

  it("invalide le préfixe de clé, pas la fenêtre exacte, après une mutation", async () => {
    const { invalidateQueries } = await renderAgenda();

    const menu = openActionsMenu("Oslo", oslo.beginAt);
    fireEvent.click(
      within(menu).getByRole("menuitem", { name: "Annuler la séance" }),
    );

    // Le préfixe, et rien de plus : la liste est en cache sous la fenêtre
    // calculée par le loader SSR, à un instant qui n'est pas celui-ci. Une
    // clé complète ne la retrouverait pas et l'agenda ne se rafraîchirait pas.
    await waitFor(() => {
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["appointments", "list"],
      });
    });
  });

  it("prévient le praticien quand l'annulation échoue", async () => {
    await renderAgenda();
    updateAppointment.mockRejectedValueOnce(new Error("réseau"));

    const menu = openActionsMenu("Oslo", oslo.beginAt);
    fireEvent.click(
      within(menu).getByRole("menuitem", { name: "Annuler la séance" }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "La séance n'a pas pu être annulée. Réessayez.",
      );
    });
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("garde le dialogue de modification ouvert quand l'enregistrement échoue", async () => {
    await renderAgenda();
    updateAppointment.mockRejectedValueOnce(new Error("réseau"));

    const menu = openActionsMenu("Oslo", oslo.beginAt);
    fireEvent.click(within(menu).getByRole("menuitem", { name: "Modifier" }));

    const save = await screen.findByRole("button", { name: "Enregistrer" });
    fireEvent.click(save);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "La modification n'a pas pu être enregistrée. Réessayez.",
      );
    });

    // La fermeture du dialogue est ce que le praticien lit comme un succès :
    // sur un échec, il doit rester à l'écran, avec sa saisie.
    expect(screen.getByRole("button", { name: "Enregistrer" })).toBeTruthy();
  });

  it("dit au praticien que la création a échoué, au lieu de ne rien faire", async () => {
    await renderAgenda();
    createAppointment.mockRejectedValueOnce(new Error("réseau"));

    fireEvent.click(
      screen.getByRole("button", { name: "Nouveau rendez-vous" }),
    );
    fireEvent.change(await screen.findByLabelText("Patient"), {
      target: { value: "pet-oslo" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Créer le rendez-vous" }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Le rendez-vous n'a pas pu être créé. Réessayez.",
      );
    });

    // Le formulaire reste à l'écran : sa fermeture aurait dit « c'est créé ».
    expect(
      screen.getByRole("button", { name: "Créer le rendez-vous" }),
    ).toBeTruthy();
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
    fireEvent.click(screen.getByRole("button", { name: "Nox, Annulé" }));

    // La ligne ramène la journée sélectionnée sur ce rendez-vous.
    expect(cardOf("Nox", nox.beginAt)).toBeTruthy();
  });

  it("nomme chaque cellule du calendrier et y porte l'état autrement que par la couleur", async () => {
    await renderAgenda();

    const today = screen.getByRole("button", { name: "lundi 17 août" });

    expect(today.getAttribute("aria-current")).toBe("date");
    expect(today.getAttribute("aria-pressed")).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "mardi 18 août" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
  });
});
