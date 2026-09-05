import { describe, expect, it, vi } from "vitest";

const getPatientById = vi.fn();

vi.mock("#/functions/patients.function", () => ({
  get getPatientById() {
    return getPatientById;
  },
}));

describe("GET /api/internal/patients/[id]", () => {
  it("transmet l'identifiant extrait du chemin dans la forme attendue par la fonction", async () => {
    getPatientById.mockReset();
    getPatientById.mockResolvedValue({ id: "patient-1" });
    const { GET } = await import("./route");

    await GET(new Request("http://localhost:3001/api/internal/patients/patient-1"), {
      params: Promise.resolve({ id: "patient-1" }),
    });

    expect(getPatientById).toHaveBeenCalledWith({ id: "patient-1" });
  });

  it("répond 401 quand l'organisation n'est pas résolue", async () => {
    getPatientById.mockReset();
    getPatientById.mockRejectedValue(new Error("Organization not found"));
    const { GET } = await import("./route");

    const response = await GET(
      new Request("http://localhost:3001/api/internal/patients/patient-1"),
      { params: Promise.resolve({ id: "patient-1" }) },
    );

    expect(response.status).toBe(401);
  });

  it("répond 404 quand le patient est introuvable", async () => {
    getPatientById.mockReset();
    getPatientById.mockResolvedValue(undefined);
    const { GET } = await import("./route");

    const response = await GET(
      new Request("http://localhost:3001/api/internal/patients/patient-inconnu"),
      { params: Promise.resolve({ id: "patient-inconnu" }) },
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Patient not found" });
  });
});
