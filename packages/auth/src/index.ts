import { createDb } from "@biume/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@biume/db/schema/index";
import { env } from "@biume/env/server";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { expo } from "@better-auth/expo";
import { autumn } from "autumn-js/better-auth";
import { organization } from "better-auth/plugins";
import { ac, admin, member, owner } from "./roles";
import { resolveTrustedOrigins } from "./trusted-origins";

export function createAuth() {
  const db = createDb();

  return betterAuth({
    appName: "Biume",
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: schema,
    }),
    trustedOrigins: resolveTrustedOrigins({
      corsOrigin: env.CORS_ORIGIN,
      mobileTrustedOrigins: env.MOBILE_TRUSTED_ORIGINS,
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google"],
      },
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async () => {},
    },
    advanced: {
      useSecureCookies: env.NODE_ENV === "production",
    },
    user: {
      additionalFields: {
        image: {
          type: "string",
          defaultValue: "",
          required: false,
        },
        phoneNumber: {
          type: "string",
          defaultValue: "",
          required: false,
        },
        lang: {
          type: "string",
          defaultValue: "fr",
          required: false,
        },
        smsNotifications: {
          type: "boolean",
          defaultValue: false,
          required: false,
        },
        emailNotifications: {
          type: "boolean",
          defaultValue: false,
          required: false,
        },
      },
    },
    plugins: [
      tanstackStartCookies(),
      expo(),
      autumn(
        env.AUTUMN_SECRET_KEY
          ? { secretKey: env.AUTUMN_SECRET_KEY, customerScope: "organization" }
          : { customerScope: "organization" },
      ),
      organization({
        ac: ac,
        roles: {
          member,
          admin,
          owner,
        },
      }),
    ],
  });
}

export const auth = createAuth();

export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;
export type AuthOrganization = typeof auth.$Infer.Organization;
export type AuthActiveOrganization = typeof auth.$Infer.ActiveOrganization;
