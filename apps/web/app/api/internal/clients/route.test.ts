import { describe, expect, it, vi } from "vitest";

const getAllClients = vi.fn();

vi.mock("#/functions/clients.function", () => ({
  get getAllClients() { return getAllClients; },
}));

describe("GET /api/internal/clients", () => {
  it("transmet les paramètres d'URL typés à getAllClients", async () => {
    getAllClients.mockReset();
    getAllClients.mockResolvedValue([{ id: "c1" }]);
    const { GET } = await import("./route");

    const response = await GET(
      new Request("http://localhost:3001/api/internal/clients?search=du&page=2&limit=50"),
    );

    // Les paramètres arrivent en chaînes dans l'URL ; le handler doit les
    // rendre au type que la fonction attend, sinon `page` vaut "2" et la
    // pagination casse en silence.
    expect(getAllClients).toHaveBeenCalledWith({ search: "du", page: 2, limit: 50 });
    await expect(response.json()).resolves.toEqual([{ id: "c1" }]);
  });

  it("appelle getAllClients sans paramètre quand l'URL n'en porte pas", async () => {
    getAllClients.mockReset();
    getAllClients.mockResolvedValue([]);
    const { GET } = await import("./route");

    await GET(new Request("http://localhost:3001/api/internal/clients"));

    expect(getAllClients).toHaveBeenCalledWith({});
  });

  it("répond 401 quand l'organisation n'est pas résolue", async () => {
    getAllClients.mockReset();
    getAllClients.mockRejectedValue(new Error("Organization not found"));
    const { GET } = await import("./route");

    const response = await GET(new Request("http://localhost:3001/api/internal/clients"));

    expect(response.status).toBe(401);
  });
});
