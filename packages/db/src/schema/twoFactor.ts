import { relations } from "drizzle-orm"
import { pgTable, text } from "drizzle-orm/pg-core"

import { user } from "./user"

export const twoFactor = pgTable("twoFactors", {
  id: text("id").primaryKey(),
  secret: text("secret").notNull(),
  backupCodes: text("backup_codes").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
})

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
  user: one(user, {
    fields: [twoFactor.userId],
    references: [user.id],
  }),
}))
