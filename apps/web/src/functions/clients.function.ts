import { db } from "@biume/db";
import { clients, type Client } from "@biume/db/schema/index";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";

import { getCurrentOrganization } from "#/functions/auth.function";

const optionalText = z.string().trim().optional();

const getAllClientsParams = z
  .object({
    search: z.string().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  })
  .optional()
  .default({});

export const createClientSchema = z.object({
  name: z.string().trim().min(1),
  email: optionalText,
  phone: optionalText,
  address: optionalText,
  city: optionalText,
  zip: optionalText,
  country: optionalText,
});

export type GetAllClientsParams = z.infer<typeof getAllClientsParams>;
export type CreateClientInput = z.infer<typeof createClientSchema>;

export const getAllClients = createServerFn({ method: "GET" })
  .validator(getAllClientsParams)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) {
      throw new Error("Organization not found");
    }

    const { search = "", page = 1, limit = 250 } = data;
    const trimmedSearch = search.trim();
    const baseCondition = eq(clients.organizationId, organization.id);
    const where =
      trimmedSearch.length > 0
        ? and(
            baseCondition,
            or(
              ilike(clients.name, `%${trimmedSearch}%`),
              ilike(clients.email, `%${trimmedSearch}%`),
              ilike(clients.phone, `%${trimmedSearch}%`),
            ),
          )
        : baseCondition;

    return db.query.clients.findMany({
      where,
      orderBy: [desc(clients.createdAt)],
      with: {
        pets: {
          with: {
            animal: true,
            advancedReport: true,
          },
        },
      },
      limit,
      offset: Math.max(0, (page - 1) * limit),
    }) as Promise<Client[]>;
  });

export const createClient = createServerFn({ method: "POST" })
  .validator(createClientSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) {
      throw new Error("Organization not found");
    }

    const [createdClient] = await db
      .insert(clients)
      .values({
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        zip: data.zip || null,
        country: data.country || null,
        organizationId: organization.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return createdClient;
  });
