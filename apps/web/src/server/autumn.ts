import { auth } from "@biume/auth";
import { env } from "@biume/env/server";
import { autumnHandler } from "autumn-js/fetch";

export const autumnApiHandler = autumnHandler({
  secretKey: env.AUTUMN_SECRET_KEY,
  identify: async (request) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return null;
    }

    return {
      customerId: session.user.id,
      customerData: {
        email: session.user.email,
        name: session.user.name,
      },
    };
  },
});
