import { db } from "@biume/db";
import { clients, pets, type Client } from "@biume/db/schema/index";
import { and, desc, eq, ilike, isNull, ne, or } from "drizzle-orm";
import { z } from "zod";

import { requireOrganizationId } from "#/server/auth/organization-scope";
import {
  createClientSchema,
  deleteClientSchema,
  updateClientSchema,
  type CreateClientInput,
  type DeleteClientInput,
  type UpdateClientInput,
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

export async function getAllClients(input: GetAllClientsParams = {}) {
  const data = getAllClientsParams.parse(input);
  const organizationId = await requireOrganizationId();
  const { search = "", page = 1, limit = 250 } = data;
  const trimmedSearch = search.trim();
  const baseCondition = eq(clients.organizationId, organizationId);
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
    with: getClientRelationsForOrganization(organizationId),
    limit,
    offset: Math.max(0, (page - 1) * limit),
  }) as unknown as Promise<Client[]>;
}

export async function createClient(input: CreateClientInput) {
  const data = createClientSchema.parse(input);
  const organizationId = await requireOrganizationId();
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
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return createdClient;
}

export async function updateClient(input: UpdateClientInput) {
  const data = updateClientSchema.parse(input);
  const organizationId = await requireOrganizationId();
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
        eq(clients.organizationId, organizationId),
      ),
    )
    .returning();

  if (!updatedClient) {
    throw new Error("Client introuvable ou inaccessible.");
  }

  return updatedClient;
}

export async function deleteClient(input: DeleteClientInput) {
  const data = deleteClientSchema.parse(input);
  const organizationId = await requireOrganizationId();
  return deleteClientWithPatientIsolation({
    findClient: () =>
      db.query.clients.findFirst({
        where: and(
          eq(clients.id, data.id),
          eq(clients.organizationId, organizationId),
        ),
        columns: { id: true },
      }),
    findForeignPatient: () =>
      db.query.pets.findFirst({
        where: and(
          eq(pets.ownerId, data.id),
          or(
            isNull(pets.organizationId),
            ne(pets.organizationId, organizationId),
          ),
        ),
        columns: { id: true },
      }),
    findScopedPatients: () =>
      db.query.pets.findMany({
        where: and(
          eq(pets.ownerId, data.id),
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
    deleteClient: async () => {
      const [deletedClient] = await db
        .delete(clients)
        .where(
          and(
            eq(clients.id, data.id),
            eq(clients.organizationId, organizationId),
          ),
        )
        .returning({ id: clients.id });

      if (!deletedClient) {
        throw new Error("Client introuvable ou inaccessible.");
      }

      return deletedClient;
    },
  });
}
