import { afterEach, describe, expect, it, vi } from "vitest";

import { InternalFetchError, internalGet } from "./internal-fetch";

function mockFetchOnce(
  body: unknown,
  init: { ok: boolean; status: number; statusText: string } = {
    ok: true,
    status: 200,
    statusText: "OK",
  },
) {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  const fetchMock = vi.fn().mockResolvedValue({
    ok: init.ok,
    status: init.status,
    statusText: init.statusText,
    text: () => Promise.resolve(text),
  } as unknown as Response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("internalGet", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("omet les paramètres undefined de la query string", async () => {
    const fetchMock = mockFetchOnce({ ok: true });

    await internalGet("/api/internal/clients", {
      search: "a",
      page: undefined,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/internal/clients?search=a",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("n'ajoute pas de '?' quand la query est vide", async () => {
    const fetchMock = mockFetchOnce([]);

    await internalGet("/api/internal/clients", {});

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/internal/clients",
      expect.anything(),
    );
  });

  it("lève une InternalFetchError portant le statut sur une réponse non-ok", async () => {
    mockFetchOnce(
      { error: "Organization not found" },
      { ok: false, status: 401, statusText: "Unauthorized" },
    );

    const error: unknown = await internalGet("/api/internal/clients").catch(
      (e) => e,
    );

    expect(error).toBeInstanceOf(InternalFetchError);
    expect(error).toMatchObject({
      status: 401,
      path: "/api/internal/clients",
    });
  });

  it("ressuscite en Date les horodatages ISO imbriqués, sans toucher aux chaînes voisines non conformes", async () => {
    mockFetchOnce([
      {
        id: "c1",
        createdAt: "2026-09-05T10:00:00.000Z",
        birthDate: "2026-09-05",
        pets: [{ id: "p1", createdAt: "2026-09-05T10:00:00.000Z" }],
      },
    ]);

    const result = await internalGet<
      Array<{
        createdAt: unknown;
        birthDate: unknown;
        pets: Array<{ createdAt: unknown }>;
      }>
    >("/api/internal/clients");

    expect(result[0]?.createdAt).toBeInstanceOf(Date);
    expect(result[0]?.birthDate).toBe("2026-09-05");
    expect(result[0]?.pets[0]?.createdAt).toBeInstanceOf(Date);
  });
});
