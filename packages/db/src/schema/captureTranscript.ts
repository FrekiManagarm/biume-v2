import {
  transcriptMaxCharacters,
  transcriptStatuses,
} from "@biume/contracts/transcript";
import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { audioCapture } from "./audioCapture";

export const captureTranscriptStatus = pgEnum(
  "capture_transcript_status",
  transcriptStatuses,
);

/**
 * Une dictée a une transcription et une seule : la clé primaire est celle de la
 * capture.
 *
 * La ligne survit délibérément à la purge de l'audio sous 24 heures. C'est la
 * transcription corrigée qui porte la valeur clinique ; l'audio n'est qu'un
 * intermédiaire, et le conserver plus longtemps serait un risque sans bénéfice.
 */
export const captureTranscript = pgTable(
  "capture_transcript",
  {
    captureId: uuid("capture_id")
      .primaryKey()
      .references(() => audioCapture.id, { onDelete: "cascade" }),
    status: captureTranscriptStatus("status").notNull().default("pending"),
    text: text("text").notNull().default(""),
    language: text("language").notNull().default("fr"),
    provider: text("provider").notNull().default(""),
    /** Code technique normalisé, jamais un message de fournisseur. */
    lastErrorCode: text("last_error_code"),
    attemptCount: integer("attempt_count").notNull().default(0),
    correctedAt: timestamp("corrected_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("capture_transcript_status_idx").on(table.status),
    // `sql.raw` sur la borne : interpolée telle quelle, drizzle en ferait un
    // paramètre lié (`$1`), ce qu'une contrainte de schéma ne peut pas porter.
    check(
      "capture_transcript_text_length",
      sql`char_length(${table.text}) <= ${sql.raw(String(transcriptMaxCharacters))}`,
    ),
  ],
);

export const captureTranscriptRelations = relations(
  captureTranscript,
  ({ one }) => ({
    capture: one(audioCapture, {
      fields: [captureTranscript.captureId],
      references: [audioCapture.id],
    }),
  }),
);

export type PersistedTranscript = typeof captureTranscript.$inferSelect;
