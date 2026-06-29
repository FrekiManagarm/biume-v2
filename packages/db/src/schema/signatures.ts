import { InferSelectModel, relations } from "drizzle-orm"
import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { organization } from "./organization"

export const signatures = pgTable("signatures", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  signature: text("signature").notNull(),
  organizationId: text("organizationId").references(() => organization.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("createdAt", { mode: "date" }).default(new Date()).notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }),
})

export const signatureRelations = relations(signatures, ({ one }) => ({
  organization: one(organization, {
    fields: [signatures.organizationId],
    references: [organization.id],
  }),
}))

export type Signature = InferSelectModel<typeof signatures>
export type NewSignature = typeof signatures.$inferInsert
