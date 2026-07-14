import { relations } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { clientNote } from "./clientNote";
import type { ClientNote } from "./clientNote";
import { organization } from "./organization";
import type { Organization } from "./organization";
import { pets } from "./pets";
import type { Pet } from "./pets";

export const clients = pgTable("clients", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  image: text("image"),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  country: text("country"),
  organizationId: text("organizationId").references(() => organization.id),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt"),
});

export const clientRelations = relations(clients, ({ many, one }) => ({
  clientNotes: many(clientNote),
  organization: one(organization, {
    fields: [clients.organizationId],
    references: [organization.id],
  }),
  pets: many(pets),
}));

export type Client = InferSelectModel<typeof clients> & {
  clientNotes: ClientNote[];
  organization: Organization;
  pets: Pet[];
};
