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

  test("createQuickReport atomically inserts tenant-scoped owner, animal, report, and decisions", () => {
    const source = readFileSync(
      new URL("./reports.function.ts", import.meta.url),
      "utf8",
    );
    const createSource = source.slice(
      source.indexOf("export const createQuickReport"),
      source.indexOf("export const getReportById"),
    );

    expect(createSource).toContain("organization.id");
    expect(createSource).toContain("db.batch");
    expect(createSource).toContain("clients");
    expect(createSource).toContain("pets");
    expect(createSource).toContain("advancedReport");
    expect(createSource).toContain("reportSectionState");
  });
});

describe("tenant-isolated update wiring", () => {
  test("updateAppointment scopes the appointment and changed patient before update", () => {
    const source = readFileSync(
      new URL("./appointments.function.ts", import.meta.url),
      "utf8",
    );
    const updateSource = source.slice(
      source.indexOf("export const updateAppointment"),
      source.indexOf("export const deleteAppointment"),
    );

    expect(updateSource).toContain("updateAppointmentWithTenantIsolation");
    expect(updateSource).toContain("patientId !== undefined");
    expect(updateSource).toContain("eq(appointments.id, appointmentId)");
    expect(updateSource).toContain(
      "eq(appointments.organizationId, organization.id)",
    );
    expect(updateSource).toContain("eq(pets.id, patientId)");
    expect(updateSource).toContain("eq(pets.organizationId, organization.id)");
  });

  test("updateReport scopes report, patient, and coherent current or requested appointment", () => {
    const source = readFileSync(
      new URL("./reports.function.ts", import.meta.url),
      "utf8",
    );
    const updateSource = source.slice(
      source.indexOf("export const updateReport"),
      source.indexOf("export const getAnatomicalParts"),
    );

    expect(updateSource).toContain("updateReportWithTenantIsolation");
    expect(updateSource).toContain(
      "eq(advancedReport.createdBy, organization.id)",
    );
    expect(updateSource).toContain("eq(pets.id, patientId)");
    expect(updateSource).toContain("eq(pets.organizationId, organization.id)");
    expect(updateSource).toContain(
      "eq(appointments.id, resolvedAppointmentId)",
    );
    expect(updateSource).toContain(
      "eq(appointments.organizationId, organization.id)",
    );
    expect(updateSource).toContain("eq(appointments.patientId, patientId)");
  });
});
