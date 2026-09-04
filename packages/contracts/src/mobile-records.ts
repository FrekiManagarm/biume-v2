import { z } from "zod";

import { patientSpeciesSchema } from "./capture";
import { reportStatusSchema } from "./report";

const isoDateTimeSchema = z.iso.datetime();

export const mobileRecordsPageSize = 50;

/**
 * Ce que l'écran de terrain a besoin de lire pour nommer et joindre un
 * propriétaire. L'adresse complète, les notes et l'historique de facturation
 * restent sur le serveur : le mobile ne les affiche jamais.
 */
export const mobileOwnerSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    city: z.string().nullable(),
    patientCount: z.number().int().nonnegative(),
  })
  .strict();
export type MobileOwner = z.infer<typeof mobileOwnerSchema>;

export const mobileOwnersResponseSchema = z
  .object({
    items: z.array(mobileOwnerSchema).max(mobileRecordsPageSize),
    nextCursor: z.string().min(1).nullable(),
  })
  .strict();
export type MobileOwnersResponse = z.infer<typeof mobileOwnersResponseSchema>;

export const mobilePatientSchema = z
  .object({
    id: z.string().min(1),
    ownerId: z.string().min(1),
    ownerName: z.string().min(1),
    name: z.string().min(1),
    species: patientSpeciesSchema,
    breed: z.string().nullable(),
    birthDate: isoDateTimeSchema.nullable(),
    lastAppointmentAt: isoDateTimeSchema.nullable(),
  })
  .strict();
export type MobilePatient = z.infer<typeof mobilePatientSchema>;

export const mobilePatientsResponseSchema = z
  .object({
    items: z.array(mobilePatientSchema).max(mobileRecordsPageSize),
    nextCursor: z.string().min(1).nullable(),
  })
  .strict();
export type MobilePatientsResponse = z.infer<
  typeof mobilePatientsResponseSchema
>;

/**
 * L'historique dit ce qui s'est passé et où en est le compte rendu, sans jamais
 * transporter le contenu clinique : le mobile ne l'affiche pas, et le faire
 * transiter l'exposerait au cache local.
 */
export const mobilePatientHistoryEntrySchema = z
  .object({
    appointmentId: z.string().min(1),
    beginAt: isoDateTimeSchema,
    reportId: z.string().min(1).nullable(),
    reportStatus: reportStatusSchema.nullable(),
    consultationReason: z.string(),
  })
  .strict();
export type MobilePatientHistoryEntry = z.infer<
  typeof mobilePatientHistoryEntrySchema
>;

export const mobilePatientHistoryResponseSchema = z
  .object({
    items: z.array(mobilePatientHistoryEntrySchema).max(mobileRecordsPageSize),
    nextCursor: z.string().min(1).nullable(),
  })
  .strict();
export type MobilePatientHistoryResponse = z.infer<
  typeof mobilePatientHistoryResponseSchema
>;

export const createMobileOwnerRequestSchema = z
  .object({
    name: z.string().trim().min(1),
    email: z.string().trim().min(1).optional(),
    phone: z.string().trim().min(1).optional(),
    city: z.string().trim().min(1).optional(),
  })
  .strict();
export type CreateMobileOwnerRequest = z.infer<
  typeof createMobileOwnerRequestSchema
>;

/** Sert le garde-fou de finalisation : ne modifie que l'e-mail. */
export const updateOwnerEmailRequestSchema = z
  .object({ email: z.email() })
  .strict();
export type UpdateOwnerEmailRequest = z.infer<typeof updateOwnerEmailRequestSchema>;

/**
 * Création minimale assumée. Le praticien en clientèle connaît le nom et
 * l'espèce ; tout le reste se complète plus tard, sur le web ou sur la fiche.
 */
export const createMobilePatientRequestSchema = z
  .object({
    ownerId: z.string().min(1),
    name: z.string().trim().min(1),
    species: patientSpeciesSchema,
    breed: z.string().trim().min(1).optional(),
    birthDate: isoDateTimeSchema.optional(),
  })
  .strict();
export type CreateMobilePatientRequest = z.infer<
  typeof createMobilePatientRequestSchema
>;

export const moveAppointmentRequestSchema = z
  .object({
    beginAt: isoDateTimeSchema,
    endAt: isoDateTimeSchema,
  })
  .strict()
  .refine(
    (slot) => new Date(slot.endAt).getTime() > new Date(slot.beginAt).getTime(),
    { message: "La fin doit être postérieure au début." },
  );
export type MoveAppointmentRequest = z.infer<
  typeof moveAppointmentRequestSchema
>;

export const moveAppointmentConflictSchema = z
  .object({
    appointmentId: z.string().min(1),
    beginAt: isoDateTimeSchema,
    patientName: z.string().nullable(),
  })
  .strict();
export type MoveAppointmentConflict = z.infer<
  typeof moveAppointmentConflictSchema
>;

/**
 * Ce que le praticien saisit entre deux portes : l'animal, le créneau, et si
 * la visite a lieu à domicile. Tout le reste (motif, notes) attendra le
 * compte rendu que la séance fait naître.
 */
export const createAppointmentRequestSchema = z
  .object({
    patientId: z.string().min(1),
    beginAt: isoDateTimeSchema,
    endAt: isoDateTimeSchema,
    atHome: z.boolean(),
  })
  .strict()
  .refine(
    (slot) => new Date(slot.endAt).getTime() > new Date(slot.beginAt).getTime(),
    { message: "La fin doit être postérieure au début." },
  );
export type CreateAppointmentRequest = z.infer<
  typeof createAppointmentRequestSchema
>;

/**
 * La création et le déplacement aboutissent même en cas de chevauchement : le
 * serveur écrit, puis informe. Le praticien décide — la même règle que sur le
 * web. `reportId` porte le brouillon lié à la séance, créé avec elle ou
 * retrouvé lors d'un déplacement.
 */
export const appointmentWriteResponseSchema = z
  .object({
    appointmentId: z.string().min(1),
    reportId: z.string().min(1).nullable(),
    beginAt: isoDateTimeSchema,
    endAt: isoDateTimeSchema,
    conflicts: z.array(moveAppointmentConflictSchema),
  })
  .strict();
export type AppointmentWriteResponse = z.infer<
  typeof appointmentWriteResponseSchema
>;
