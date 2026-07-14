import { relations } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { clientNote } from "./clientNote";
import type { ClientNote } from "./clientNote";
import { invitation } from "./invitation";
import { member } from "./member";
import type { Member } from "./member";
import { advancedReport } from "./advancedReport/advancedReport";
import type { AdvancedReport } from "./advancedReport/advancedReport";
import { signatures } from "./signatures";
import type { Signature } from "./signatures";
import { clients } from "./clients";
import type { Client } from "./clients";
import { pets } from "./pets";
import type { Pet } from "./pets";
import { appointments } from "./appointments";
import type { Appointment } from "./appointments";

export const organization = pgTable("organizations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  verified: boolean("verified").notNull().default(false),
  metadata: text("metadata"),
  customerStripeId: text("customerStripeId"),
  onBoardingComplete: boolean("on_boarding_complete").notNull().default(false),
  onBoardingExplications: boolean("on_boarding_explications")
    .notNull()
    .default(false),
  ai: boolean("ai").notNull().default(false),
  email: text("email").unique(),
  locked: boolean("locked").notNull().default(false),
  lang: text("lang").notNull().default("fr"),
  updatedAt: timestamp("updatedAt"),
});

export const organizationRelations = relations(organization, ({ many }) => ({
  invitations: many(invitation),
  members: many(member),
  clientNotes: many(clientNote),
  advancedReports: many(advancedReport),
  signatures: many(signatures),
  clients: many(clients),
  pets: many(pets),
  appointments: many(appointments),
}));

export type Organization = InferSelectModel<typeof organization> & {
  members: Member[];
  clientNotes: ClientNote[];
  advancedReports: AdvancedReport[];
  signatures: Signature[];
  clients: Client[];
  pets: Pet[];
  appointments: Appointment[];
};
export type CreateOrganization = typeof organization.$inferInsert;

export const OrganizationSchema = createSelectSchema(organization);
export const CreateOrganizationSchema = createInsertSchema(organization);
