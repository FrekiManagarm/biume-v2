import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@biume/env/server";
import type { AudioObjectStore } from "./audio-object-store";
import { createR2AudioObjectStore } from "./r2-audio-object-store";

/**
 * Kept separate from the adapter so importing the adapter never requires R2
 * credentials. Only this module reads the environment.
 */
let cachedClient: S3Client | undefined;

export function getR2AudioObjectStore(): AudioObjectStore {
  cachedClient ??= new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });

  return createR2AudioObjectStore({
    client: cachedClient,
    bucket: env.R2_AUDIO_BUCKET,
    now: () => new Date(),
  });
}
