import { describe, expect, it, vi } from "vitest";

vi.mock("#/server/mobile/mobile-api", () => ({
  handleMobileApiRequest: vi.fn(
    async (request: Request) =>
      new Response(
        JSON.stringify({ url: request.url, method: request.method }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
  ),
}));

describe("route /api/mobile/v1/[[...path]]", () => {
  it("transmet le chemin complet, base comprise, à l'application Hono", async () => {
    const { GET } = await import("./route");
    const request = new Request(
      "http://localhost:3001/api/mobile/v1/agenda?from=2026-09-05",
      { method: "GET" },
    );

    const response = await GET(request);

    // L'application Hono fait .basePath("/api/mobile/v1") et route sur l'URL
    // entière : la moindre réécriture du chemin ici casserait tout l'agenda.
    await expect(response.json()).resolves.toEqual({
      url: "http://localhost:3001/api/mobile/v1/agenda?from=2026-09-05",
      method: "GET",
    });
  });

  it("expose les trois méthodes que servait la route TanStack", async () => {
    const route = await import("./route");

    expect(typeof route.GET).toBe("function");
    expect(typeof route.POST).toBe("function");
    expect(typeof route.DELETE).toBe("function");
  });
});
