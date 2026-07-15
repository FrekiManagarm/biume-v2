import { describe, expect, test, vi } from "vitest";

import {
  createAppointmentWithPatientIsolation,
  createPatientWithOwnerIsolation,
  createReportWithTenantIsolation,
  deleteClientWithPatientIsolation,
  deletePatientWithDependencyIsolation,
} from "./tenant-mutation-isolation";

const scopedPatientDependencies = {
  id: "patient-1",
  organizationId: "org-1",
  appointments: [
    {
      id: "appointment-1",
      organizationId: "org-1",
      reports: [{ id: "report-via-appointment", createdBy: "org-1" }],
    },
  ],
  advancedReport: [{ id: "report-1", createdBy: "org-1" }],
  medicalDocuments: [{ id: "document-1", uploadedBy: "org-1" }],
};

describe("createPatientWithOwnerIsolation", () => {
  test("rejects a missing or cross-organization owner before insert", async () => {
    const findOwner = vi.fn(async () => null);
    const insertPatient = vi.fn(async () => ({ id: "patient-1" }));

    await expect(
      createPatientWithOwnerIsolation({ findOwner, insertPatient }),
    ).rejects.toThrow("Propriétaire introuvable ou inaccessible.");
    expect(insertPatient).not.toHaveBeenCalled();
  });

  test("inserts only after finding the scoped owner", async () => {
    const calls: string[] = [];
    const findOwner = vi.fn(async () => {
      calls.push("owner");
      return { id: "client-1" };
    });
    const insertPatient = vi.fn(async () => {
      calls.push("insert");
      return { id: "patient-1" };
    });

    await expect(
      createPatientWithOwnerIsolation({ findOwner, insertPatient }),
    ).resolves.toEqual({ id: "patient-1" });
    expect(calls).toEqual(["owner", "insert"]);
  });
});

describe("deleteClientWithPatientIsolation", () => {
  test("never deletes when a linked patient belongs to another organization", async () => {
    const findClient = vi.fn(async () => ({ id: "client-1" }));
    const findForeignPatient = vi.fn(async () => ({ id: "patient-other-org" }));
    const deleteClient = vi.fn(async () => ({ id: "client-1" }));

    await expect(
      deleteClientWithPatientIsolation({
        deleteClient,
        findClient,
        findForeignPatient,
        findScopedPatients: async () => [],
        organizationId: "org-1",
      }),
    ).rejects.toThrow("intégrité");
    expect(deleteClient).not.toHaveBeenCalled();
  });

  test("deletes a scoped client when every linked patient is isolated", async () => {
    const findClient = vi.fn(async () => ({ id: "client-1" }));
    const findForeignPatient = vi.fn(async () => null);
    const deleteClient = vi.fn(async () => ({ id: "client-1" }));

    await expect(
      deleteClientWithPatientIsolation({
        deleteClient,
        findClient,
        findForeignPatient,
        findScopedPatients: async () => [scopedPatientDependencies],
        organizationId: "org-1",
      }),
    ).resolves.toEqual({ id: "client-1" });
    expect(deleteClient).toHaveBeenCalledOnce();
  });

  test.each([
    [
      "appointment",
      { appointments: [{ organizationId: "org-2", reports: [] }] },
    ],
    [
      "appointment without organization",
      { appointments: [{ organizationId: null, reports: [] }] },
    ],
    [
      "report attached through an appointment",
      {
        appointments: [
          {
            organizationId: "org-1",
            reports: [{ createdBy: "org-2", patientId: null }],
          },
        ],
      },
    ],
    ["direct report", { advancedReport: [{ createdBy: "org-2" }] }],
    ["report without creator", { advancedReport: [{ createdBy: null }] }],
    ["medical document", { medicalDocuments: [{ uploadedBy: "org-2" }] }],
  ])("never deletes when a patient has a foreign %s", async (_label, patch) => {
    const deleteClient = vi.fn(async () => ({ id: "client-1" }));

    await expect(
      deleteClientWithPatientIsolation({
        findClient: async () => ({ id: "client-1" }),
        findForeignPatient: async () => null,
        findScopedPatients: async () => [
          { ...scopedPatientDependencies, ...patch },
        ],
        organizationId: "org-1",
        deleteClient,
      }),
    ).rejects.toThrow("intégrité");

    expect(deleteClient).not.toHaveBeenCalled();
  });
});

describe("deletePatientWithDependencyIsolation", () => {
  test.each([
    ["appointment", { appointments: [{ organizationId: "org-2" }] }],
    [
      "appointment without organization",
      { appointments: [{ organizationId: null }] },
    ],
    [
      "report attached through an appointment even for another patient",
      {
        appointments: [
          {
            organizationId: "org-1",
            reports: [{ createdBy: "org-2", patientId: "patient-2" }],
          },
        ],
      },
    ],
    ["direct report", { advancedReport: [{ createdBy: "org-2" }] }],
    ["medical document", { medicalDocuments: [{ uploadedBy: null }] }],
  ])(
    "blocks deletion before touching the database for a foreign %s",
    async (_label, patch) => {
      const deletePatient = vi.fn(async () => ({ id: "patient-1" }));

      await expect(
        deletePatientWithDependencyIsolation({
          findPatient: async () => ({ ...scopedPatientDependencies, ...patch }),
          organizationId: "org-1",
          deletePatient,
        }),
      ).rejects.toThrow("intégrité");

      expect(deletePatient).not.toHaveBeenCalled();
    },
  );

  test("deletes only after all direct and transitive dependencies are scoped", async () => {
    const deletePatient = vi.fn(async () => ({ id: "patient-1" }));

    await expect(
      deletePatientWithDependencyIsolation({
        findPatient: async () => scopedPatientDependencies,
        organizationId: "org-1",
        deletePatient,
      }),
    ).resolves.toEqual({ id: "patient-1" });

    expect(deletePatient).toHaveBeenCalledOnce();
  });
});

describe("tenant-isolated creation", () => {
  test("createAppointment never inserts for a missing or cross-organization patient", async () => {
    const insertAppointment = vi.fn(async () => ({ id: "appointment-1" }));

    await expect(
      createAppointmentWithPatientIsolation({
        findPatient: async () => null,
        insertAppointment,
      }),
    ).rejects.toThrow("Patient non trouvé");

    expect(insertAppointment).not.toHaveBeenCalled();
  });

  test("createAppointment inserts after the scoped patient is found", async () => {
    const insertAppointment = vi.fn(async () => ({ id: "appointment-1" }));

    await expect(
      createAppointmentWithPatientIsolation({
        findPatient: async () => ({ id: "patient-1" }),
        insertAppointment,
      }),
    ).resolves.toEqual({ id: "appointment-1" });

    expect(insertAppointment).toHaveBeenCalledOnce();
  });

  test("createReport never inserts for a missing or cross-organization patient", async () => {
    const insertReport = vi.fn(async () => ({ id: "report-1" }));

    await expect(
      createReportWithTenantIsolation({
        findPatient: async () => null,
        insertReport,
      }),
    ).rejects.toThrow("Patient non trouvé");

    expect(insertReport).not.toHaveBeenCalled();
  });

  test("createReport never inserts when its appointment is absent, foreign, or belongs to another patient", async () => {
    const insertReport = vi.fn(async () => ({ id: "report-1" }));

    await expect(
      createReportWithTenantIsolation({
        findPatient: async () => ({ id: "patient-1" }),
        findAppointment: async () => null,
        insertReport,
      }),
    ).rejects.toThrow("Rendez-vous non trouvé");

    expect(insertReport).not.toHaveBeenCalled();
  });

  test("createReport inserts when patient and optional appointment are coherent and scoped", async () => {
    const insertReport = vi.fn(async () => ({ id: "report-1" }));

    await expect(
      createReportWithTenantIsolation({
        findPatient: async () => ({ id: "patient-1" }),
        findAppointment: async () => ({ id: "appointment-1" }),
        insertReport,
      }),
    ).resolves.toEqual({ id: "report-1" });

    expect(insertReport).toHaveBeenCalledOnce();
  });
});
