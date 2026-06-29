import { InferSelectModel, relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { Animal, animals } from "./animals";
import {
  AdvancedReport,
  advancedReport,
} from "./advancedReport/advancedReport";
import { Organization, organization } from "./organization";
import { Client, clients } from "./clients";
import { Appointment, appointments } from "./appointments";
import {
  MedicalDocument,
  medicalDocuments,
} from "./medicalDocuments";

export const petGender = pgEnum("petGender", ["Male", "Female"]);

export const pets = pgTable("pets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  type: text("type").references(() => animals.id, {
    onDelete: "cascade",
  }),
  weight: integer("weight").notNull(),
  height: integer("height").notNull(),
  description: text("description"),
  ownerId: text("ownerId").references(() => clients.id, {
    onDelete: "cascade",
  }),
  breed: text("breed").notNull(),
  image: text("image"),
  chippedNumber: integer("chippedNumber"),
  gender: petGender("gender").notNull().default("Male"),
  nacType: text("nacType"),
  birthDate: timestamp("birthDate", { mode: "date" }).notNull(),
  deseases: text("deseases").array(),
  allergies: text("allergies").array(),
  intolerences: text("intolerences").array(),
  organizationId: text("organizationId").references(() => organization.id),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }),
});

export const petsRelations = relations(pets, ({ many, one }) => ({
  owner: one(clients, {
    fields: [pets.ownerId],
    references: [clients.id],
  }),
  animal: one(animals, {
    fields: [pets.type],
    references: [animals.id],
  }),
  advancedReport: many(advancedReport),
  organization: one(organization, {
    fields: [pets.organizationId],
    references: [organization.id],
  }),
  appointments: many(appointments),
  medicalDocuments: many(medicalDocuments),
}));

export type Pet = InferSelectModel<typeof pets> & {
  owner: Client;
  animal: Animal;
  advancedReport: AdvancedReport[];
  organization: Organization;
  appointments: Appointment[];
  medicalDocuments?: MedicalDocument[];
};

export type CreatePet = typeof pets.$inferInsert;

export const CreatePetSchema = createInsertSchema(pets);
export const PetSchema = createSelectSchema(pets);
