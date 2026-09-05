import "server-only";

import { auth } from "@biume/auth";
import { headers } from "next/headers";
import { z } from "zod";

const switchOrganizationSchema = z.object({
  organizationId: z.string().min(1),
});

export type SwitchOrganizationInput = z.infer<typeof switchOrganizationSchema>;

export async function getSession() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  return session;
}

export async function ensureSession() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function getOrganizations() {
  const requestHeaders = await headers();
  const organizations = await auth.api.listOrganizations({
    headers: requestHeaders,
  });

  return organizations;
}

export async function getCurrentOrganization() {
  const requestHeaders = await headers();
  const organization = await auth.api.getFullOrganization({
    headers: requestHeaders,
  });

  if (!organization) {
    throw new Error("Unauthorized");
  }

  return organization;
}

export async function switchActiveOrganization(input: SwitchOrganizationInput) {
  const data = switchOrganizationSchema.parse(input);
  const requestHeaders = await headers();
  const organization = await auth.api.setActiveOrganization({
    headers: requestHeaders,
    body: {
      organizationId: data.organizationId,
    },
  });

  if (!organization) {
    throw new Error("Impossible d'activer cette organisation.");
  }

  return organization;
}
