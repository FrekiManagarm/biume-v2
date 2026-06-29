import { z } from "zod";

// Type d'entité à importer
export const ImportEntityTypeEnum = z.enum(["clients", "pets", "both"]);

// Format de fichier supporté
export const ImportFileFormat = z.enum(["csv", "excel", "json"]);

// Schéma pour un client à importer (format simplifié)
export const ImportClientSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
});

// Schéma pour un animal à importer (format simplifié)
export const ImportPetSchema = z.object({
  name: z.string().min(1, "Le nom de l'animal est requis"),
  type: z.string().optional(), // ID de l'animal ou nom
  breed: z.string().min(1, "La race est requise"),
  weight: z.number().positive("Le poids doit être positif"),
  height: z.number().positive("La hauteur doit être positive"),
  description: z.string().optional(),
  gender: z.enum(["Male", "Female"]),
  birthDate: z.coerce.date(),
  chippedNumber: z.number().optional(),
  nacType: z.string().optional(),
  deseases: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  intolerences: z.array(z.string()).optional(),
  // Référence au propriétaire
  ownerEmail: z.string().email().optional(), // Si importation liée
  ownerName: z.string().optional(), // Si importation liée
});

// Schéma pour import combiné (client + animaux)
export const ImportCombinedSchema = z.object({
  client: ImportClientSchema,
  pets: z.array(ImportPetSchema).optional().default([]),
});

// Résultat d'import
export const ImportResultSchema = z.object({
  success: z.boolean(),
  imported: z.number(),
  failed: z.number(),
  errors: z.array(
    z.object({
      row: z.number(),
      field: z.string().optional(),
      message: z.string(),
    })
  ),
  data: z.object({
    clients: z.number(),
    pets: z.number(),
  }),
});

// Schéma pour la requête d'import
export const ImportRequestSchema = z.object({
  entityType: ImportEntityTypeEnum,
  format: ImportFileFormat,
  data: z.array(z.record(z.string(), z.any())), // Données brutes du fichier
});

export type ImportEntityType = z.infer<typeof ImportEntityTypeEnum>;
export type ImportFileFormat = z.infer<typeof ImportFileFormat>;
export type ImportClient = z.infer<typeof ImportClientSchema>;
export type ImportPet = z.infer<typeof ImportPetSchema>;
export type ImportCombined = z.infer<typeof ImportCombinedSchema>;
export type ImportResult = z.infer<typeof ImportResultSchema>;
export type ImportRequest = z.infer<typeof ImportRequestSchema>;

