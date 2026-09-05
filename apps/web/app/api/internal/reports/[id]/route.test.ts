import { describe, expect, it, vi } from "vitest";

const getReportById = vi.fn();

vi.mock("#/functions/reports.function", () => ({
  get getReportById() { return getReportById; },
}));

describe("GET /api/internal/reports/[id]", () => {
  it("extrait l'identifiant du chemin et le transmet à getReportById", async () => {
    getReportById.mockReset();
    getReportById.mockResolvedValue({ id: "rep_42" });
    const { GET } = await import("./route");

    const response = await GET(
      new Request("http://localhost:3001/api/internal/reports/rep_42"),
      { params: Promise.resolve({ id: "rep_42" }) },
    );

    expect(getReportById).toHaveBeenCalledWith({ reportId: "rep_42" });
    await expect(response.json()).resolves.toEqual({ id: "rep_42" });
  });

  it("répond 401 quand l'organisation n'est pas résolue", async () => {
    getReportById.mockReset();
    getReportById.mockRejectedValue(new Error("Organization not found"));
    const { GET } = await import("./route");

    const response = await GET(
      new Request("http://localhost:3001/api/internal/reports/rep_42"),
      { params: Promise.resolve({ id: "rep_42" }) },
    );

    expect(response.status).toBe(401);
  });
});
