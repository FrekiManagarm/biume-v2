import { z } from "zod";

export const createPatientSchema = z.object({
  name: z.string().trim().min(1),
  ownerId: z.string().trim().min(1),
  type: z.string().trim().min(1),
  breed: z.string().trim().min(1),
  gender: z.enum(["Male", "Female"]).default("Male"),
  birthDate: z.coerce.date(),
  weight: z.coerce.number().int().min(0),
  height: z.coerce.number().int().min(0),
  description: z.string().trim().optional(),
  chippedNumber: z.coerce.number().int().positive().optional(),
});

const updateDateSchema = z
  .union([z.date(), z.string().trim().min(1)])
  .pipe(z.coerce.date());

const updateNonNegativeIntegerSchema = z
  .union([z.number(), z.string().trim().min(1)])
  .pipe(z.coerce.number<string | number>().int().min(0));

const updateChippedNumberSchema = z
  .union([z.number(), z.string().trim().min(1)])
  .pipe(z.coerce.number<string | number>().int().positive())
  .nullable()
  .optional();

export const updatePatientSchema = createPatientSchema.extend({
  id: z.string().trim().min(1),
  birthDate: updateDateSchema,
  weight: updateNonNegativeIntegerSchema,
  height: updateNonNegativeIntegerSchema,
  chippedNumber: updateChippedNumberSchema,
});

export const deletePatientSchema = z.object({
  id: z.string().trim().min(1),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type DeletePatientInput = z.infer<typeof deletePatientSchema>;
