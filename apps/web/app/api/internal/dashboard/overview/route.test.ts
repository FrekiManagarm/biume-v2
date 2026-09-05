import { describe, expect, it, vi } from "vitest";

const getNewClientsMetric = vi.fn();
const getNewPatientsMetric = vi.fn();
const getSentReportsMetric = vi.fn();
const getRecentActivity = vi.fn();
const getDashboardAgendaDay = vi.fn();

vi.mock("#/functions/dashboard.function", () => ({
  get getNewClientsMetric() { return getNewClientsMetric; },
  get getNewPatientsMetric() { return getNewPatientsMetric; },
  get getSentReportsMetric() { return getSentReportsMetric; },
  get getRecentActivity() { return getRecentActivity; },
}));
vi.mock("#/functions/dashboard-agenda.function", () => ({
  get getDashboardAgendaDay() { return getDashboardAgendaDay; },
}));

describe("GET /api/internal/dashboard/overview", () => {
  it("compose les cinq lectures côté serveur, avec les mêmes fenêtres qu'avant", async () => {
    getNewClientsMetric.mockResolvedValue({ value: 1 });
    getNewPatientsMetric.mockResolvedValue({ value: 2 });
    getSentReportsMetric.mockResolvedValue({ value: 3 });
    getRecentActivity.mockResolvedValue([{ id: "a1" }]);
    getDashboardAgendaDay.mockResolvedValue({
      selectedDate: "2026-09-05",
      appointments: [{ id: "ap1" }],
    });
    const { GET } = await import("./route");

    const response = await GET(
      new Request("http://localhost:3001/api/internal/dashboard/overview?date=2026-09-05"),
    );
    const body = await response.json();

    // Les fenêtres 90/90/30/5 sont celles de dashboard.query.ts : les changer
    // modifierait silencieusement les chiffres affichés aux praticiens.
    expect(getNewClientsMetric).toHaveBeenCalledWith(90);
    expect(getNewPatientsMetric).toHaveBeenCalledWith(90);
    expect(getSentReportsMetric).toHaveBeenCalledWith(30);
    expect(getRecentActivity).toHaveBeenCalledWith(5);
    expect(getDashboardAgendaDay).toHaveBeenCalledWith("2026-09-05");

    expect(body.selectedDate).toBe("2026-09-05");
    expect(body.appointments).toEqual([{ id: "ap1" }]);
    expect(body.metrics).toEqual({
      newClients: { value: 1 },
      newPatients: { value: 2 },
      sentReports: { value: 3 },
    });
    expect(body.recentActivity).toEqual([{ id: "a1" }]);
    expect(typeof body.generatedAt).toBe("string");
  });

  it("répond 401 quand l'organisation n'est pas résolue", async () => {
    getNewClientsMetric.mockRejectedValue(new Error("Organization not found"));
    const { GET } = await import("./route");

    const response = await GET(
      new Request("http://localhost:3001/api/internal/dashboard/overview?date=2026-09-05"),
    );

    expect(response.status).toBe(401);
  });
});
