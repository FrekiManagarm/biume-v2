"use server";

import { db } from "@biume/db";
import { getCurrentOrganization } from "#/functions/auth.function";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import z from "zod";
import {
  anatomicalIssueSchema,
  createReportSchema,
  reportSchema,
} from "#/lib/utils/schemas";
import {
  type AnatomicalPart,
  anatomicalPart,
  advancedReportRecommendations,
  anatomicalIssue,
  type AdvancedReport,
  advancedReport,
} from "@biume/db/schema/index";
// import { anatomicalRegionsHorse } from "#/components/dashboard/pages/reports-editor/data/horse/typesHorse";
// import { anatomicalHorseRegionPaths } from "#/components/dashboard/pages/reports-editor/data/horse/dataHorse";
import { anatomicalRegions } from "#/components/dashboard/pages/reports-editor/data/dog/typesDog";
import { anatomicalRegionPaths } from "#/components/dashboard/pages/reports-editor/data/dog/dataDog";
import { createServerFn } from "@tanstack/react-start";

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
    const { title, petId, appointmentId, consultationReason, notes, status } =
      data;

    try {
      const organization = await getCurrentOrganization();
      if (!organization) throw new Error("Organization not found");

      const [newReport] = await db
        .insert(advancedReport)
        .values({
          title: title || "Nouveau rapport",
          consultationReason,
          patientId: petId || "",
          appointmentId: appointmentId || null,
          notes,
          status: status || "draft",
          createdBy: organization.id,
          createdAt: new Date(),
        })
        .returning({ id: advancedReport.id })
        .execute();

      return { success: true, status: status, reportId: newReport.id };
    } catch (error) {
      console.error("Error creating report", error);
      throw new Error("Error creating report");
    }
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
        },
      });

      if (!report) throw new Error("Report not found");

      return { success: true, data: report as AdvancedReport };
    } catch (error) {
      console.error("Error getting report by id", error);
      return { success: false, data: null };
    }
  });

export const updateReport = createServerFn({ method: "POST" })
  .validator(reportSchema.extend({ reportId: z.string() }))
  .handler(async ({ data }) => {
    const {
      reportId,
      title,
      petId,
      consultationReason,
      notes,
      status,
      observations = [],
      anatomicalIssues = [],
      recommendations = [],
    } = data;

    try {
      const organization = await getCurrentOrganization();
      if (!organization) throw new Error("Organization not found");

      const result = await db.transaction(async (tx) => {
        // Mettre à jour le rapport principal
        const [updatedReport] = await tx
          .update(advancedReport)
          .set({
            title,
            consultationReason,
            patientId: petId || "",
            notes,
            updatedAt: new Date(),
            status: status || "draft",
          })
          .where(
            and(
              eq(advancedReport.id, reportId),
              eq(advancedReport.createdBy, organization.id),
            ),
          )
          .returning()
          .execute();

        if (!updatedReport) throw new Error("Report not found or unauthorized");

        // Supprimer les anciennes données
        await tx
          .delete(anatomicalIssue)
          .where(eq(anatomicalIssue.advancedReportId, reportId))
          .execute();

        await tx
          .delete(advancedReportRecommendations)
          .where(eq(advancedReportRecommendations.advancedReportId, reportId))
          .execute();

        // Insérer les nouveaux problèmes anatomiques
        if (anatomicalIssues.length > 0) {
          const issuesData = anatomicalIssues.map((issue) => ({
            id: crypto.randomUUID(),
            type: issue.type as "dysfunction" | "anatomicalSuspicion",
            anatomicalPartId: issue.anatomicalPart?.id || issue.region,
            anatomicalPartTypeId: issue.anatomicalPart?.id || issue.region,
            severity: issue.severity,
            advancedReportId: updatedReport.id,
            notes: issue.notes,
            laterality: issue.laterality as "left" | "right" | "bilateral",
            observationType: "none" as const,
          }));

          await tx.insert(anatomicalIssue).values(issuesData).execute();
        }

        // Insérer les nouvelles observations
        if (observations.length > 0) {
          const observationsData = observations.map((observation) => ({
            id: crypto.randomUUID(),
            type: "observation" as const,
            advancedReportId: updatedReport.id,
            notes: observation.notes,
            anatomicalPartId:
              observation.anatomicalPart?.id || observation.region,
            anatomicalPartTypeId:
              observation.anatomicalPart?.id || observation.region,
            laterality: observation.laterality as
              "left" | "right" | "bilateral",
            severity: observation.severity,
            observationType: observation.type as "dynamic" | "static" | "none",
          }));

          await tx.insert(anatomicalIssue).values(observationsData).execute();
        }

        // Insérer les nouvelles recommandations
        if (recommendations.length > 0) {
          const recommendationsData = recommendations.map((recommendation) => ({
            id: crypto.randomUUID(),
            advancedReportId: updatedReport.id,
            recommendation: recommendation.content,
          }));

          await tx
            .insert(advancedReportRecommendations)
            .values(recommendationsData)
            .execute();
        }

        return updatedReport;
      });

      return { success: true, status: status };
    } catch (error) {
      console.error("Error updating report", error);
      return { success: false, data: null };
    }
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
        anatomicalRegions.length,
      );
      const anatomicalPartsData = anatomicalRegions
        .map((region) => {
          const regionData = anatomicalRegionPaths[region.value];

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
            animalType: "DOG" as const,
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
      await db.transaction(async (tx) => {
        // Supprimer les problèmes anatomiques
        await tx
          .delete(anatomicalIssue)
          .where(eq(anatomicalIssue.advancedReportId, data.reportId))
          .execute();

        // Supprimer les recommandations
        await tx
          .delete(advancedReportRecommendations)
          .where(
            eq(advancedReportRecommendations.advancedReportId, data.reportId),
          )
          .execute();

        // Supprimer le rapport principal
        await tx
          .delete(advancedReport)
          .where(eq(advancedReport.id, data.reportId))
          .execute();
      });

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
