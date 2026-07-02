import { db } from "@biume/db";
import { animals, type Pet, pets } from "@biume/db/schema/index";
import { createServerFn } from "@tanstack/react-start";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";

import { getCurrentOrganization } from "#/functions/auth.function";

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

export const createPatientSchema = z.object({
  name: z.string().trim().min(1),
  ownerId: z.string().trim().min(1),
  type: z.string().trim().min(1),
  breed: z.string().trim().min(1),
  gender: z.enum(["Male", "Female"]).default("Male"),
  birthDate: z.coerce.date(),
  weight: z.coerce.number().int().min(0),
  height: z.coerce.number().int().min(0),
  description: z.string().trim().optional(),
  chippedNumber: z.coerce.number().int().positive().optional(),
});

export type GetAllPatientsParams = z.infer<typeof getAllPatientsParams>;
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
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
