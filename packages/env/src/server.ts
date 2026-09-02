import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string(),
    CORS_ORIGIN: z.string(),
    AUTUMN_SECRET_KEY: z.string(),
    OPENAI_API_KEY: z.string(),
    RESEND_API_KEY: z.string(),
    APP_URL: z.string(),
    ENCRYPTION_KEY: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    UPLOADTHING_TOKEN: z.string(),
    R2_ACCOUNT_ID: z.string().min(1),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
    R2_AUDIO_BUCKET: z.string().min(1),
    MOBILE_TRUSTED_ORIGINS: z.string().default("biume://"),
    NODE_ENV: z.string(),
    // Rallume le paywall d'abonnement en développement, où il est neutralisé
    // par défaut (voir `isBillingGateEnabled`).
    BILLING_GATE_IN_DEV: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
