import { db } from "@biume/db";
import { clients, pets, type Client } from "@biume/db/schema/index";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, ilike, isNull, ne, or } from "drizzle-orm";
import { z } from "zod";

import { getCurrentOrganization } from "#/functions/auth.function";
import {
  createClientSchema,
  deleteClientSchema,
  updateClientSchema,
} from "#/functions/clients.schema";
import { deleteClientWithPatientIsolation } from "#/functions/tenant-mutation-isolation";
import { getClientRelationsForOrganization } from "#/functions/tenant-query-isolation";

export {
  createClientSchema,
  deleteClientSchema,
  updateClientSchema,
} from "#/functions/clients.schema";
export type {
  CreateClientInput,
  DeleteClientInput,
  UpdateClientInput,
} from "#/functions/clients.schema";

const getAllClientsParams = z
  .object({
    search: z.string().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  })
  .optional()
  .default({});

export type GetAllClientsParams = z.infer<typeof getAllClientsParams>;

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
      with: getClientRelationsForOrganization(organization.id),
      limit,
      offset: Math.max(0, (page - 1) * limit),
    }) as unknown as Promise<Client[]>;
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

export const updateClient = createServerFn({ method: "POST" })
  .validator(updateClientSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) {
      throw new Error("Organization not found");
    }

    const [updatedClient] = await db
      .update(clients)
      .set({
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        zip: data.zip || null,
        country: data.country || null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(clients.id, data.id),
          eq(clients.organizationId, organization.id),
        ),
      )
      .returning();

    if (!updatedClient) {
      throw new Error("Client introuvable ou inaccessible.");
    }

    return updatedClient;
  });

export const deleteClient = createServerFn({ method: "POST" })
  .validator(deleteClientSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) {
      throw new Error("Organization not found");
    }

    return deleteClientWithPatientIsolation({
      findClient: () =>
        db.query.clients.findFirst({
          where: and(
            eq(clients.id, data.id),
            eq(clients.organizationId, organization.id),
          ),
          columns: { id: true },
        }),
      findForeignPatient: () =>
        db.query.pets.findFirst({
          where: and(
            eq(pets.ownerId, data.id),
            or(
              isNull(pets.organizationId),
              ne(pets.organizationId, organization.id),
            ),
          ),
          columns: { id: true },
        }),
      findScopedPatients: () =>
        db.query.pets.findMany({
          where: and(
            eq(pets.ownerId, data.id),
            eq(pets.organizationId, organization.id),
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
      organizationId: organization.id,
      deleteClient: async () => {
        const [deletedClient] = await db
          .delete(clients)
          .where(
            and(
              eq(clients.id, data.id),
              eq(clients.organizationId, organization.id),
            ),
          )
          .returning({ id: clients.id });

        if (!deletedClient) {
          throw new Error("Client introuvable ou inaccessible.");
        }

        return deletedClient;
      },
    });
  });
