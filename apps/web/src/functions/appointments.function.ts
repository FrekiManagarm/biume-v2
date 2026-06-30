import { db } from "@biume/db";
import { and, eq, or, lte, gte, ne } from "drizzle-orm";
import { getCurrentOrganization } from "#/functions/auth.function";
import { type Appointment, appointments, pets } from "@biume/db/schema/index";
import { createServerFn } from "@tanstack/react-start";
import { endOfDay, startOfDay } from "date-fns";
import z from "zod";

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

export const getAppointments = createServerFn({ method: "GET" }).handler(
  async () => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const results = await db.query.appointments.findMany({
      where: eq(appointments.organizationId, organization.id),
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
 * Crée un nouveau rendez-vous
 */
export const createAppointment = createServerFn({ method: "POST" })
  .validator(createAppointmentSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    // Récupérer les informations du patient avec le propriétaire
    const patient = await db.query.pets.findFirst({
      where: eq(pets.id, data.patientId),
      with: {
        owner: true,
      },
    });

    if (!patient) {
      throw new Error("Patient non trouvé");
    }

    const [newAppointment] = await db
      .insert(appointments)
      .values({
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

    return newAppointment;
  });

/**
 * Modifie un rendez-vous existant
 */
export const updateAppointment = createServerFn({ method: "POST" })
  .validator(updateAppointmentSchema)
  .handler(async ({ data }) => {
    const { appointmentId, ...values } = data;
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

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
  });

export const deleteAppointment = createServerFn({ method: "POST" })
  .validator(appointmentIdSchema)
  .handler(async ({ data }) => {
    try {
      const organization = await getCurrentOrganization();
      if (!organization) throw new Error("Organization not found");

      const [deletedAppointment] = await db
        .delete(appointments)
        .where(
          and(
            eq(appointments.id, data.appointmentId),
            eq(appointments.organizationId, organization.id),
          ),
        )
        .returning();

      return deletedAppointment;
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
          },
        },
      },
    });

    // Filtrer ceux qui n'ont pas de rapport
    const appointmentsWithoutReport = completedAppointments.filter(
      (apt) => !apt.reports || apt.reports.length === 0,
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
