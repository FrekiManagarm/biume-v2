import { z } from "zod";

/**
 * Ce qui attend un geste du praticien. Chaque genre correspond à un libellé
 * unique côté mobile ; un genre nouveau exige un libellé nouveau, jamais
 * l'inverse.
 */
export const todoItemKinds = [
  "to_attach",
  "transcribing",
  "transcript_to_review",
  "inaudible",
  "transcription_failed",
  "report_to_validate",
  "ready_to_send",
] as const;
export const todoItemKindSchema = z.enum(todoItemKinds);
export type TodoItemKind = z.infer<typeof todoItemKindSchema>;

export const todoItemSchema = z
  .object({
    kind: todoItemKindSchema,
    captureId: z.uuid(),
    reportId: z.string().min(1).nullable(),
    appointmentId: z.string().min(1).nullable(),
    patientName: z.string().nullable(),
    updatedAt: z.iso.datetime(),
  })
  .strict();
export type TodoItem = z.infer<typeof todoItemSchema>;

export const todoPageSize = 100;
export const todoResponseSchema = z
  .object({ items: z.array(todoItemSchema).max(todoPageSize) })
  .strict();
export type TodoResponse = z.infer<typeof todoResponseSchema>;
