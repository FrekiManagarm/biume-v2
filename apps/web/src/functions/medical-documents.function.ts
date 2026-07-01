import { db } from "@biume/db";
import {
  type CreateMedicalDocument,
  type MedicalDocument,
  medicalDocuments,
  pets,
} from "@biume/db/schema/index";
import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { getCurrentOrganization } from "#/functions/auth.function";

const petIdSchema = z.object({
  petId: z.string(),
});

const createMedicalDocumentSchema = z.object({
  petId: z.string(),
  fileName: z.string(),
  fileUrl: z.string(),
  fileType: z.string(),
  fileSize: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

const documentIdSchema = z.object({
  documentId: z.string(),
});

const updateMedicalDocumentSchema = z.object({
  documentId: z.string(),
  data: z.object({
    title: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    fileType: z.string().optional(),
  }),
});

export const getMedicalDocumentsByPetId = createServerFn({ method: "GET" })
  .validator(petIdSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const pet = await db.query.pets.findFirst({
      where: and(eq(pets.id, data.petId), eq(pets.organizationId, organization.id)),
    });

    if (!pet) {
      throw new Error("Pet not found or access denied");
    }

    return db.query.medicalDocuments.findMany({
      where: eq(medicalDocuments.petId, data.petId),
      orderBy: [desc(medicalDocuments.createdAt)],
      with: {
        uploader: true,
      },
    });
  });

export const createMedicalDocument = createServerFn({ method: "POST" })
  .validator(createMedicalDocumentSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const pet = await db.query.pets.findFirst({
      where: and(eq(pets.id, data.petId), eq(pets.organizationId, organization.id)),
    });

    if (!pet) {
      throw new Error("Pet not found or access denied");
    }

    const [document] = await db
      .insert(medicalDocuments)
      .values({
        ...(data as Omit<CreateMedicalDocument, "uploadedBy">),
        uploadedBy: organization.id,
        updatedAt: new Date(),
      })
      .returning();

    return document;
  });

export const deleteMedicalDocument = createServerFn({ method: "POST" })
  .validator(documentIdSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const document = await db.query.medicalDocuments.findFirst({
      where: eq(medicalDocuments.id, data.documentId),
      with: {
        pet: true,
      },
    });

    if (!document || document.pet?.organizationId !== organization.id) {
      throw new Error("Document not found or access denied");
    }

    await db
      .delete(medicalDocuments)
      .where(eq(medicalDocuments.id, data.documentId));

    return { success: true };
  });

export const updateMedicalDocument = createServerFn({ method: "POST" })
  .validator(updateMedicalDocumentSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const document = await db.query.medicalDocuments.findFirst({
      where: eq(medicalDocuments.id, data.documentId),
      with: {
        pet: true,
      },
    });

    if (!document || document.pet?.organizationId !== organization.id) {
      throw new Error("Document not found or access denied");
    }

    const [updated] = await db
      .update(medicalDocuments)
      .set({
        ...(data.data as Partial<
          Pick<MedicalDocument, "title" | "description" | "fileType">
        >),
        updatedAt: new Date(),
      })
      .where(eq(medicalDocuments.id, data.documentId))
      .returning();

    return updated;
  });
