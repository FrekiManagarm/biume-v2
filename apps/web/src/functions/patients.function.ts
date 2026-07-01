import { db } from "@biume/db";
import { type Pet, pets } from "@biume/db/schema/index";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, ilike, or } from "drizzle-orm";
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

export type GetAllPatientsParams = z.infer<typeof getAllPatientsParams>;

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

export const getPatientById = createServerFn({ method: "GET" })
  .validator(patientIdSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const patient = await db.query.pets.findFirst({
      where: and(eq(pets.id, data.id), eq(pets.organizationId, organization.id)),
      with: {
        owner: true,
        animal: true,
        advancedReport: true,
        organization: true,
      },
    });

    return patient as unknown as Pet;
  });
