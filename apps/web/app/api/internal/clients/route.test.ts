import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

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

  it("répond 400 quand un paramètre est malformé (page non numérique)", async () => {
    getAllClients.mockReset();
    // `?page=abc` devient `Number("abc")` = `NaN` avant d'atteindre
    // `getAllClients` ; c'est là, dans la vraie fonction, que le schéma Zod
    // rejette `NaN`. Ici on simule directement ce rejet pour vérifier que le
    // handler le distingue d'un 500 : une faute du client n'est pas une
    // panne serveur.
    const result = z.object({ page: z.number() }).safeParse({ page: NaN });
    if (result.success) {
      throw new Error("le safeParse aurait dû échouer");
    }
    getAllClients.mockRejectedValue(result.error);
    const { GET } = await import("./route");

    const response = await GET(
      new Request("http://localhost:3001/api/internal/clients?page=abc"),
    );

    expect(response.status).toBe(400);
  });
});
