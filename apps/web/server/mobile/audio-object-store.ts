import type {
  captureMimeType,
  captureUploadUrlTtlSeconds,
} from "@biume/contracts/capture";

export type ExpectedAudioObject = {
  key: string;
  contentType: typeof captureMimeType;
  byteSize: number;
  sha256: string;
};

export type SignedUpload = {
  url: string;
  headers: Record<string, string>;
  expiresAt: Date;
};

export type StoredAudioObject = {
  etag: string;
  contentType: string | undefined;
  byteSize: number | undefined;
  metadata: Record<string, string>;
};

/**
 * The capture domain depends on this port, never on a concrete storage SDK, so
 * the bucket implementation can be replaced without touching capture rules.
 *
 * Le port permet de lire les octets côté serveur — la transcription en dépend —
 * mais toujours pas de distribuer une URL durable vers un audio de séance. La
 * seule URL jamais émise est celle du téléversement, signée et valable dix
 * minutes.
 */
export interface AudioObjectStore {
  createPutUrl(
    input: ExpectedAudioObject & {
      expiresInSeconds: typeof captureUploadUrlTtlSeconds;
    },
  ): Promise<SignedUpload>;
  head(key: string): Promise<StoredAudioObject | null>;
  /** `null` si l'objet a déjà été purgé : ce n'est pas une erreur. */
  getBytes(key: string): Promise<Uint8Array | null>;
  delete(key: string): Promise<void>;
}
