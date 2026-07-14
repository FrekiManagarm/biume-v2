import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { pets } from "./pets";
import type { Pet } from "./pets";

export const animals = pgTable("animals", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  code: text("code"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt"),
});

export const animalsRelations = relations(animals, ({ many }) => ({
  pets: many(pets),
}));

export type Animal = InferSelectModel<typeof animals> & {
  pets: Pet[];
};
export type CreateAnimal = typeof animals.$inferInsert;

export const animalsSchema = createSelectSchema(animals);
export const animalsInsertSchema = createInsertSchema(animals);
