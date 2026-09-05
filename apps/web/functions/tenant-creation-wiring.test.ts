import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

describe("tenant-isolated creation wiring", () => {
  test("quick report action accepts schema input before defaults are applied", () => {
    // Cette signature vit désormais dans `reports.mutations.ts` : la
    // conversion fait de `reports.action.ts` un simple ré-export depuis ce
    // fichier (motif validé aux tâches 2 et 3), qui ne retape plus aucune
    // signature en clair.
    const source = readFileSync(
      new URL("../lib/api/actions/reports.mutations.ts", import.meta.url),
      "utf8",
    );

    expect(source).toContain(
      "createQuickReport(report: z.input<typeof quickReportSchema>)",
    );
  });

  test("createAppointment scopes its patient lookup before delegating the insert", () => {
    const source = readFileSync(
      new URL("./appointments.function.ts", import.meta.url),
      "utf8",
    );
    const createSource = source.slice(
      source.indexOf("export async function createAppointment"),
      source.indexOf("export async function updateAppointment"),
    );

    expect(createSource).toContain("createAppointmentWithPatientIsolation");
    expect(createSource).toContain("eq(pets.id, data.patientId)");
    expect(createSource).toContain("eq(pets.organizationId, organizationId)");
  });

  test("createReport scopes its patient and coherent appointment before delegating the insert", () => {
    const source = readFileSync(
      new URL("./reports.function.ts", import.meta.url),
      "utf8",
    );
    const createSource = source.slice(
      source.indexOf("export async function createReport"),
      source.indexOf("export async function getReportById"),
    );

    expect(createSource).toContain("createReportWithTenantIsolation");
    expect(createSource).toContain("eq(pets.id, patientId)");
    expect(createSource).toContain("eq(pets.organizationId, organizationId)");
    expect(createSource).toContain("eq(appointments.id, appointmentId)");
    expect(createSource).toContain(
      "eq(appointments.organizationId, organizationId)",
    );
    expect(createSource).toContain("eq(appointments.patientId, patientId)");
  });

  test("createQuickReport delegates tenant-scoped idempotency around the atomic executor", () => {
    const source = readFileSync(
      new URL("./reports.function.ts", import.meta.url),
      "utf8",
    );
    const createSource = source.slice(
      source.indexOf("export async function createQuickReport"),
      source.indexOf("export async function getReportById"),
    );

    // La conversion hors de `createServerFn` déplace la garde de schéma de
    // `.validator(quickReportSchema)` vers `quickReportSchema.parse(input)`,
    // en première ligne du corps : la propriété testée (c'est bien CE
    // schéma, pas un schéma générique, qui garde `createQuickReport`) survit
    // sous la nouvelle syntaxe.
    expect(createSource).toContain("quickReportSchema.parse(");
    // `organizationId` est désormais une variable locale, insérée en
    // raccourci : la présence de l'identifiant dans ce corps de fonction
    // reste la preuve que l'insert est bien cloisonné.
    expect(createSource).toContain("organizationId,");
    expect(createSource).toContain("createIdempotentQuickReport");
    expect(createSource).toContain("clientRequestId");
    expect(createSource).toContain("quickRequestFingerprint");
    expect(createSource.match(/crypto\.randomUUID\(\)/g)).toHaveLength(3);
    expect(createSource).toContain("buildQuickReportMutationQueries");
    expect(createSource).toContain("executeAtomicReportMutations");
    expect(createSource).toContain("findAfterConflict");
  });
});

describe("tenant-isolated update wiring", () => {
  test("updateAppointment scopes the appointment and changed patient before update", () => {
    const source = readFileSync(
      new URL("./appointments.function.ts", import.meta.url),
      "utf8",
    );
    const updateSource = source.slice(
      source.indexOf("export async function updateAppointment"),
      source.indexOf("export async function deleteAppointment"),
    );

    expect(updateSource).toContain("updateAppointmentWithTenantIsolation");
    expect(updateSource).toContain("patientId !== undefined");
    expect(updateSource).toContain("eq(appointments.id, appointmentId)");
    expect(updateSource).toContain(
      "eq(appointments.organizationId, organizationId)",
    );
    expect(updateSource).toContain("eq(pets.id, patientId)");
    expect(updateSource).toContain("eq(pets.organizationId, organizationId)");
  });

  test("updateReport scopes report, patient, and coherent current or requested appointment", () => {
    const source = readFileSync(
      new URL("./reports.function.ts", import.meta.url),
      "utf8",
    );
    const updateSource = source.slice(
      source.indexOf("export async function updateReport"),
      source.indexOf("export async function getAnatomicalParts"),
    );

    expect(updateSource).toContain("updateReportWithTenantIsolation");
    expect(updateSource).toContain(
      "eq(advancedReport.createdBy, organizationId)",
    );
    expect(updateSource).toContain("eq(pets.id, patientId)");
    expect(updateSource).toContain("eq(pets.organizationId, organizationId)");
    expect(updateSource).toContain(
      "eq(appointments.id, resolvedAppointmentId)",
    );
    expect(updateSource).toContain(
      "eq(appointments.organizationId, organizationId)",
    );
    expect(updateSource).toContain("eq(appointments.patientId, patientId)");
  });
});

test("shared versions are scoped, revision-bound, and never updated", () => {
  const source = readFileSync(
    new URL("./reports.function.ts", import.meta.url),
    "utf8",
  );
  // L'adaptateur Drizzle vit désormais sous `server/report/` : le parcours
  // mobile de finalisation l'utilise autant que la fonction serveur du web.
  const adapterSource = readFileSync(
    new URL(
      "../server/report/report-shared-version.ports.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const handlerSource = source.slice(
    source.indexOf("export async function createReportSharedVersion"),
    source.indexOf("export async function getAnatomicalParts"),
  );

  expect(adapterSource).toContain(
    "eq(advancedReport.createdBy, organizationId)",
  );
  expect(adapterSource).toContain("reportSharedVersion.reportRevision");
  expect(adapterSource).toContain("onConflictDoNothing");
  expect(adapterSource).not.toContain(".update(reportSharedVersion)");
  expect(handlerSource).toContain("createImmutableReportSharedVersion");
  expect(handlerSource).toContain("organizationId,");
  expect(handlerSource).toContain("reportId: data.reportId");
});
