import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

describe("tenant-isolated creation wiring", () => {
  test("createAppointment scopes its patient lookup before delegating the insert", () => {
    const source = readFileSync(
      new URL("./appointments.function.ts", import.meta.url),
      "utf8",
    );
    const createSource = source.slice(
      source.indexOf("export const createAppointment"),
      source.indexOf("export const updateAppointment"),
    );

    expect(createSource).toContain("createAppointmentWithPatientIsolation");
    expect(createSource).toContain("eq(pets.id, data.patientId)");
    expect(createSource).toContain("eq(pets.organizationId, organization.id)");
  });

  test("createReport scopes its patient and coherent appointment before delegating the insert", () => {
    const source = readFileSync(
      new URL("./reports.function.ts", import.meta.url),
      "utf8",
    );
    const createSource = source.slice(
      source.indexOf("export const createReport"),
      source.indexOf("export const getReportById"),
    );

    expect(createSource).toContain("createReportWithTenantIsolation");
    expect(createSource).toContain("eq(pets.id, patientId)");
    expect(createSource).toContain("eq(pets.organizationId, organization.id)");
    expect(createSource).toContain("eq(appointments.id, appointmentId)");
    expect(createSource).toContain(
      "eq(appointments.organizationId, organization.id)",
    );
    expect(createSource).toContain("eq(appointments.patientId, patientId)");
  });
});
