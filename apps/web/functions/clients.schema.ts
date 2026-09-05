import { z } from "zod";

const optionalText = z.string().trim().optional();

export const createClientSchema = z.object({
  name: z.string().trim().min(1),
  email: optionalText,
  phone: optionalText,
  address: optionalText,
  city: optionalText,
  zip: optionalText,
  country: optionalText,
});

export const updateClientSchema = createClientSchema.extend({
  id: z.string().trim().min(1),
});

export const deleteClientSchema = z.object({
  id: z.string().trim().min(1),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type DeleteClientInput = z.infer<typeof deleteClientSchema>;
