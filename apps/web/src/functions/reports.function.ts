"use server";

import { db } from "@biume/db";
import {
  createInitialReportSectionStates,
  quickReportSchema,
  type ReportSectionStates,
} from "@biume/contracts/report";
import { getCurrentOrganization } from "#/functions/auth.function";
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import z from "zod";
import {
  anatomicalIssueSchema,
  createReportSchema,
  updateReportSchema,
} from "#/lib/utils/schemas";
import {
  type AnatomicalPart,
  anatomicalPart,
  advancedReportRecommendations,
  anatomicalIssue,
  type AdvancedReport,
  advancedReport,
  appointments,
  clients,
  pets,
  reportOwnerContent,
  reportSectionState,
  reportSharedVersion,
} from "@biume/db/schema/index";
import {
  createReportWithTenantIsolation,
  updateReportWithTenantIsolation,
} from "#/functions/tenant-mutation-isolation";
import { anatomicalRegionsHorse } from "#/components/dashboard/pages/reports-module/data/horse/typesHorse";
import { anatomicalHorseRegionPaths } from "#/components/dashboard/pages/reports-module/data/horse/dataHorse";
import {
  buildQuickReportMutationQueries,
  buildReportChildRows,
  buildReportUpdateMutationQueries,
  executeAtomicReportMutations,
  getRemovedOwnerSources,
} from "#/components/dashboard/pages/reports-module/reports.persistence";
// import { anatomicalRegions } from "#/components/dashboard/pages/reports-module/data/dog/typesDog";
// import { anatomicalRegionPaths } from "#/components/dashboard/pages/reports-module/data/dog/dataDog";
import { createServerFn } from "@tanstack/react-start";
import {
  assertReportCanBeShared,
  buildOwnerReportSnapshot,
  buildQuickReportRows,
  buildReportSectionStateRows,
  normalizeReportSectionStates,
  persistImmutableSharedVersion,
  resolveOwnerFacingText,
} from "./report-domain";

export type ReportType = "simple" | "advanced";

export type ReportItem = {
  id: string;
  title: string;
  type: ReportType;
  consultationReason: string;
  patientName: string;
  patientId: string;
  createdAt: Date;
  updatedAt: Date | null;
};

export type NormalizedAdvancedReport = Omit<AdvancedReport, "sectionStates"> & {
  sectionStates: ReportSectionStates;
};

export const getLatestReports = createServerFn({ method: "GET" })
  .validator(z.object({ limit: z.number() }))
  .handler(async ({ data }) => {
    const { limit } = data;

    const organization = await getCurrentOrganization();
    if (!organization) {
      throw new Error("Organization not found");
    }

    // Récupérer les rapports simples
    const advancedReports = await db.query.advancedReport.findMany({
      where: eq(advancedReport.createdBy, organization.id),
      orderBy: [desc(advancedReport.createdAt)],
      limit,
      with: {
        patient: {
          columns: {
            name: true,
            id: true,
          },
        },
      },
    });

    // Combiner et formater les rapports
    const allReports: ReportItem[] = [
      ...advancedReports.map((report) => ({
        id: report.id,
        title: report.title,
        type: "advanced" as ReportType,
        consultationReason: report.consultationReason,
        patientName: report.patient?.name || "Patient inconnu",
        patientId: report.patientId || "",
        createdAt: report.createdAt || new Date(),
        updatedAt: report.updatedAt,
      })),
    ];

    // Trier par date de création décroissante
    allReports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Retourner seulement le nombre demandé
    return allReports.slice(0, limit) as ReportItem[];
  });

export const getAllReportsParams = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
});

export type GetAllReportsParams = z.infer<typeof getAllReportsParams>;

export const getAllReports = createServerFn({ method: "GET" })
  .validator(getAllReportsParams)
  .handler(async ({ data }) => {
    try {
      const organization = await getCurrentOrganization();

      if (!organization) {
        throw new Error("Organization not found");
      }

      const { search = "", status = "tous" } = data;

      const conditions = [eq(advancedReport.createdBy, organization.id)];

      if (status === "brouillons") {
        conditions.push(eq(advancedReport.status, "draft"));
      } else if (status === "finalises") {
        conditions.push(eq(advancedReport.status, "finalized"));
      }

      if (search.trim().length > 0) {
        const term = `%${search.trim().toLowerCase()}%`;
        const searchCondition = or(
          ilike(advancedReport.title, term),
          ilike(advancedReport.consultationReason, term),
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }

      const reports = await db.query.advancedReport.findMany({
        where: and(...conditions),
        with: {
          organization: true,
          patient: {
            with: {
              owner: {
                columns: {
                  name: true,
                  email: true,
                },
              },
              animal: {
                columns: {
                  name: true,
                },
              },
            },
          },
          anatomicalIssues: {
            with: {
              anatomicalPart: true,
            },
          },
          recommendations: true,
        },
        orderBy: [desc(advancedReport.createdAt)],
      });

      return reports as AdvancedReport[];
    } catch (error) {
      console.error("Error getting all reports", error);
      throw new Error("Error getting all reports");
    }
  });

export const createReport = createServerFn({ method: "POST" })
  .validator(createReportSchema)
  .handler(async ({ data }) => {
    const { title, petId, appointmentId, consultationReason, notes } = data;
    const patientId = petId ?? "";

    try {
      const organization = await getCurrentOrganization();
      if (!organization) throw new Error("Organization not found");

      return createReportWithTenantIsolation({
        findPatient: () =>
          db.query.pets.findFirst({
            where: and(
              eq(pets.id, patientId),
              eq(pets.organizationId, organization.id),
            ),
            columns: { id: true },
          }),
        findAppointment: appointmentId
          ? () =>
              db.query.appointments.findFirst({
                where: and(
                  eq(appointments.id, appointmentId),
                  eq(appointments.organizationId, organization.id),
                  eq(appointments.patientId, patientId),
                ),
                columns: { id: true },
              })
          : undefined,
        insertReport: async () => {
          const reportId = crypto.randomUUID();
          await db.batch([
            db.insert(advancedReport).values({
              id: reportId,
              title: title || "Nouveau rapport",
              consultationReason,
              patientId,
              appointmentId: appointmentId || null,
              notes,
              status: "draft",
              createdBy: organization.id,
              createdAt: new Date(),
            }),
            db
              .insert(reportSectionState)
              .values(
                buildReportSectionStateRows(
                  reportId,
                  createInitialReportSectionStates(),
                ),
              ),
          ] as const);

          return { success: true as const, status: "draft" as const, reportId };
        },
      });
    } catch (error) {
      console.error("Error creating report", error);
      throw new Error("Error creating report");
    }
  });

export const createQuickReport = createServerFn({ method: "POST" })
  .validator(quickReportSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const rows = buildQuickReportRows({
      organizationId: organization.id,
      input: data,
      ids: {
        ownerId: crypto.randomUUID(),
        animalId: crypto.randomUUID(),
        reportId: crypto.randomUUID(),
      },
      now: new Date(),
    });

    const mutations = buildQuickReportMutationQueries({
      ownerInsert: db.insert(clients).values(rows.owner),
      animalInsert: db.insert(pets).values(rows.animal),
      reportInsert: db.insert(advancedReport).values(rows.report),
      sectionStateInsert: db
        .insert(reportSectionState)
        .values(rows.sectionStates),
    });
    await executeAtomicReportMutations(mutations, (queries) =>
      db.batch(queries),
    );

    return {
      success: true as const,
      status: "draft" as const,
      reportId: rows.report.id,
    };
  });

export const getReportById = createServerFn({ method: "GET" })
  .validator(
    z.object({
      reportId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const organization = await getCurrentOrganization();
      if (!organization) throw new Error("Organization not found");

      const report = await db.query.advancedReport.findFirst({
        where: and(
          eq(advancedReport.id, data.reportId),
          eq(advancedReport.createdBy, organization.id),
        ),
        with: {
          organization: true,
          appointment: {
            with: {
              patient: true,
              organization: true,
            },
          },
          patient: {
            with: {
              owner: true,
              animal: true,
              advancedReport: true,
              organization: true,
            },
          },
          anatomicalIssues: {
            with: {
              anatomicalPart: true,
            },
          },
          recommendations: true,
          ownerContents: true,
          sectionStates: true,
        },
      });

      if (!report) throw new Error("Report not found");

      return {
        success: true,
        data: {
          ...report,
          sectionStates: normalizeReportSectionStates(report.sectionStates),
        } as NormalizedAdvancedReport,
      };
    } catch (error) {
      console.error("Error getting report by id", error);
      return { success: false, data: null };
    }
  });

export const updateReport = createServerFn({ method: "POST" })
  .validator(updateReportSchema)
  .handler(async ({ data }) => {
    const {
      reportId,
      title,
      petId,
      appointmentId,
      consultationReason,
      notes,
      status,
      sectionStates,
      observations = [],
      anatomicalIssues = [],
      recommendations = [],
    } = data;
    const patientId = petId ?? "";

    try {
      const organization = await getCurrentOrganization();
      if (!organization) throw new Error("Organization not found");

      return updateReportWithTenantIsolation({
        findReport: async () => {
          const [ownedReport] = await db
            .select({
              id: advancedReport.id,
              appointmentId: advancedReport.appointmentId,
            })
            .from(advancedReport)
            .where(
              and(
                eq(advancedReport.id, reportId),
                eq(advancedReport.createdBy, organization.id),
              ),
            )
            .limit(1)
            .execute();

          return ownedReport;
        },
        findPatient: () =>
          db.query.pets.findFirst({
            where: and(
              eq(pets.id, patientId),
              eq(pets.organizationId, organization.id),
            ),
            columns: { id: true },
          }),
        validateAppointment: async (ownedReport) => {
          const resolvedAppointmentId =
            appointmentId ?? ownedReport.appointmentId;
          if (!resolvedAppointmentId) return true;

          const appointment = await db.query.appointments.findFirst({
            where: and(
              eq(appointments.id, resolvedAppointmentId),
              eq(appointments.organizationId, organization.id),
              eq(appointments.patientId, patientId),
            ),
            columns: { id: true },
          });

          return Boolean(appointment);
        },
        updateReport: async (ownedReport) => {
          const resolvedAppointmentId =
            appointmentId ?? ownedReport.appointmentId ?? null;

          const regionCandidates = [
            ...anatomicalIssues.map((issue) => issue.region),
            ...observations.map((observation) => observation.region),
          ].filter((region): region is string => Boolean(region));

          const fallbackAnatomicalParts =
            regionCandidates.length > 0
              ? await db
                  .select({
                    id: anatomicalPart.id,
                    name: anatomicalPart.name,
                  })
                  .from(anatomicalPart)
                  .where(
                    or(
                      inArray(anatomicalPart.id, regionCandidates),
                      inArray(anatomicalPart.name, regionCandidates),
                    ),
                  )
                  .execute()
              : [];

          const resolveAnatomicalPartId = (issue: {
            anatomicalPart?: { id: string };
            region: string;
          }) => {
            if (issue.anatomicalPart?.id) {
              return issue.anatomicalPart.id;
            }

            const fallbackPart = fallbackAnatomicalParts.find(
              (part) => part.id === issue.region || part.name === issue.region,
            );

            if (!fallbackPart) {
              throw new Error(
                `Région anatomique introuvable pour "${issue.region}"`,
              );
            }

            return fallbackPart.id;
          };

          const childRows = buildReportChildRows({
            reportId: ownedReport.id,
            observations,
            anatomicalIssues,
            recommendations,
            resolveAnatomicalPartId,
          });

          const existingOwnerSources = await db
            .select({
              sourceKind: reportOwnerContent.sourceKind,
              sourceId: reportOwnerContent.sourceId,
            })
            .from(reportOwnerContent)
            .where(eq(reportOwnerContent.reportId, ownedReport.id))
            .execute();

          const removedSources = getRemovedOwnerSources(existingOwnerSources, {
            observation: observations.map((item) => item.id),
            anatomicalIssue: anatomicalIssues.map((item) => item.id),
            recommendation: recommendations.map((item) => item.id),
          });

          const mutationQueries = buildReportUpdateMutationQueries({
            reportUpdate: db
              .update(advancedReport)
              .set({
                title,
                consultationReason,
                patientId,
                appointmentId: resolvedAppointmentId,
                notes,
                updatedAt: new Date(),
                status: status || "draft",
                revision: sql`${advancedReport.revision} + 1`,
              })
              .where(
                and(
                  eq(advancedReport.id, ownedReport.id),
                  eq(advancedReport.createdBy, organization.id),
                ),
              ),
            sectionStateUpsert: db
              .insert(reportSectionState)
              .values(
                buildReportSectionStateRows(ownedReport.id, sectionStates),
              )
              .onConflictDoUpdate({
                target: [
                  reportSectionState.reportId,
                  reportSectionState.section,
                ],
                set: {
                  state: sql`excluded.state`,
                  updatedAt: new Date(),
                },
              }),
            ownerSourceDeletions: removedSources.map((source) =>
              db
                .delete(reportOwnerContent)
                .where(
                  and(
                    eq(reportOwnerContent.reportId, ownedReport.id),
                    eq(reportOwnerContent.sourceKind, source.sourceKind),
                    eq(reportOwnerContent.sourceId, source.sourceId),
                  ),
                ),
            ),
            childDeletions: [
              db
                .delete(anatomicalIssue)
                .where(eq(anatomicalIssue.advancedReportId, ownedReport.id)),
              db
                .delete(advancedReportRecommendations)
                .where(
                  eq(
                    advancedReportRecommendations.advancedReportId,
                    ownedReport.id,
                  ),
                ),
            ] as const,
            childInserts: [
              ...(childRows.anatomicalIssues.length > 0
                ? [
                    db
                      .insert(anatomicalIssue)
                      .values(childRows.anatomicalIssues),
                  ]
                : []),
              ...(childRows.observations.length > 0
                ? [db.insert(anatomicalIssue).values(childRows.observations)]
                : []),
              ...(childRows.recommendations.length > 0
                ? [
                    db
                      .insert(advancedReportRecommendations)
                      .values(childRows.recommendations),
                  ]
                : []),
            ] as const,
          });

          await executeAtomicReportMutations(mutationQueries, (queries) =>
            db.batch(queries),
          );

          return { success: true as const, status: status };
        },
      });
    } catch (error) {
      console.error("Error updating report", error);
      return {
        success: false,
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la mise à jour du rapport",
      };
    }
  });

export const createReportSharedVersion = createServerFn({ method: "POST" })
  .validator(z.object({ reportId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const report = await db.query.advancedReport.findFirst({
      where: and(
        eq(advancedReport.id, data.reportId),
        eq(advancedReport.createdBy, organization.id),
      ),
      with: {
        patient: { with: { owner: true } },
        anatomicalIssues: { with: { anatomicalPart: true } },
        recommendations: true,
        ownerContents: true,
        sectionStates: true,
      },
    });
    if (!report?.patient?.owner) {
      throw new Error("Rapport, animal ou propriétaire introuvable");
    }

    const sectionStates = normalizeReportSectionStates(report.sectionStates);
    assertReportCanBeShared(report.status, sectionStates);

    const observations = report.anatomicalIssues.filter(
      (item) => item.type === "observation",
    );
    const issues = report.anatomicalIssues.filter((item) =>
      ["dysfunction", "anatomicalSuspicion"].includes(item.type),
    );
    const itemText = (item: {
      id: string;
      notes: string | null;
      anatomicalPart?: { name: string } | null;
    }) => item.notes?.trim() || item.anatomicalPart?.name.trim() || "";

    const snapshot = buildOwnerReportSnapshot({
      reportId: report.id,
      reportRevision: report.revision,
      title: report.title,
      animal: { id: report.patient.id, name: report.patient.name },
      owner: { id: report.patient.owner.id, name: report.patient.owner.name },
      consultationReason: resolveOwnerFacingText(
        report.ownerContents,
        "consultationReason",
        "consultationReason",
        report.consultationReason,
      ),
      clinical: observations
        .map((item) =>
          resolveOwnerFacingText(
            report.ownerContents,
            "observation",
            item.id,
            itemText(item),
          ),
        )
        .filter(Boolean),
      anatomical: issues
        .map((item) =>
          resolveOwnerFacingText(
            report.ownerContents,
            "anatomicalIssue",
            item.id,
            itemText(item),
          ),
        )
        .filter(Boolean),
      recommendations: report.recommendations
        .map((item) =>
          resolveOwnerFacingText(
            report.ownerContents,
            "recommendation",
            item.id,
            item.recommendation,
          ),
        )
        .filter(Boolean),
      notes: resolveOwnerFacingText(
        report.ownerContents,
        "notes",
        "notes",
        report.notes ?? "",
      ),
      createdAt: new Date(),
    });

    const findExisting = () =>
      db.query.reportSharedVersion.findFirst({
        where: and(
          eq(reportSharedVersion.reportId, report.id),
          eq(reportSharedVersion.organizationId, organization.id),
          eq(reportSharedVersion.reportRevision, report.revision),
        ),
      });

    const persisted = await persistImmutableSharedVersion({
      findExisting,
      insert: async () => {
        const [created] = await db
          .insert(reportSharedVersion)
          .values({
            reportId: report.id,
            organizationId: organization.id,
            reportRevision: report.revision,
            snapshot,
          })
          .onConflictDoNothing({
            target: [
              reportSharedVersion.reportId,
              reportSharedVersion.reportRevision,
            ],
          })
          .returning();
        return created;
      },
    });

    return { success: true as const, data: persisted };
  });

export const getAnatomicalParts = createServerFn({ method: "GET" })
  .validator(anatomicalIssueSchema)
  .handler(async ({ data }) => {
    const { animalType, zone } = data;

    const parts = await db.query.anatomicalPart.findMany({
      where: and(
        eq(anatomicalPart.animalType, animalType),
        eq(anatomicalPart.zone, zone),
      ),
    });

    return parts as AnatomicalPart[];
  });

export const seedAnatomicalParts = createServerFn({ method: "POST" }).handler(
  async () => {
    try {
      // Créer les données anatomiques pour chaque région
      console.log(
        "🔍 Création des données anatomiques pour chaque région",
        anatomicalRegionsHorse.length,
      );
      const anatomicalPartsData = anatomicalRegionsHorse
        .map((region) => {
          const regionData = anatomicalHorseRegionPaths[region.value];

          if (!regionData) {
            console.warn(`Données manquantes pour la région: ${region.value}`);
            return null;
          }

          return {
            zone: "articulation" as const,
            name: region.label,
            viewboxLeft: regionData.left.viewBox,
            pathLeft: regionData.left.path,
            transformLeft: regionData.left.transform || "",
            viewboxRight: regionData.right.viewBox,
            pathRight: regionData.right.path,
            transformRight: regionData.right.transform || "",
            animalType: "HORSE" as const,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      // Insérer les données dans la base de données
      const insertedParts = await db
        .insert(anatomicalPart)
        .values(anatomicalPartsData)
        .returning();

      console.log(
        `✅ ${insertedParts.length} parties anatomiques insérées avec succès`,
      );

      return {
        success: true,
        count: insertedParts.length,
        message: `${insertedParts.length} parties anatomiques insérées avec succès`,
      };
    } catch (error) {
      console.error("Erreur lors du seed:", error);
      throw new Error("Erreur lors du seed des données");
    }
  },
);

export const deleteReport = createServerFn({ method: "POST" })
  .validator(z.object({ reportId: z.string() }))
  .handler(async ({ data }) => {
    try {
      const organization = await getCurrentOrganization();
      if (!organization) throw new Error("Organization not found");

      // Vérifier que le rapport existe et appartient à l'organisation
      const report = await db.query.advancedReport.findFirst({
        where: and(
          eq(advancedReport.id, data.reportId),
          eq(advancedReport.createdBy, organization.id),
        ),
      });

      if (!report) throw new Error("Report not found or unauthorized");

      // Supprimer les données liées
      await db
        .delete(anatomicalIssue)
        .where(eq(anatomicalIssue.advancedReportId, data.reportId))
        .execute();

      await db
        .delete(advancedReportRecommendations)
        .where(
          eq(advancedReportRecommendations.advancedReportId, data.reportId),
        )
        .execute();

      await db
        .delete(advancedReport)
        .where(eq(advancedReport.id, data.reportId))
        .execute();

      return { success: true };
    } catch (error) {
      console.error("Error deleting report", error);
      return {
        success: false,
        error: "Erreur lors de la suppression du rapport",
      };
    }
  });

export type AnatomicalHistoryItem = {
  id: string;
  reportId: string;
  reportTitle: string;
  reportDate: Date;
  type: "dysfunction" | "anatomicalSuspicion" | "observation";
  severity: number;
  laterality: "left" | "right" | "bilateral";
  notes: string | null;
  anatomicalPartName: string;
  anatomicalPartZone: string;
};

export const getPatientAnatomicalHistory = createServerFn({ method: "GET" })
  .validator(
    z.object({
      petId: z.string(),
      anatomicalPartId: z.string(),
      type: z
        .enum(["dysfunction", "anatomicalSuspicion", "observation"])
        .optional(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const organization = await getCurrentOrganization();
      if (!organization) throw new Error("Organization not found");

      // Construire les conditions de filtrage
      const conditions = [
        eq(advancedReport.patientId, data.petId),
        eq(advancedReport.status, "finalized"),
        eq(advancedReport.createdBy, organization.id),
        eq(anatomicalIssue.anatomicalPartId, data.anatomicalPartId),
      ];

      // Filtrer par type si fourni
      if (data.type) {
        conditions.push(eq(anatomicalIssue.type, data.type));
      }

      // Récupérer les issues avec les informations du rapport et de la partie anatomique
      const issues = await db
        .select({
          issueId: anatomicalIssue.id,
          issueType: anatomicalIssue.type,
          severity: anatomicalIssue.severity,
          laterality: anatomicalIssue.laterality,
          notes: anatomicalIssue.notes,
          createdAt: anatomicalIssue.createdAt,
          reportId: advancedReport.id,
          reportTitle: advancedReport.title,
          reportDate: advancedReport.createdAt,
          anatomicalPartName: anatomicalPart.name,
          anatomicalPartZone: anatomicalPart.zone,
        })
        .from(anatomicalIssue)
        .innerJoin(
          advancedReport,
          eq(anatomicalIssue.advancedReportId, advancedReport.id),
        )
        .innerJoin(
          anatomicalPart,
          eq(anatomicalIssue.anatomicalPartId, anatomicalPart.id),
        )
        .where(and(...conditions))
        .orderBy(desc(advancedReport.createdAt));

      // Formater les résultats
      const history: AnatomicalHistoryItem[] = issues.map((issue) => ({
        id: issue.issueId,
        reportId: issue.reportId,
        reportTitle: issue.reportTitle,
        reportDate: issue.reportDate || new Date(),
        type: issue.issueType as
          "dysfunction" | "anatomicalSuspicion" | "observation",
        severity: issue.severity,
        laterality: issue.laterality as "left" | "right" | "bilateral",
        notes: issue.notes,
        anatomicalPartName: issue.anatomicalPartName,
        anatomicalPartZone: issue.anatomicalPartZone,
      }));

      return { success: true, data: history };
    } catch (error) {
      console.error("Error getting patient anatomical history", error);
      return { success: false, data: [] };
    }
  });
