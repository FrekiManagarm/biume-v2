import { describe, expect, it, vi } from "vitest";

const getAppointments = vi.fn();

vi.mock("#/functions/appointments.function", () => ({
  get getAppointments() {
    return getAppointments;
  },
}));

describe("GET /api/internal/appointments", () => {
  it("transmet l'intervalle de dates tel qu'il est écrit dans l'URL", async () => {
    getAppointments.mockReset();
    getAppointments.mockResolvedValue([]);
    const { GET } = await import("./route");

    await GET(
      new Request(
        "http://localhost:3001/api/internal/appointments?fromISO=2026-09-01T00:00:00.000Z&toISO=2026-09-30T23:59:59.999Z",
      ),
    );

    expect(getAppointments).toHaveBeenCalledWith({
      fromISO: "2026-09-01T00:00:00.000Z",
      toISO: "2026-09-30T23:59:59.999Z",
    });
  });

  it("répond 401 quand l'organisation n'est pas résolue", async () => {
    getAppointments.mockReset();
    getAppointments.mockRejectedValue(new Error("Organization not found"));
    const { GET } = await import("./route");

    const response = await GET(new Request("http://localhost:3001/api/internal/appointments"));

    expect(response.status).toBe(401);
  });
});
