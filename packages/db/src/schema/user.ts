import { Account } from "better-auth";
import { InferSelectModel, relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { account } from "./account";
import { ClientNote, clientNote } from "./clientNote";
import { invitation } from "./invitation";
import { Member, member } from "./member";
import { notification } from "./notifications";
import { Pet, pets } from "./pets";
import { session } from "./session";

export const user = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  twoFactorEnabled: boolean("two_factor_enabled"),
  lang: text("lang").default("fr"),
  phoneNumber: text("phone_number"),
  emailNotifications: boolean("email_notifications").notNull().default(false),
  smsNotifications: boolean("sms_notifications").notNull().default(false),
});

export const userRelations = relations(user, ({ one, many }) => ({
  pets: many(pets),
  sessions: many(session),
  accounts: many(account),
  memberships: many(member),
  notifications: many(notification),
  invitations: many(invitation),
  clientNotes: many(clientNote),
}));

export type User = InferSelectModel<typeof user> & {
  pets: Pet[];
  accounts: Account[];
  memberships: Member[];
  clientNotes: ClientNote[];
};

export const CreateUserSchema = createInsertSchema(user);
export const SelectUserSchema = createSelectSchema(user);
