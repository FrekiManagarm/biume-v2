import { db } from "@biume/db";
import { and, eq, or, lte, gte, ne, inArray } from "drizzle-orm";
import { getCurrentOrganization } from "#/functions/auth.function";
import {
  createAppointmentWithPatientIsolation,
  updateAppointmentWithTenantIsolation,
} from "#/functions/tenant-mutation-isolation";
import {
  type Appointment,
  advancedReport,
  appointments,
  pets,
  reportSectionState,
} from "@biume/db/schema/index";
import {
  createInitialReportSectionStates,
  isReportEmpty,
} from "@biume/contracts/report";
import { createServerFn } from "@tanstack/react-start";
import { endOfDay, startOfDay } from "date-fns";
import z from "zod";

import { buildReportSectionStateRows } from "./report-domain";
import {
  createSessionReport,
  resolveReportsOnAppointmentDeletion,
} from "./appointment-report.service";

const appointmentWindowSchema = z.object({
  fromISO: z.string(),
  toISO: z.string(),
});

const appointmentDateRangeSchema = z.object({
  beginAt: z.coerce.date(),
  endAt: z.coerce.date(),
  excludeAppointmentId: z.string().optional(),
});

const createAppointmentSchema = z.object({
  patientId: z.string(),
  beginAt: z.coerce.date(),
  endAt: z.coerce.date(),
  atHome: z.boolean().optional(),
  note: z.string().optional(),
  notifyOwner: z.boolean().optional(),
  withReport: z.boolean().optional().default(true),
});

const updateAppointmentSchema = z.object({
  appointmentId: z.string(),
  patientId: z.string().optional(),
  beginAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  atHome: z.boolean().optional(),
  note: z.string().optional(),
  status: z.enum(["CREATED", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
});

const appointmentIdSchema = z.object({
  appointmentId: z.string(),
});

const daysBackSchema = z.object({
  daysBack: z.number().optional().default(30),
});

const patientIdSchema = z.object({
  patientId: z.string(),
});

export const getAppointments = createServerFn({ method: "GET" })
  .validator(appointmentWindowSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const results = await db.query.appointments.findMany({
      where: and(
        eq(appointments.organizationId, organization.id),
        gte(appointments.beginAt, new Date(data.fromISO)),
        lte(appointments.beginAt, new Date(data.toISO)),
      ),
      with: {
        patient: {
          with: {
            owner: {
              columns: {
                id: true,
                name: true,
                email: true,
                image: true,
                phone: true,
              },
            },
            animal: { columns: { code: true, name: true } },
          },
        },
        organization: true,
        // Assez pour appliquer `isReportEmpty` sans ramener le contenu :
        // seuls les identifiants des lignes filles sont comptés.
        reports: {
          columns: {
            id: true,
            status: true,
            updatedAt: true,
            consultationReason: true,
            notes: true,
          },
          with: {
            anatomicalIssues: { columns: { id: true } },
            recommendations: { columns: { id: true } },
          },
        },
      },
    });

    return results.map((appointment) => ({
      ...appointment,
      reports: appointment.reports.map((report) => ({
        id: report.id,
        status: report.status,
        updatedAt: report.updatedAt,
        consultationReason: report.consultationReason,
        notes: report.notes,
        anatomicalIssueCount: report.anatomicalIssues.length,
        recommendationCount: report.recommendations.length,
      })),
    }));
  });

/**
 * Vérifie si un créneau horaire chevauche des rendez-vous existants
 * @param beginAt Date de début du rendez-vous
 * @param endAt Date de fin du rendez-vous
 * @param excludeAppointmentId ID du rendez-vous à exclure de la vérification (utile pour les modifications)
 * @returns Liste des rendez-vous en conflit
 */
export const checkAppointmentConflicts = createServerFn({ method: "GET" })
  .validator(appointmentDateRangeSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    // Un rendez-vous est en conflit si :
    // - Il commence avant la fin du nouveau rendez-vous ET
    // - Il se termine après le début du nouveau rendez-vous
    const conflicts = await db.query.appointments.findMany({
      where: and(
        eq(appointments.organizationId, organization.id),
        // Exclure le rendez-vous en cours de modification
        data.excludeAppointmentId
          ? ne(appointments.id, data.excludeAppointmentId)
          : undefined,
        // Vérifier le chevauchement
        or(
          // Le rendez-vous existant commence pendant le nouveau créneau
          and(
            gte(appointments.beginAt, data.beginAt),
            lte(appointments.beginAt, data.endAt),
          ),
          // Le rendez-vous existant se termine pendant le nouveau créneau
          and(
            gte(appointments.endAt, data.beginAt),
            lte(appointments.endAt, data.endAt),
          ),
          // Le rendez-vous existant englobe complètement le nouveau créneau
          and(
            lte(appointments.beginAt, data.beginAt),
            gte(appointments.endAt, data.endAt),
          ),
        ),
      ),
      with: {
        patient: true,
      },
    });

    return conflicts as Appointment[];
  });

/**
 * Construit les requêtes d'insertion du compte rendu et de ses états de
 * section, sans les exécuter : elles sont conçues pour rejoindre le batch de
 * création du rendez-vous appelant.
 */
function buildReportInsertQueries(
  organizationId: string,
  reportId: string,
  values: {
    appointmentId: string;
    patientId: string;
    title: string;
    consultationReason: string;
  },
) {
  return [
    db.insert(advancedReport).values({
      id: reportId,
      title: values.title,
      consultationReason: values.consultationReason,
      patientId: values.patientId,
      appointmentId: values.appointmentId,
      notes: "",
      status: "draft",
      createdBy: organizationId,
      createdAt: new Date(),
    }),
    db.insert(reportSectionState).values(
      buildReportSectionStateRows(reportId, createInitialReportSectionStates()),
    ),
  ] as const;
}

/**
 * Crée un nouveau rendez-vous
 */
export const createAppointment = createServerFn({ method: "POST" })
  .validator(createAppointmentSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    return createAppointmentWithPatientIsolation({
      findPatient: () =>
        db.query.pets.findFirst({
          where: and(
            eq(pets.id, data.patientId),
            eq(pets.organizationId, organization.id),
          ),
          columns: { id: true },
        }),
      insertAppointment: async () => {
        // Le rendez-vous est un `$defaultFn` normalement, mais son id doit
        // être connu avant l'exécution du batch pour que `advancedReport`
        // puisse le référencer dans le même batch : on le génère nous-mêmes,
        // exactement comme pour `reportId` plus bas.
        const appointmentId = crypto.randomUUID();

        const animal = await db.query.pets.findFirst({
          where: eq(pets.id, data.patientId),
          columns: { name: true },
        });

        // `insertReport` ne touche pas la base : il ne fait que réserver un id
        // et retenir les valeurs à insérer. Les requêtes du compte rendu sont
        // construites juste en dessous, à partir de ces valeurs, pour
        // rejoindre celle du rendez-vous dans un unique batch. Deux batches
        // séparés exposeraient un état intermédiaire où le rendez-vous existe
        // déjà sans son compte rendu si la seconde écriture échouait — le
        // praticien réessaierait et dupliquerait le rendez-vous.
        let pendingReportId: string | null = null;
        let pendingReportValues: {
          appointmentId: string;
          patientId: string;
          title: string;
          consultationReason: string;
        } | null = null;

        await createSessionReport(
          {
            insertReport: (values) => {
              const reportId = crypto.randomUUID();
              pendingReportId = reportId;
              pendingReportValues = values;

              return Promise.resolve(reportId);
            },
          },
          {
            appointmentId,
            patientId: data.patientId,
            animalName: animal?.name ?? null,
            beginAt: data.beginAt,
            note: data.note ?? null,
            withReport: data.withReport,
          },
        );

        const appointmentInsert = db
          .insert(appointments)
          .values({
            id: appointmentId,
            patientId: data.patientId,
            beginAt: data.beginAt,
            endAt: data.endAt,
            organizationId: organization.id,
            atHome: data.atHome || false,
            note: data.note,
            status: "CREATED",
            createdAt: new Date(),
          })
          .returning();

        if (pendingReportId && pendingReportValues) {
          const [reportInsert, sectionStateInsert] = buildReportInsertQueries(
            organization.id,
            pendingReportId,
            pendingReportValues,
          );
          const [insertedAppointments] = await db.batch([
            appointmentInsert,
            reportInsert,
            sectionStateInsert,
          ]);
          return insertedAppointments[0];
        }

        const [insertedAppointments] = await db.batch([appointmentInsert]);
        return insertedAppointments[0];
      },
    });
  });

/**
 * Modifie un rendez-vous existant
 */
export const updateAppointment = createServerFn({ method: "POST" })
  .validator(updateAppointmentSchema)
  .handler(async ({ data }) => {
    const { appointmentId, ...values } = data;
    const patientId = values.patientId;
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    return updateAppointmentWithTenantIsolation({
      findAppointment: () =>
        db.query.appointments.findFirst({
          where: and(
            eq(appointments.id, appointmentId),
            eq(appointments.organizationId, organization.id),
          ),
          columns: { id: true },
        }),
      findPatient:
        patientId !== undefined
          ? () =>
              db.query.pets.findFirst({
                where: and(
                  eq(pets.id, patientId),
                  eq(pets.organizationId, organization.id),
                ),
                columns: { id: true },
              })
          : undefined,
      updateAppointment: async () => {
        const [updatedAppointment] = await db
          .update(appointments)
          .set({
            ...values,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(appointments.id, appointmentId),
              eq(appointments.organizationId, organization.id),
            ),
          )
          .returning();

        if (!updatedAppointment) {
          throw new Error("Rendez-vous non trouvé ou non autorisé");
        }

        return updatedAppointment;
      },
    });
  });

export const deleteAppointment = createServerFn({ method: "POST" })
  .validator(appointmentIdSchema)
  .handler(async ({ data }) => {
    try {
      const organization = await getCurrentOrganization();
      if (!organization) throw new Error("Organization not found");

      // Restreint aux brouillons : `canFinalizeReport` accepte des sections
      // marquées « sans objet », donc un compte rendu peut être `finalized`
      // ou `sent` — et déjà envoyé au propriétaire — tout en étant vide au
      // sens du contenu. Seule la coquille `draft` auto-créée avec le
      // rendez-vous est concernée par la suppression.
      const linkedReports = await db.query.advancedReport.findMany({
        where: and(
          eq(advancedReport.appointmentId, data.appointmentId),
          eq(advancedReport.createdBy, organization.id),
          eq(advancedReport.status, "draft"),
        ),
        columns: {
          id: true,
          consultationReason: true,
          notes: true,
        },
        with: {
          anatomicalIssues: { columns: { id: true } },
          recommendations: { columns: { id: true } },
        },
      });

      const { deleteIds } = resolveReportsOnAppointmentDeletion(
        linkedReports.map((report) => ({
          id: report.id,
          consultationReason: report.consultationReason,
          notes: report.notes,
          anatomicalIssueCount: report.anatomicalIssues.length,
          recommendationCount: report.recommendations.length,
        })),
      );

      const appointmentDelete = db
        .delete(appointments)
        .where(
          and(
            eq(appointments.id, data.appointmentId),
            eq(appointments.organizationId, organization.id),
          ),
        )
        .returning();

      // Les comptes rendus non vides sont détachés par la contrainte
      // `ON DELETE set null` posée à la tâche 4. Les deux suppressions sont
      // groupées dans un même batch : si le `DELETE appointments` échouait
      // après un `DELETE advancedReport` isolé, le brouillon serait déjà
      // perdu alors que le rendez-vous survivrait. `createdBy` est reposé sur
      // le `DELETE` lui-même en défense en profondeur, au cas où `deleteIds`
      // viendrait un jour d'une source moins strictement scopée.
      if (deleteIds.length > 0) {
        const reportDelete = db
          .delete(advancedReport)
          .where(
            and(
              inArray(advancedReport.id, deleteIds),
              eq(advancedReport.createdBy, organization.id),
            ),
          );

        const [, appointmentResults] = await db.batch([
          reportDelete,
          appointmentDelete,
        ]);
        return appointmentResults[0];
      }

      const [appointmentResults] = await db.batch([appointmentDelete]);
      return appointmentResults[0];
    } catch (error) {
      console.error("Error deleting appointment", error);
      throw new Error("Error deleting appointment");
    }
  });

/**
 * Récupère les rendez-vous du jour actuel
 */
export const getTodayAppointments = createServerFn({ method: "GET" }).handler(
  async () => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const today = new Date();
    const dayStart = startOfDay(today);
    const dayEnd = endOfDay(today);

    const results = await db.query.appointments.findMany({
      where: and(
        eq(appointments.organizationId, organization.id),
        gte(appointments.beginAt, dayStart),
        lte(appointments.beginAt, dayEnd),
      ),
      orderBy: (appointments, { asc }) => [asc(appointments.beginAt)],
      with: {
        patient: {
          with: {
            owner: {
              columns: {
                id: true,
                name: true,
                email: true,
                image: true,
                phone: true,
              },
            },
            animal: {
              columns: {
                code: true,
                name: true,
              },
            },
          },
        },
        organization: true,
      },
    });

    return results as Appointment[];
  },
);

/**
 * Récupère les rendez-vous complétés qui n'ont pas de rapport associé
 * @param daysBack Nombre de jours en arrière à vérifier (par défaut 30)
 * @returns Liste des rendez-vous sans rapport
 */
export const getAppointmentsWithoutReport = createServerFn({ method: "GET" })
  .validator(daysBackSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - data.daysBack);

    // Récupérer tous les rendez-vous complétés depuis cutoffDate
    const completedAppointments = await db.query.appointments.findMany({
      where: and(
        eq(appointments.organizationId, organization.id),
        eq(appointments.status, "COMPLETED"),
        gte(appointments.beginAt, cutoffDate),
      ),
      with: {
        patient: {
          with: {
            owner: {
              columns: {
                id: true,
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
        organization: true,
        reports: {
          columns: {
            id: true,
            consultationReason: true,
            notes: true,
          },
          with: {
            anatomicalIssues: { columns: { id: true } },
            recommendations: { columns: { id: true } },
          },
        },
      },
    });

    // « Sans rapport » se lit désormais comme « sans contenu clinique » :
    // depuis la tâche 6, un rendez-vous a presque toujours un brouillon vide
    // créé automatiquement. Filtrer sur sa seule présence ferait disparaître
    // silencieusement tout rendez-vous récent de cette liste, qui perdrait
    // son sens. `isReportEmpty` sur chaque rapport (vacuously vrai s'il n'y
    // en a aucun) couvre les deux cas.
    const appointmentsWithoutReport = completedAppointments.filter((apt) =>
      apt.reports.every((report) =>
        isReportEmpty({
          consultationReason: report.consultationReason,
          notes: report.notes,
          anatomicalIssueCount: report.anatomicalIssues.length,
          recommendationCount: report.recommendations.length,
        }),
      ),
    );

    return appointmentsWithoutReport;
  });

/**
 * Récupère les rendez-vous d'un patient spécifique
 * @param patientId ID du patient
 * @returns Liste des rendez-vous du patient
 */
export const getAppointmentsByPatientId = createServerFn({ method: "GET" })
  .validator(patientIdSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const results = await db.query.appointments.findMany({
      where: and(
        eq(appointments.organizationId, organization.id),
        eq(appointments.patientId, data.patientId),
      ),
      orderBy: (appointments, { desc }) => [desc(appointments.beginAt)],
      with: {
        patient: {
          with: {
            owner: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
            animal: {
              columns: {
                code: true,
                name: true,
              },
            },
          },
        },
        organization: true,
      },
    });

    return results as Appointment[];
  });
