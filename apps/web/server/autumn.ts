import { auth } from "@biume/auth";
import { env } from "@biume/env/server";
import { autumnHandler } from "autumn-js/fetch";

export const autumnApiHandler = autumnHandler({
  secretKey: env.AUTUMN_SECRET_KEY,
  identify: async (request) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.session.activeOrganizationId) {
      return null;
    }

    const organization = await auth.api.getFullOrganization({
      headers: request.headers,
    });

    return {
      customerId: session.session.activeOrganizationId,
      customerData: {
        email: session.user.email,
        name: organization?.name ?? session.user.name,
        metadata: {
          organizationId: session.session.activeOrganizationId,
          ownerUserId: session.user.id,
        },
      },
    };
  },
});
