import { db } from "@biume/db";
import { organization as organizationSchema } from "@biume/db/schema/index";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getCurrentOrganization } from "#/functions/auth.function";

export const updateOrganizationSchema = z.object({
  name: z.string().min(1, "Le nom de l'organisation est requis.").max(120),
  slug: z.string().min(1, "Le slug est requis.").max(140),
  email: z.union([z.email("L'email de contact est invalide."), z.literal("")]),
  description: z.string().max(1200),
  lang: z.enum(["fr", "en"]),
  ai: z.boolean(),
  logo: z.union([z.url("L'URL du logo est invalide."), z.literal("")]),
});

export const getOrganizationSettings = createServerFn({
  method: "GET",
}).handler(async () => {
  const organization = await getCurrentOrganization();
  const settings = await db.query.organization.findFirst({
    where: eq(organizationSchema.id, organization.id),
  });

  if (!settings) {
    throw new Error("Organisation introuvable.");
  }

  return settings;
});

export const updateOrganization = createServerFn({ method: "POST" })
  .validator(updateOrganizationSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();

    const [updatedOrganization] = await db
      .update(organizationSchema)
      .set({
        name: data.name.trim(),
        slug: data.slug.trim(),
        email: data.email?.trim() || null,
        description: data.description?.trim() || null,
        lang: data.lang,
        ai: data.ai,
        logo: data.logo?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(organizationSchema.id, organization.id))
      .returning();

    if (!updatedOrganization) {
      throw new Error("Impossible de mettre à jour l'organisation.");
    }

    return updatedOrganization;
  });
