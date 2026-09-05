import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const requireActiveBilling = vi.fn();
const getSession = vi.fn();
const getOrganizationSettings = vi.fn();
const updateOrganization = vi.fn();
const updateUserNotifications = vi.fn();

beforeEach(() => {
  requireActiveBilling.mockReset();
  getSession.mockReset();
  getOrganizationSettings.mockReset();
  updateOrganization.mockReset();
  updateUserNotifications.mockReset();
});

vi.mock("#/lib/dashboard-billing-guard", () => ({
  get requireActiveBilling() {
    return requireActiveBilling;
  },
}));

vi.mock("#/functions/auth.function", () => ({
  get getSession() {
    return getSession;
  },
}));

vi.mock("#/functions/organization.function", () => ({
  get getOrganizationSettings() {
    return getOrganizationSettings;
  },
}));

// `settings-view.tsx` (importé plus bas, non mocké — c'est la vue réelle
// qu'on veut prouver câblée) importe les deux mutations depuis
// `lib/api/actions/*.mutations` : mockées ici pour ne pas charger leur
// import réel vers `#/functions/organization.function`/`user.function`
// (`import "server-only"` + Drizzle), hors périmètre de ce test.
vi.mock("#/lib/api/actions/organization.mutations", () => ({
  get updateOrganization() {
    return updateOrganization;
  },
}));

vi.mock("#/lib/api/actions/user.mutations", () => ({
  get updateUserNotifications() {
    return updateUserNotifications;
  },
}));

/**
 * Ce test couvre le câblage propre à `page.tsx` — pas la présence de
 * `requireActiveBilling` (déjà couverte, tous fichiers confondus, par
 * `lib/dashboard-billing-guard-pages.test.ts`) : que la garde est bien
 * appelée *avant* toute lecture de données, et que `session`/`organization`
 * (deux lectures, jamais du react-query sous TanStack) atterrissent bien en
 * props de `SettingsView`. `/dashboard/settings` est la seule page du
 * dashboard exemptée du paywall — vérifié au navigateur avec un compte sans
 * abonnement (voir le rapport de tâche), pas ici : `requireActiveBilling`
 * gère seule cette exemption (lit l'en-tête de chemin), ce test n'a donc
 * qu'à vérifier qu'elle est appelée comme sur toute autre page.
 */
describe("app/dashboard/settings/page", () => {
  it("appelle requireActiveBilling puis passe session et organisation à SettingsView", async () => {
    requireActiveBilling.mockResolvedValue(undefined);
    const sessionFixture = {
      user: { id: "user-1", emailNotifications: true },
      session: { activeOrganizationId: "org-1" },
    };
    const organizationFixture = { id: "org-1", name: "Clinique Les Alizés" };
    getSession.mockResolvedValue(sessionFixture);
    getOrganizationSettings.mockResolvedValue(organizationFixture);

    const { default: Page } = await import("./page");
    const { SettingsView } = await import("./settings-view");

    const element = (await Page()) as ReactElement<{
      children: ReactElement<Record<string, unknown>>;
    }>;

    expect(requireActiveBilling).toHaveBeenCalledTimes(1);

    const view = element.props.children;

    expect(view.type).toBe(SettingsView);
    expect(view.props.session).toEqual(sessionFixture);
    expect(view.props.organization).toEqual(organizationFixture);
  });

  it("ne fait aucune lecture avant que la garde de facturation ait résolu", async () => {
    let billingResolved = false;
    requireActiveBilling.mockImplementation(async () => {
      billingResolved = true;
    });
    getSession.mockImplementation(async () => {
      expect(billingResolved).toBe(true);
      return null;
    });
    getOrganizationSettings.mockResolvedValue({
      id: "org-1",
      name: "Clinique Les Alizés",
    });

    const { default: Page } = await import("./page");

    await Page();

    expect(getSession).toHaveBeenCalledTimes(1);
  });
});
