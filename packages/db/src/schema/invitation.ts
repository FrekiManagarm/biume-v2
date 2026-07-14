import { relations } from "drizzle-orm"
import type { InferSelectModel } from "drizzle-orm"
import { pgTable, text, timestamp } from "drizzle-orm/pg-core"

import { organization } from "./organization"
import type { Organization } from "./organization"
import { user } from "./user"
import type { User } from "./user"

export const invitation = pgTable("invitations", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id),
})

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  inviter: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}))

export type Invitation = InferSelectModel<typeof invitation> & {
  organization: Organization
  inviter: User
}
