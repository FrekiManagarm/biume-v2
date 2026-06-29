import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { Pet, pets } from "./pets";
import { Organization, organization } from "./organization";
import { InferSelectModel, relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { advancedReport } from "./advancedReport/advancedReport";

export const appointmentStatus = pgEnum("appointmentStatus", [
  "CREATED",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
]);

export const appointments = pgTable("appointments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  patientId: text("patientId").references(() => pets.id, {
    onDelete: "cascade",
  }),
  beginAt: timestamp("beginAt", { mode: "date" }).notNull(),
  endAt: timestamp("endAt", { mode: "date" }).notNull(),
  organizationId: text("organizationId").references(() => organization.id, {
    onDelete: "cascade",
  }),
  atHome: boolean("atHome").notNull().default(false),
  status: appointmentStatus("status").notNull().default("CREATED"),
  note: text("note"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }),
});

export const appointmentRelations = relations(appointments, ({ one, many }) => ({
  patient: one(pets, {
    fields: [appointments.patientId],
    references: [pets.id],
  }),
  organization: one(organization, {
    fields: [appointments.organizationId],
    references: [organization.id],
  }),
  reports: many(advancedReport),
}));

export type Appointment = InferSelectModel<typeof appointments> & {
  patient: Pet;
  organization: Organization;
};

export const createAppointmentSchema = createInsertSchema(appointments);
export const selectAppointmentSchema = createSelectSchema(appointments);
