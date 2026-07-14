import { relations } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { createSelectSchema } from "drizzle-zod";

import { organization } from "./organization";
import type { Organization } from "./organization";
import { user } from "./user";
import type { User } from "./user";

export const member = pgTable("members", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  role: text("role").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export type Member = InferSelectModel<typeof member> & {
  organization: Organization;
  user: User;
};
export type CreateMember = typeof member.$inferInsert;

export const MemberSchema = createSelectSchema(member);
export const CreateMemberSchema = createInsertSchema(member);
