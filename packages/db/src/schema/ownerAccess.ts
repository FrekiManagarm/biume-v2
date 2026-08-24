import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { reportSharedVersion } from "./advancedReport/reportSharedVersion";
import { clients } from "./clients";

/**
 * Le lien pointe vers une version figée du rapport, jamais vers le rapport
 * vivant : ce que le propriétaire a lu ne doit pas changer sous ses yeux quand
 * le praticien retouche son document.
 *
 * `token` est la clé primaire et porte 256 bits d'entropie. Il n'est jamais
 * dérivé d'un identifiant de rapport, de client ou d'animal.
 */
export const reportShareLink = pgTable(
  "report_share_link",
  {
    token: text("token").primaryKey(),
    sharedVersionId: text("shared_version_id")
      .notNull()
      .references(() => reportSharedVersion.id, { onDelete: "cascade" }),
    ownerId: text("owner_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    revokedAt: timestamp("revoked_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("report_share_link_owner_idx").on(table.ownerId)],
);

/**
 * Un défi par appareil et par lien. Le code est stocké haché avec un sel
 * propre : une fuite de base ne doit pas ouvrir les comptes rendus.
 */
export const ownerAccessChallenge = pgTable(
  "owner_access_challenge",
  {
    id: text("id").primaryKey(),
    token: text("token")
      .notNull()
      .references(() => reportShareLink.token, { onDelete: "cascade" }),
    deviceId: text("device_id").notNull(),
    codeHash: text("code_hash").notNull(),
    codeSalt: text("code_salt").notNull(),
    attempts: integer("attempts").notNull().default(0),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    consumedAt: timestamp("consumed_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("owner_access_challenge_token_idx").on(table.token, table.deviceId),
  ],
);

/**
 * Une session ne donne accès qu'à un seul lien de partage, jamais au dossier du
 * propriétaire. Un propriétaire qui reçoit trois comptes rendus a trois
 * sessions distinctes, et en révoquer une ne touche pas les autres.
 */
export const ownerSession = pgTable(
  "owner_session",
  {
    id: text("id").primaryKey(),
    token: text("token")
      .notNull()
      .references(() => reportShareLink.token, { onDelete: "cascade" }),
    sessionSecret: text("session_secret").notNull().unique(),
    deviceId: text("device_id").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    revokedAt: timestamp("revoked_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("owner_session_token_idx").on(table.token)],
);

export const reportShareLinkRelations = relations(
  reportShareLink,
  ({ one, many }) => ({
    sharedVersion: one(reportSharedVersion, {
      fields: [reportShareLink.sharedVersionId],
      references: [reportSharedVersion.id],
    }),
    owner: one(clients, {
      fields: [reportShareLink.ownerId],
      references: [clients.id],
    }),
    sessions: many(ownerSession),
  }),
);

export type PersistedShareLink = typeof reportShareLink.$inferSelect;
export type PersistedOwnerSession = typeof ownerSession.$inferSelect;
