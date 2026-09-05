import { describe, expect, it, vi } from "vitest";

const getNewClientsMetric = vi.fn();
const getNewPatientsMetric = vi.fn();
const getSentReportsMetric = vi.fn();
const getRecentActivity = vi.fn();
const getDashboardAgendaDay = vi.fn();

vi.mock("#/functions/dashboard.function", () => ({
  get getNewClientsMetric() {
    return getNewClientsMetric;
  },
  get getNewPatientsMetric() {
    return getNewPatientsMetric;
  },
  get getSentReportsMetric() {
    return getSentReportsMetric;
  },
  get getRecentActivity() {
    return getRecentActivity;
  },
}));
vi.mock("#/functions/dashboard-agenda.function", () => ({
  get getDashboardAgendaDay() {
    return getDashboardAgendaDay;
  },
}));

describe("buildDashboardOverview", () => {
  it("compose les cinq lectures, avec les mêmes fenêtres que le route handler", async () => {
    getNewClientsMetric.mockResolvedValue({ value: 1 });
    getNewPatientsMetric.mockResolvedValue({ value: 2 });
    getSentReportsMetric.mockResolvedValue({ value: 3 });
    getRecentActivity.mockResolvedValue([{ id: "a1" }]);
    getDashboardAgendaDay.mockResolvedValue({
      selectedDate: "2026-09-05",
      appointments: [{ id: "ap1" }],
    });

    const { buildDashboardOverview } = await import("./overview");

    const overview = await buildDashboardOverview("2026-09-05");

    // Les fenêtres 90/90/30/5 sont celles de dashboard.query.ts : les changer
    // modifierait silencieusement les chiffres affichés aux praticiens.
    expect(getNewClientsMetric).toHaveBeenCalledWith(90);
    expect(getNewPatientsMetric).toHaveBeenCalledWith(90);
    expect(getSentReportsMetric).toHaveBeenCalledWith(30);
    expect(getRecentActivity).toHaveBeenCalledWith(5);
    expect(getDashboardAgendaDay).toHaveBeenCalledWith("2026-09-05");

    expect(overview.selectedDate).toBe("2026-09-05");
    expect(overview.appointments).toEqual([{ id: "ap1" }]);
    expect(overview.metrics).toEqual({
      newClients: { value: 1 },
      newPatients: { value: 2 },
      sentReports: { value: 3 },
    });
    expect(overview.recentActivity).toEqual([{ id: "a1" }]);
    // Appel direct (pas de réseau, pas de JSON) : `generatedAt` est un vrai
    // `Date`, pas une chaîne comme le rendrait le route handler.
    expect(overview.generatedAt).toBeInstanceOf(Date);
  });

  it("laisse remonter l'erreur d'organisation sans la traduire", async () => {
    getNewClientsMetric.mockRejectedValue(new Error("Organization not found"));

    const { buildDashboardOverview } = await import("./overview");

    await expect(buildDashboardOverview("2026-09-05")).rejects.toThrow(
      "Organization not found",
    );
  });
});
