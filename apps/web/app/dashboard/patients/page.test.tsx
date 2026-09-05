import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const requireActiveBilling = vi.fn();
const getAllPatients = vi.fn();
const getAllAnimals = vi.fn();
const getAllClients = vi.fn();

beforeEach(() => {
  requireActiveBilling.mockReset();
  getAllPatients.mockReset();
  getAllAnimals.mockReset();
  getAllClients.mockReset();
});

// `patients.function.ts` et `clients.function.ts` portent `import
// "server-only"` : Vitest ne pose pas la condition de résolution
// `react-server` que Next applique en production, donc les vrais modules
// lèveraient "This module cannot be imported from a Client Component
// module" au chargement (même motif que
// `app/api/internal/dashboard/overview/route.test.ts`).
vi.mock("server-only", () => ({}));

vi.mock("#/lib/dashboard-billing-guard", () => ({
  get requireActiveBilling() {
    return requireActiveBilling;
  },
}));

vi.mock("#/functions/patients.function", () => ({
  get getAllPatients() {
    return getAllPatients;
  },
  get getAllAnimals() {
    return getAllAnimals;
  },
}));

vi.mock("#/functions/clients.function", () => ({
  get getAllClients() {
    return getAllClients;
  },
}));

// `patients-view.tsx` (importé plus bas, non mocké — c'est la vue réelle
// qu'on veut prouver câblée) monte `AnimalCredenza`
// (`#/components/animal-folder`), dont un onglet importe
// `#/lib/api/actions/medicalDocuments.action`, qui importe à son tour
// `medicalDocuments.mutations` ("use server", chargé pour de vrai — ce
// n'est pas un `*.action.ts` couvert par la règle 3), qui importe en
// position de VALEUR `#/functions/medical-documents.function` (`import
// "server-only"` + `@biume/db`). Ni `AnimalCredenza` ni ce module ne sont
// dans le périmètre de cette tâche : mocké uniquement pour que l'import de
// `patients-view.tsx` ne déclenche pas une vraie connexion base de données.
vi.mock("#/functions/medical-documents.function", () => ({}));

/**
 * Ce test couvre le câblage propre à `page.tsx` — pas la présence de
 * `requireActiveBilling` (déjà couverte, tous fichiers confondus, par
 * `lib/dashboard-billing-guard-pages.test.ts`) : que la garde est bien
 * appelée *avant* toute lecture de données, et que les trois lectures
 * (patients, clients, animaux) atterrissent dans le cache que
 * `PatientsView` relit au montage (mêmes `queryKey` que
 * `patientsQueryOptions`/`clientsQueryOptions`/`animalsQueryOptions`).
 */
describe("app/dashboard/patients/page", () => {
  it("appelle requireActiveBilling puis précharge patients, clients et animaux pour PatientsView", async () => {
    requireActiveBilling.mockResolvedValue(undefined);
    const patientsFixture = [{ id: "patient-1", name: "Nala" }];
    const clientsFixture = [{ id: "client-1", name: "Marie Dupont" }];
    const animalsFixture = [{ id: "animal-1", name: "Chien", code: "dog" }];
    getAllPatients.mockResolvedValue(patientsFixture);
    getAllClients.mockResolvedValue(clientsFixture);
    getAllAnimals.mockResolvedValue(animalsFixture);

    const { default: Page } = await import("./page");
    const { PatientsView } = await import("./patients-view");
    const { clientsQueryOptions } = await import(
      "#/lib/api/queries/clients.query"
    );
    const { animalsQueryOptions, patientsQueryOptions } = await import(
      "#/lib/api/queries/patients.query"
    );

    const element = (await Page({
      searchParams: Promise.resolve({ search: "nal", type: "Chien" }),
    })) as ReactElement<{ children: ReactElement<Record<string, unknown>> }>;

    expect(requireActiveBilling).toHaveBeenCalledTimes(1);
    expect(getAllPatients).toHaveBeenCalledWith({
      search: "nal",
      type: "Chien",
      limit: 250,
    });
    expect(getAllClients).toHaveBeenCalledWith({ limit: 250 });
    expect(getAllAnimals).toHaveBeenCalledWith();

    const hydrationBoundary = element.props.children;
    const view = hydrationBoundary.props.children as ReactElement;

    expect(view.type).toBe(PatientsView);

    const dehydratedState = hydrationBoundary.props.state as {
      queries: Array<{ queryKey: unknown; state: { data: unknown } }>;
    };

    function dataFor(queryKey: unknown) {
      return dehydratedState.queries.find(
        (query) => JSON.stringify(query.queryKey) === JSON.stringify(queryKey),
      )?.state.data;
    }

    expect(
      dataFor(
        patientsQueryOptions({ search: "nal", type: "Chien", limit: 250 })
          .queryKey,
      ),
    ).toEqual(patientsFixture);
    expect(dataFor(clientsQueryOptions({ limit: 250 }).queryKey)).toEqual(
      clientsFixture,
    );
    expect(dataFor(animalsQueryOptions().queryKey)).toEqual(animalsFixture);
  });

  it("ne fait aucune lecture avant que la garde de facturation ait résolu", async () => {
    let billingResolved = false;
    requireActiveBilling.mockImplementation(async () => {
      billingResolved = true;
    });
    getAllPatients.mockImplementation(async () => {
      expect(billingResolved).toBe(true);
      return [];
    });
    getAllClients.mockResolvedValue([]);
    getAllAnimals.mockResolvedValue([]);

    const { default: Page } = await import("./page");

    await Page({ searchParams: Promise.resolve({}) });

    expect(getAllPatients).toHaveBeenCalledTimes(1);
  });
});
