import { db } from "@biume/db";
import { animals, clients, type Pet, pets } from "@biume/db/schema/index";
import { createServerFn } from "@tanstack/react-start";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";

import { getCurrentOrganization } from "#/functions/auth.function";
import {
  createPatientSchema,
  deletePatientSchema,
  updatePatientSchema,
} from "#/functions/patients.schema";
import { createPatientWithOwnerIsolation } from "#/functions/tenant-mutation-isolation";

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

export const getAllPatients = createServerFn({ method: "GET" })
  .validator(getAllPatientsParams)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const { search = "", page = 1, limit = 10 } = data;

    const baseCondition = eq(pets.organizationId, organization.id);
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
  });

export const getAllAnimals = createServerFn({ method: "GET" }).handler(
  async () =>
    db.query.animals.findMany({
      columns: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: [asc(animals.name)],
    }) as Promise<AnimalOption[]>,
);

export const createPatient = createServerFn({ method: "POST" })
  .validator(createPatientSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    return createPatientWithOwnerIsolation({
      findOwner: () =>
        db.query.clients.findFirst({
          where: and(
            eq(clients.id, data.ownerId),
            eq(clients.organizationId, organization.id),
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
            organizationId: organization.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return createdPatient;
      },
    });
  });

export const updatePatient = createServerFn({ method: "POST" })
  .validator(updatePatientSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const owner = await db.query.clients.findFirst({
      where: and(
        eq(clients.id, data.ownerId),
        eq(clients.organizationId, organization.id),
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
      .where(
        and(eq(pets.id, data.id), eq(pets.organizationId, organization.id)),
      )
      .returning();

    if (!updatedPatient) {
      throw new Error("Patient introuvable ou inaccessible.");
    }

    return updatedPatient;
  });

export const deletePatient = createServerFn({ method: "POST" })
  .validator(deletePatientSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const [deletedPatient] = await db
      .delete(pets)
      .where(
        and(eq(pets.id, data.id), eq(pets.organizationId, organization.id)),
      )
      .returning({ id: pets.id });

    if (!deletedPatient) {
      throw new Error("Patient introuvable ou inaccessible.");
    }

    return deletedPatient;
  });

export const getPatientById = createServerFn({ method: "GET" })
  .validator(patientIdSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const patient = await db.query.pets.findFirst({
      where: and(
        eq(pets.id, data.id),
        eq(pets.organizationId, organization.id),
      ),
      with: {
        owner: true,
        animal: true,
        advancedReport: true,
        organization: true,
      },
    });

    return patient as unknown as Pet;
  });
