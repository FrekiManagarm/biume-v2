import "server-only";

import { db } from "@biume/db";
import { animals, clients, type Pet, pets } from "@biume/db/schema/index";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";

import { requireOrganizationId } from "#/server/auth/organization-scope";
import {
  createPatientSchema,
  deletePatientSchema,
  updatePatientSchema,
  type CreatePatientInput,
  type DeletePatientInput,
  type UpdatePatientInput,
} from "#/functions/patients.schema";
import {
  createPatientWithOwnerIsolation,
  deletePatientWithDependencyIsolation,
} from "#/functions/tenant-mutation-isolation";

export {
  createPatientSchema,
  deletePatientSchema,
  updatePatientSchema,
} from "#/functions/patients.schema";
export type {
  CreatePatientInput,
  DeletePatientInput,
  UpdatePatientInput,
} from "#/functions/patients.schema";

const getAllPatientsParams = z
  .object({
    search: z.string().optional(),
    type: z.string().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  })
  .optional()
  .default({});

const patientIdSchema = z.object({
  id: z.string(),
});

export type GetAllPatientsParams = z.infer<typeof getAllPatientsParams>;
export type AnimalOption = {
  code: string | null;
  id: string;
  name: string | null;
};

export async function getAllPatients(input: GetAllPatientsParams = {}) {
  const data = getAllPatientsParams.parse(input);
  const organizationId = await requireOrganizationId();

  const { search = "", page = 1, limit = 10 } = data;

  const baseCondition = eq(pets.organizationId, organizationId);
  const where =
    search.trim().length > 0
      ? and(
          baseCondition,
          or(
            ilike(pets.name, `%${search.trim().toLowerCase()}%`),
            ilike(pets.breed, `%${search.trim().toLowerCase()}%`),
          ),
        )
      : and(baseCondition);

  const offset = Math.max(0, (page - 1) * limit);

  return db.query.pets.findMany({
    where,
    orderBy: [desc(pets.createdAt)],
    with: {
      owner: true,
      animal: true,
      advancedReport: true,
    },
    limit,
    offset,
  });
}

export async function getAllAnimals() {
  return db.query.animals.findMany({
    columns: {
      id: true,
      name: true,
      code: true,
    },
    orderBy: [asc(animals.name)],
  }) as Promise<AnimalOption[]>;
}

export async function createPatient(input: CreatePatientInput) {
  const data = createPatientSchema.parse(input);
  const organizationId = await requireOrganizationId();

  return createPatientWithOwnerIsolation({
    findOwner: () =>
      db.query.clients.findFirst({
        where: and(
          eq(clients.id, data.ownerId),
          eq(clients.organizationId, organizationId),
        ),
        columns: { id: true },
      }),
    insertPatient: async () => {
      const [createdPatient] = await db
        .insert(pets)
        .values({
          name: data.name,
          ownerId: data.ownerId,
          type: data.type,
          breed: data.breed,
          gender: data.gender,
          birthDate: data.birthDate,
          weight: data.weight,
          height: data.height,
          description: data.description || null,
          chippedNumber: data.chippedNumber,
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return createdPatient;
    },
  });
}

export async function updatePatient(input: UpdatePatientInput) {
  const data = updatePatientSchema.parse(input);
  const organizationId = await requireOrganizationId();

  const owner = await db.query.clients.findFirst({
    where: and(
      eq(clients.id, data.ownerId),
      eq(clients.organizationId, organizationId),
    ),
    columns: {
      id: true,
    },
  });

  if (!owner) {
    throw new Error("Propriétaire introuvable ou inaccessible.");
  }

  const [updatedPatient] = await db
    .update(pets)
    .set({
      name: data.name,
      ownerId: data.ownerId,
      type: data.type,
      breed: data.breed,
      gender: data.gender,
      birthDate: data.birthDate,
      weight: data.weight,
      height: data.height,
      description: data.description || null,
      chippedNumber:
        data.chippedNumber === undefined ? undefined : data.chippedNumber,
      updatedAt: new Date(),
    })
    .where(and(eq(pets.id, data.id), eq(pets.organizationId, organizationId)))
    .returning();

  if (!updatedPatient) {
    throw new Error("Patient introuvable ou inaccessible.");
  }

  return updatedPatient;
}

export async function deletePatient(input: DeletePatientInput) {
  const data = deletePatientSchema.parse(input);
  const organizationId = await requireOrganizationId();

  return deletePatientWithDependencyIsolation({
    findPatient: () =>
      db.query.pets.findFirst({
        where: and(
          eq(pets.id, data.id),
          eq(pets.organizationId, organizationId),
        ),
        columns: { id: true, organizationId: true },
        with: {
          appointments: {
            columns: { id: true, organizationId: true },
            with: {
              reports: {
                columns: {
                  id: true,
                  createdBy: true,
                  appointmentId: true,
                  patientId: true,
                },
              },
            },
          },
          advancedReport: {
            columns: {
              id: true,
              createdBy: true,
              appointmentId: true,
              patientId: true,
            },
          },
          medicalDocuments: {
            columns: { id: true, uploadedBy: true },
          },
        },
      }),
    organizationId,
    deletePatient: async () => {
      const [deletedPatient] = await db
        .delete(pets)
        .where(
          and(eq(pets.id, data.id), eq(pets.organizationId, organizationId)),
        )
        .returning({ id: pets.id });

      if (!deletedPatient) {
        throw new Error("Patient introuvable ou inaccessible.");
      }

      return deletedPatient;
    },
  });
}

export type PatientIdInput = z.infer<typeof patientIdSchema>;

export async function getPatientById(input: PatientIdInput) {
  const data = patientIdSchema.parse(input);
  const organizationId = await requireOrganizationId();

  const patient = await db.query.pets.findFirst({
    where: and(eq(pets.id, data.id), eq(pets.organizationId, organizationId)),
    with: {
      owner: true,
      animal: true,
      advancedReport: true,
      organization: true,
    },
  });

  return patient as unknown as Pet;
}
