import { beforeEach, describe, expect, it, vi } from "vitest";

const getSession = vi.fn();

vi.mock("@biume/auth", () => ({ auth: { api: { get getSession() { return getSession; } } } }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ cookie: "session=x" }) }));

describe("requireOrganizationId", () => {
  beforeEach(() => {
    vi.resetModules();
    getSession.mockReset();
  });

  it("rend l'organisation active portée par la session", async () => {
    getSession.mockResolvedValue({ session: { activeOrganizationId: "org_1" } });
    const { requireOrganizationId } = await import("./organization-scope");

    await expect(requireOrganizationId()).resolves.toBe("org_1");
  });

  it("transmet les en-têtes de la requête à la lecture de session", async () => {
    getSession.mockResolvedValue({ session: { activeOrganizationId: "org_1" } });
    const { requireOrganizationId } = await import("./organization-scope");

    await requireOrganizationId();

    // Sans les en-têtes, better-auth ne voit pas le cookie et toute lecture
    // deviendrait anonyme : chaque appelant recevrait un rejet plutôt que
    // ses données.
    const [call] = getSession.mock.calls;
    expect(call[0].headers.get("cookie")).toBe("session=x");
  });

  it("lève quand la session ne porte pas d'organisation active", async () => {
    getSession.mockResolvedValue({ session: { activeOrganizationId: null } });
    const { requireOrganizationId } = await import("./organization-scope");

    await expect(requireOrganizationId()).rejects.toThrow("Organization not found");
  });

  it("lève quand il n'y a pas de session du tout", async () => {
    getSession.mockResolvedValue(null);
    const { requireOrganizationId } = await import("./organization-scope");

    await expect(requireOrganizationId()).rejects.toThrow("Organization not found");
  });
});
