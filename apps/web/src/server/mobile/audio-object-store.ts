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
 * The port intentionally offers no read or list capability: nothing in this
 * slice is allowed to hand out a durable URL to captured audio.
 */
export interface AudioObjectStore {
  createPutUrl(
    input: ExpectedAudioObject & {
      expiresInSeconds: typeof captureUploadUrlTtlSeconds;
    },
  ): Promise<SignedUpload>;
  head(key: string): Promise<StoredAudioObject | null>;
  delete(key: string): Promise<void>;
}
