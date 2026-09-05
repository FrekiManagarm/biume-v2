import { describe, expect, it, vi } from "vitest";

const getReportById = vi.fn();

vi.mock("#/functions/reports.function", () => ({
  get getReportById() {
    return getReportById;
  },
}));

describe("GET /api/reports/[id]/pdf", () => {
  it("rend le PDF du compte rendu et répond avec le bon Content-Type", async () => {
    getReportById.mockReset();
    getReportById.mockResolvedValue({
      success: true,
      data: {
        id: "rep_42",
        title: "Bilan locomoteur",
        createdAt: new Date("2026-07-14T09:00:00Z"),
        consultationReason: "Boiterie intermittente",
        notes: "RAS",
        patient: {
          name: "Mistral",
          animal: { code: "dog", name: "Chien" },
        },
        organization: { name: "Cabinet Biume Atlantique" },
        anatomicalIssues: [],
        recommendations: [],
        ownerContents: [],
      },
    });
    const { GET } = await import("./route");

    const response = await GET(
      new Request("http://localhost:3001/api/reports/rep_42/pdf"),
      { params: Promise.resolve({ id: "rep_42" }) },
    );

    expect(getReportById).toHaveBeenCalledWith({ reportId: "rep_42" });
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="rapport-rep_42.pdf"',
    );

    // Un PDF réellement rendu, pas un corps vide : preuve que le rendu
    // serveur (renderToBuffer + illustrations) fonctionne bout en bout.
    const buffer = Buffer.from(await response.arrayBuffer());
    expect(buffer.byteLength).toBeGreaterThan(1_000);
  });

  it("répond 404, pas 200, quand le compte rendu appartient à une autre entreprise", async () => {
    getReportById.mockReset();
    // `getReportById` scope déjà la lecture à l'organisation courante : un
    // compte rendu d'une autre entreprise ressort comme "introuvable", pas
    // comme une erreur d'autorisation. Le handler doit refuser de servir un
    // document médical dans ce cas — 404, jamais 200.
    getReportById.mockResolvedValue({ success: false, data: null });
    const { GET } = await import("./route");

    const response = await GET(
      new Request(
        "http://localhost:3001/api/reports/rep_autre_entreprise/pdf",
      ),
      { params: Promise.resolve({ id: "rep_autre_entreprise" }) },
    );

    expect(response.status).toBe(404);
  });
});
