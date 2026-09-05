import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const requireActiveBilling = vi.fn();
const getAllClients = vi.fn();

beforeEach(() => {
  requireActiveBilling.mockReset();
  getAllClients.mockReset();
});

// `clients.function.ts` porte `import "server-only"` : Vitest ne pose pas la
// condition de résolution `react-server` que Next applique en production,
// donc le vrai module lèverait "This module cannot be imported from a Client
// Component module" au chargement (même motif que
// `server/dashboard/overview.test.ts`).
vi.mock("server-only", () => ({}));

vi.mock("#/lib/dashboard-billing-guard", () => ({
  get requireActiveBilling() {
    return requireActiveBilling;
  },
}));

vi.mock("#/functions/clients.function", () => ({
  get getAllClients() {
    return getAllClients;
  },
}));

/**
 * Ce test couvre le câblage propre à `page.tsx` — pas la présence de
 * `requireActiveBilling` (déjà couverte, tous fichiers confondus, par
 * `lib/dashboard-billing-guard-pages.test.ts`) : que la garde est bien
 * appelée *avant* toute lecture de données, et que la première page de
 * clients lue côté serveur atterrit dans le cache que `ClientsView`
 * relit au montage (même `queryKey` que `clientsQueryOptions`).
 */
describe("app/dashboard/clients/page", () => {
  it("appelle requireActiveBilling puis précharge les clients pour ClientsView", async () => {
    requireActiveBilling.mockResolvedValue(undefined);
    const fixture = [{ id: "client-1", name: "Marie Dupont" }];
    getAllClients.mockResolvedValue(fixture);

    const { default: Page } = await import("./page");
    const { ClientsView } = await import("./clients-view");
    const { clientsQueryOptions } = await import(
      "#/lib/api/queries/clients.query"
    );

    const element = (await Page({
      searchParams: Promise.resolve({ search: "mar" }),
    })) as ReactElement<{ children: ReactElement<Record<string, unknown>> }>;

    expect(requireActiveBilling).toHaveBeenCalledTimes(1);
    expect(getAllClients).toHaveBeenCalledWith({ search: "mar", limit: 250 });

    const hydrationBoundary = element.props.children;
    const view = hydrationBoundary.props.children as ReactElement;

    expect(view.type).toBe(ClientsView);

    const expectedKey = clientsQueryOptions({
      search: "mar",
      limit: 250,
    }).queryKey;
    const dehydratedState = hydrationBoundary.props.state as {
      queries: Array<{ queryKey: unknown; state: { data: unknown } }>;
    };
    const cachedQuery = dehydratedState.queries.find(
      (query) => JSON.stringify(query.queryKey) === JSON.stringify(expectedKey),
    );

    expect(cachedQuery?.state.data).toEqual(fixture);
  });

  it("ne fait aucune lecture avant que la garde de facturation ait résolu", async () => {
    let billingResolved = false;
    requireActiveBilling.mockImplementation(async () => {
      billingResolved = true;
    });
    getAllClients.mockImplementation(async () => {
      expect(billingResolved).toBe(true);
      return [];
    });

    const { default: Page } = await import("./page");

    await Page({ searchParams: Promise.resolve({}) });

    expect(getAllClients).toHaveBeenCalledTimes(1);
  });
});
