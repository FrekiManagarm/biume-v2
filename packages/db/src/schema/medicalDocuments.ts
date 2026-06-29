import { InferSelectModel, relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { Pet, pets } from "./pets";
import { Organization, organization } from "./organization";

export const medicalDocuments = pgTable("medical_documents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  petId: text("petId")
    .notNull()
    .references(() => pets.id, { onDelete: "cascade" }),
  uploadedBy: text("uploadedBy")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  fileName: text("fileName").notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileType: text("fileType").notNull(), // MIME type
  fileSize: text("fileSize"), // Taille en bytes
  title: text("title"),
  description: text("description"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }),
});

export const medicalDocumentsRelations = relations(
  medicalDocuments,
  ({ one }) => ({
    pet: one(pets, {
      fields: [medicalDocuments.petId],
      references: [pets.id],
    }),
    uploader: one(organization, {
      fields: [medicalDocuments.uploadedBy],
      references: [organization.id],
    }),
  }),
);

export type MedicalDocument = InferSelectModel<typeof medicalDocuments> & {
  pet: Pet;
  uploader: Organization;
};

export type CreateMedicalDocument = typeof medicalDocuments.$inferInsert;

export const CreateMedicalDocumentSchema = createInsertSchema(medicalDocuments);
export const MedicalDocumentSchema = createSelectSchema(medicalDocuments);

