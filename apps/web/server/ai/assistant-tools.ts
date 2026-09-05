import { db } from "@biume/db";
import { animals, appointments, clients, pets } from "@biume/db/schema/index";
import { and, asc, desc, eq, gte, ilike, or } from "drizzle-orm";
import { tool } from "ai";
import { z } from "zod";

import type { AppContext } from "#/lib/ai/context-builder";

const DEFAULT_LIMIT = 8;

const optionalText = z.string().trim().max(500).optional();

const toolDateString = z
  .string()
  .trim()
  .min(1)
  .describe("Date au format ISO 8601, par exemple 2026-07-04T14:00:00+02:00.");

const searchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .describe("Nom, email, telephone ou mot-cle a rechercher."),
  limit: z.number().int().min(1).max(20).optional().default(DEFAULT_LIMIT),
});

const clientIdSchema = z.object({
  clientId: z.string().trim().min(1).describe("Identifiant du client."),
});

const patientIdSchema = z.object({
  patientId: z.string().trim().min(1).describe("Identifiant du patient."),
});

const appointmentIdSchema = z.object({
  appointmentId: z
    .string()
    .trim()
    .min(1)
    .describe("Identifiant du rendez-vous."),
});

const createClientToolSchema = z.object({
  name: z.string().trim().min(1).max(160),
  email: optionalText,
  phone: optionalText,
  address: optionalText,
  city: optionalText,
  zip: optionalText,
  country: optionalText,
});

const createPatientToolSchema = z.object({
  name: z.string().trim().min(1).max(160),
  ownerId: z
    .string()
    .trim()
    .min(1)
    .describe("Identifiant du client/proprietaire existant."),
  type: z
    .string()
    .trim()
    .min(1)
    .describe("Identifiant du type d'animal, obtenu via listAnimalTypes."),
  breed: z.string().trim().min(1).max(120),
  gender: z.enum(["Male", "Female"]).default("Male"),
  birthDate: toolDateString,
  weight: z.number().int().min(0),
  height: z.number().int().min(0),
  description: optionalText,
  chippedNumber: z.number().int().positive().optional(),
});

const createAppointmentToolSchema = z
  .object({
    patientId: z.string().trim().min(1),
    beginAt: toolDateString,
    endAt: toolDateString,
    atHome: z.boolean().optional().default(false),
    note: optionalText,
  })
  .describe("Donnees necessaires pour creer un rendez-vous.");

const upcomingAppointmentsSchema = z.object({
  patientId: z.string().trim().min(1).optional(),
  limit: z.number().int().min(1).max(20).optional().default(DEFAULT_LIMIT),
});

function asDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function parseToolDate(value: string, fieldName: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} doit etre une date ISO valide.`);
  }

  return date;
}

function nullIfBlank(value: string | undefined) {
  return value && value.trim().length > 0 ? value.trim() : null;
}

function compactClient(client: typeof clients.$inferSelect) {
  return {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    address: [client.address, client.zip, client.city, client.country]
      .filter(Boolean)
      .join(", "),
    createdAt: asDate(client.createdAt),
  };
}

function compactPatient(
  patient: typeof pets.$inferSelect & {
    animal?: { name: string | null; code: string | null } | null;
    owner?: typeof clients.$inferSelect | null;
  },
) {
  return {
    id: patient.id,
    name: patient.name,
    animal: patient.animal?.name ?? patient.type,
    animalCode: patient.animal?.code,
    breed: patient.breed,
    gender: patient.gender,
    birthDate: asDate(patient.birthDate),
    weight: patient.weight,
    height: patient.height,
    chippedNumber: patient.chippedNumber,
    description: patient.description,
    owner: patient.owner ? compactClient(patient.owner) : null,
    createdAt: asDate(patient.createdAt),
  };
}

function compactAppointment(
  appointment: typeof appointments.$inferSelect & {
    patient?:
      | (typeof pets.$inferSelect & {
          owner?: typeof clients.$inferSelect | null;
          animal?: { name: string | null; code: string | null } | null;
        })
      | null;
  },
) {
  return {
    id: appointment.id,
    beginAt: asDate(appointment.beginAt),
    endAt: asDate(appointment.endAt),
    status: appointment.status,
    atHome: appointment.atHome,
    note: appointment.note,
    patient: appointment.patient ? compactPatient(appointment.patient) : null,
  };
}

async function ensureClientInOrganization(
  clientId: string,
  organizationId: string,
) {
  const client = await db.query.clients.findFirst({
    where: and(
      eq(clients.id, clientId),
      eq(clients.organizationId, organizationId),
    ),
  });

  if (!client) {
    throw new Error("Client introuvable dans l'organisation active.");
  }

  return client;
}

async function ensurePatientInOrganization(
  patientId: string,
  organizationId: string,
) {
  const patient = await db.query.pets.findFirst({
    where: and(eq(pets.id, patientId), eq(pets.organizationId, organizationId)),
  });

  if (!patient) {
    throw new Error("Patient introuvable dans l'organisation active.");
  }

  return patient;
}

async function getPatientRecordData(patientId: string, organizationId: string) {
  const patient = await db.query.pets.findFirst({
    where: and(eq(pets.id, patientId), eq(pets.organizationId, organizationId)),
    with: {
      owner: true,
      animal: {
        columns: {
          code: true,
          name: true,
        },
      },
      medicalDocuments: {
        orderBy: (medicalDocuments, { desc }) => [
          desc(medicalDocuments.createdAt),
        ],
        limit: 8,
      },
      appointments: {
        orderBy: (appointments, { desc }) => [desc(appointments.beginAt)],
        limit: 12,
      },
      advancedReport: {
        orderBy: (advancedReport, { desc }) => [desc(advancedReport.createdAt)],
        limit: 6,
        with: {
          appointment: true,
          anatomicalIssues: {
            with: {
              anatomicalPart: true,
            },
          },
          recommendations: true,
        },
      },
    },
  });

  if (!patient) {
    throw new Error("Patient introuvable dans l'organisation active.");
  }

  return {
    patient: compactPatient(patient),
    appointments: patient.appointments.map((appointment) =>
      compactAppointment(appointment),
    ),
    documents: patient.medicalDocuments?.map((document) => ({
      id: document.id,
      title: document.title,
      fileName: document.fileName,
      fileType: document.fileType,
      description: document.description,
      createdAt: asDate(document.createdAt),
    })),
    reports: patient.advancedReport.map((report) => ({
      id: report.id,
      title: report.title,
      status: report.status,
      consultationReason: report.consultationReason,
      notes: report.notes,
      createdAt: asDate(report.createdAt),
      appointment: report.appointment
        ? compactAppointment(report.appointment)
        : null,
      anatomicalIssues: report.anatomicalIssues.map((issue) => ({
        id: issue.id,
        type: issue.type,
        observationType: issue.observationType,
        anatomicalPart: issue.anatomicalPart?.name,
        laterality: issue.laterality,
        severity: issue.severity,
        notes: issue.notes,
      })),
      recommendations: report.recommendations.map((recommendation) => ({
        id: recommendation.id,
        recommendation: recommendation.recommendation,
      })),
    })),
  };
}

async function getUpcomingAppointmentsData(
  organizationId: string,
  input: z.infer<typeof upcomingAppointmentsSchema>,
) {
  const now = new Date();
  const appointmentRows = await db.query.appointments.findMany({
    where: and(
      eq(appointments.organizationId, organizationId),
      gte(appointments.beginAt, now),
      input.patientId ? eq(appointments.patientId, input.patientId) : undefined,
    ),
    orderBy: [asc(appointments.beginAt)],
    limit: input.limit,
    with: {
      patient: {
        with: {
          owner: true,
          animal: {
            columns: {
              code: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return appointmentRows.map((appointment) => compactAppointment(appointment));
}

export async function buildAssistantDataSnapshot(
  context: AppContext,
  organizationId: string,
) {
  const sections: string[] = [];

  if (context.selectedClient?.id) {
    const client = await db.query.clients.findFirst({
      where: and(
        eq(clients.id, context.selectedClient.id),
        eq(clients.organizationId, organizationId),
      ),
      with: {
        pets: {
          with: {
            animal: {
              columns: {
                code: true,
                name: true,
              },
            },
          },
          limit: 6,
        },
      },
    });

    if (client) {
      sections.push(
        `Client actif en base : ${JSON.stringify({
          ...compactClient(client),
          patients: client.pets.map((patient) => compactPatient(patient)),
        })}`,
      );
    }
  }

  if (context.selectedPatient?.id) {
    const patient = await db.query.pets.findFirst({
      where: and(
        eq(pets.id, context.selectedPatient.id),
        eq(pets.organizationId, organizationId),
      ),
      with: {
        owner: true,
        animal: {
          columns: {
            code: true,
            name: true,
          },
        },
      },
    });

    if (patient) {
      const upcoming = await getUpcomingAppointmentsData(organizationId, {
        patientId: patient.id,
        limit: 3,
      });
      sections.push(
        `Patient actif en base : ${JSON.stringify({
          ...compactPatient(patient),
          upcomingAppointments: upcoming,
        })}`,
      );
    }
  }

  const upcomingAppointments = await getUpcomingAppointmentsData(
    organizationId,
    {
      limit: 5,
    },
  );

  if (upcomingAppointments.length > 0) {
    sections.push(
      `Prochains rendez-vous de l'organisation : ${JSON.stringify(
        upcomingAppointments,
      )}`,
    );
  }

  return sections.join("\n");
}

export function createAssistantTools(organizationId: string) {
  return {
    searchClients: tool({
      description:
        "Recherche des clients/proprietaires dans l'organisation active par nom, email ou telephone.",
      inputSchema: searchSchema,
      execute: async ({ query, limit }) => {
        const trimmedQuery = query.trim();
        const results = await db.query.clients.findMany({
          where: and(
            eq(clients.organizationId, organizationId),
            or(
              ilike(clients.name, `%${trimmedQuery}%`),
              ilike(clients.email, `%${trimmedQuery}%`),
              ilike(clients.phone, `%${trimmedQuery}%`),
            ),
          ),
          orderBy: [desc(clients.createdAt)],
          limit,
          with: {
            pets: {
              with: {
                animal: {
                  columns: {
                    code: true,
                    name: true,
                  },
                },
              },
              limit: 6,
            },
          },
        });

        return results.map((client) => ({
          ...compactClient(client),
          patients: client.pets.map((patient) => compactPatient(patient)),
        }));
      },
    }),

    searchPatients: tool({
      description:
        "Recherche des patients/animaux dans l'organisation active par nom ou race.",
      inputSchema: searchSchema,
      execute: async ({ query, limit }) => {
        const trimmedQuery = query.trim();
        const results = await db.query.pets.findMany({
          where: and(
            eq(pets.organizationId, organizationId),
            or(
              ilike(pets.name, `%${trimmedQuery}%`),
              ilike(pets.breed, `%${trimmedQuery}%`),
            ),
          ),
          orderBy: [desc(pets.createdAt)],
          limit,
          with: {
            owner: true,
            animal: {
              columns: {
                code: true,
                name: true,
              },
            },
          },
        });

        return results.map((patient) => compactPatient(patient));
      },
    }),

    listAnimalTypes: tool({
      description:
        "Liste les types d'animaux disponibles. A utiliser avant de creer un patient si le type exact n'est pas connu.",
      inputSchema: z.object({}),
      execute: async () =>
        db.query.animals.findMany({
          columns: {
            id: true,
            name: true,
            code: true,
          },
          orderBy: [asc(animals.name)],
        }),
    }),

    getClientRecord: tool({
      description:
        "Consulte le dossier complet d'un client/proprietaire et les patients lies.",
      inputSchema: clientIdSchema,
      execute: async ({ clientId }) => {
        const client = await db.query.clients.findFirst({
          where: and(
            eq(clients.id, clientId),
            eq(clients.organizationId, organizationId),
          ),
          with: {
            pets: {
              with: {
                animal: {
                  columns: {
                    code: true,
                    name: true,
                  },
                },
                appointments: {
                  orderBy: (appointments, { desc }) => [
                    desc(appointments.beginAt),
                  ],
                  limit: 8,
                },
                advancedReport: {
                  orderBy: (advancedReport, { desc }) => [
                    desc(advancedReport.createdAt),
                  ],
                  limit: 4,
                },
              },
            },
          },
        });

        if (!client) {
          throw new Error("Client introuvable dans l'organisation active.");
        }

        return {
          client: compactClient(client),
          patients: client.pets.map((patient) => ({
            ...compactPatient(patient),
            appointments: patient.appointments.map((appointment) =>
              compactAppointment(appointment),
            ),
            reports: patient.advancedReport.map((report) => ({
              id: report.id,
              title: report.title,
              status: report.status,
              consultationReason: report.consultationReason,
              createdAt: asDate(report.createdAt),
            })),
          })),
        };
      },
    }),

    getPatientRecord: tool({
      description:
        "Consulte le dossier patient complet : identite, proprietaire, rendez-vous, documents et derniers comptes rendus.",
      inputSchema: patientIdSchema,
      execute: async ({ patientId }) =>
        getPatientRecordData(patientId, organizationId),
    }),

    getUpcomingAppointments: tool({
      description:
        "Liste les prochains rendez-vous de l'organisation, ou seulement ceux d'un patient si patientId est fourni.",
      inputSchema: upcomingAppointmentsSchema,
      execute: async (input) =>
        getUpcomingAppointmentsData(organizationId, input),
    }),

    prepareAppointment: tool({
      description:
        "Prepare un rendez-vous avec le resume du patient, son historique recent et le rendez-vous a venir.",
      inputSchema: z.object({
        appointmentId: z.string().trim().min(1).optional(),
        patientId: z.string().trim().min(1).optional(),
      }),
      execute: async ({ appointmentId, patientId }) => {
        let appointment = null;

        if (appointmentId) {
          appointment = await db.query.appointments.findFirst({
            where: and(
              eq(appointments.id, appointmentId),
              eq(appointments.organizationId, organizationId),
            ),
            with: {
              patient: {
                with: {
                  owner: true,
                  animal: {
                    columns: {
                      code: true,
                      name: true,
                    },
                  },
                },
              },
            },
          });
        } else if (patientId) {
          const [nextAppointment] = await getUpcomingAppointmentsData(
            organizationId,
            {
              patientId,
              limit: 1,
            },
          );
          appointment = nextAppointment;
        } else {
          const [nextAppointment] = await getUpcomingAppointmentsData(
            organizationId,
            {
              limit: 1,
            },
          );
          appointment = nextAppointment;
        }

        if (!appointment) {
          throw new Error("Aucun rendez-vous a preparer n'a ete trouve.");
        }

        const resolvedPatientId =
          "patientId" in appointment
            ? appointment.patientId
            : appointment.patient?.id;

        if (!resolvedPatientId) {
          throw new Error("Le rendez-vous n'est pas rattache a un patient.");
        }

        const patientRecord = await getPatientRecordData(
          resolvedPatientId,
          organizationId,
        );

        return {
          appointment:
            "patientId" in appointment
              ? compactAppointment(appointment)
              : appointment,
          patientRecord,
        };
      },
    }),

    createClientRecord: tool({
      description:
        "Cree un nouveau dossier client/proprietaire dans l'organisation active. Ne l'utilise que si le nom du client est connu.",
      inputSchema: createClientToolSchema,
      execute: async (input) => {
        const [createdClient] = await db
          .insert(clients)
          .values({
            name: input.name,
            email: nullIfBlank(input.email),
            phone: nullIfBlank(input.phone),
            address: nullIfBlank(input.address),
            city: nullIfBlank(input.city),
            zip: nullIfBlank(input.zip),
            country: nullIfBlank(input.country),
            organizationId,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return {
          created: true,
          client: compactClient(createdClient),
        };
      },
    }),

    createPatientRecord: tool({
      description:
        "Cree un nouveau dossier patient/animal pour un client existant. Verifie d'abord le client et le type d'animal si necessaire.",
      inputSchema: createPatientToolSchema,
      execute: async (input) => {
        await ensureClientInOrganization(input.ownerId, organizationId);

        const animalType = await db.query.animals.findFirst({
          where: eq(animals.id, input.type),
        });

        if (!animalType) {
          throw new Error(
            "Type d'animal introuvable. Utilise listAnimalTypes puis reessaie.",
          );
        }

        const [createdPatient] = await db
          .insert(pets)
          .values({
            name: input.name,
            ownerId: input.ownerId,
            type: input.type,
            breed: input.breed,
            gender: input.gender,
            birthDate: parseToolDate(input.birthDate, "birthDate"),
            weight: input.weight,
            height: input.height,
            description: nullIfBlank(input.description),
            chippedNumber: input.chippedNumber,
            organizationId,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return {
          created: true,
          patient: compactPatient({
            ...createdPatient,
            owner: await ensureClientInOrganization(
              input.ownerId,
              organizationId,
            ),
            animal: animalType,
          }),
        };
      },
    }),

    createAppointment: tool({
      description:
        "Cree un rendez-vous pour un patient existant dans l'organisation active. Ne l'utilise que si les dates de debut et de fin sont explicites.",
      inputSchema: createAppointmentToolSchema,
      execute: async (input) => {
        await ensurePatientInOrganization(input.patientId, organizationId);
        const beginAt = parseToolDate(input.beginAt, "beginAt");
        const endAt = parseToolDate(input.endAt, "endAt");

        if (endAt <= beginAt) {
          throw new Error("La fin du rendez-vous doit etre apres le debut.");
        }

        const [createdAppointment] = await db
          .insert(appointments)
          .values({
            patientId: input.patientId,
            beginAt,
            endAt,
            organizationId,
            atHome: input.atHome ?? false,
            note: nullIfBlank(input.note),
            status: "CREATED",
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return {
          created: true,
          appointment: compactAppointment(createdAppointment),
        };
      },
    }),

    getAppointment: tool({
      description: "Consulte un rendez-vous precis par identifiant.",
      inputSchema: appointmentIdSchema,
      execute: async ({ appointmentId }) => {
        const appointment = await db.query.appointments.findFirst({
          where: and(
            eq(appointments.id, appointmentId),
            eq(appointments.organizationId, organizationId),
          ),
          with: {
            patient: {
              with: {
                owner: true,
                animal: {
                  columns: {
                    code: true,
                    name: true,
                  },
                },
              },
            },
          },
        });

        if (!appointment) {
          throw new Error(
            "Rendez-vous introuvable dans l'organisation active.",
          );
        }

        return compactAppointment(appointment);
      },
    }),
  };
}
