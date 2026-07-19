import { z } from "zod";
import { CreatePetSchema } from "@biume/db/schema/index";
import {
  createReportSchema,
  quickReportSchema,
  reportSchema,
  reportSectionStatesSchema,
} from "@biume/contracts/report";

export { createReportSchema, quickReportSchema, reportSchema };

export const updateReportSchema = reportSchema.safeExtend({
  reportId: z.string(),
  sectionStates: reportSectionStatesSchema,
});

export const anatomicalIssueSchema = z.object({
  animalType: z.enum(["DOG", "CAT", "HORSE"]),
  zone: z.enum(["articulation", "fascias", "organes", "muscles"]),
});

export const contactSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("L'email est requis"),
  subject: z.string().min(1, "Le sujet est requis"),
  message: z.string().min(1, "Le message est requis"),
});

export const clientSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  phoneNumber: z.string().min(10, {
    message: "Le numéro de téléphone doit contenir au moins 10 chiffres.",
  }),
  city: z.string().min(2, {
    message: "La ville doit contenir au moins 2 caractères.",
  }),
  country: z.string().min(2, {
    message: "Le pays doit contenir au moins 2 caractères.",
  }),
  pets: z.array(CreatePetSchema).default([]),
});

export type ContactSchema = z.infer<typeof contactSchema>;
export type ClientSchema = z.infer<typeof clientSchema>;
