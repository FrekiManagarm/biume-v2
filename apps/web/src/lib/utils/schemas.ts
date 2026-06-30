import { z } from "zod";
import { CreatePetSchema } from "@biume/db/schema/index";

export const createReportSchema = z.object({
  title: z.string().optional(),
  petId: z.string().optional(),
  appointmentId: z.string().optional(),
  consultationReason: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["draft", "finalized", "sent"]).optional().default("draft"),
});

export const reportSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  petId: z.string().optional(),
  appointmentId: z.string().optional(),
  consultationReason: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["draft", "finalized", "sent"]).optional().default("draft"),
  observations: z
    .array(
      z.object({
        id: z.string(),
        region: z.string(),
        severity: z.number().min(1).max(5),
        notes: z.string(),
        type: z.enum(["static", "dynamic", "diagnosticExclusion", "none"]),
        dysfunctionType: z.string().optional(),
        interventionZone: z.string().optional(),
        laterality: z.enum(["left", "right", "bilateral"]),
        anatomicalPart: z
          .object({
            id: z.string(),
            name: z.string(),
            zone: z.string(),
            animalType: z.string(),
          })
          .optional(),
      }),
    )
    .optional()
    .default([]),
  anatomicalIssues: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum(["dysfunction", "anatomicalSuspicion"]),
        region: z.string(),
        severity: z.number().min(1).max(5),
        notes: z.string(),
        interventionZone: z.string().optional(),
        laterality: z.enum(["left", "right", "bilateral"]),
        anatomicalPart: z
          .object({
            id: z.string(),
            name: z.string(),
            zone: z.string(),
            animalType: z.string(),
          })
          .optional(),
      }),
    )
    .optional()
    .default([]),
  recommendations: z
    .array(
      z.object({
        id: z.string(),
        content: z.string(),
      }),
    )
    .optional()
    .default([]),
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
