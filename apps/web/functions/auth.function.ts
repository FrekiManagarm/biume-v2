import { auth } from "@biume/auth";
import { createServerFn } from "@tanstack/react-start";
import { headers } from "next/headers";
import { z } from "zod";

const switchOrganizationSchema = z.object({
  organizationId: z.string().min(1),
});

export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({ headers: requestHeaders });

    return session;
  },
);

export const ensureSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (!session) {
      throw new Error("Unauthorized");
    }

    return session;
  },
);

export const getOrganizations = createServerFn({ method: "GET" }).handler(
  async () => {
    const requestHeaders = await headers();
    const organizations = await auth.api.listOrganizations({ headers: requestHeaders });

    return organizations;
  },
);

export const getCurrentOrganization = createServerFn({ method: "GET" }).handler(
  async () => {
    const requestHeaders = await headers();
    const organization = await auth.api.getFullOrganization({ headers: requestHeaders });

    if (!organization) {
      throw new Error("Unauthorized");
    }

    return organization;
  },
);

export const switchActiveOrganization = createServerFn({ method: "POST" })
  .validator(switchOrganizationSchema)
  .handler(async ({ data }) => {
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
  });
