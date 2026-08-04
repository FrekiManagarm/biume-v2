import { captureMimeType } from "@biume/contracts/capture";
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { AudioObjectStore } from "./audio-object-store";

export type R2AudioObjectStoreOptions = {
  client: S3Client;
  bucket: string;
  now: () => Date;
};

/**
 * Errors that mean "the object is not there", which both `head` and `delete`
 * treat as an ordinary outcome rather than a failure.
 */
const missingObjectErrors = new Set([
  "NotFound",
  "NoSuchKey",
  "NoSuchBucket",
]);

function isMissingObject(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const name = (error as { name?: string }).name;
  const statusCode = (
    error as { $metadata?: { httpStatusCode?: number } }
  ).$metadata?.httpStatusCode;
  return (name !== undefined && missingObjectErrors.has(name)) || statusCode === 404;
}

export function createR2AudioObjectStore(
  options: R2AudioObjectStoreOptions,
): AudioObjectStore {
  const { client, bucket, now } = options;

  return {
    async createPutUrl(input) {
      // One command, one object, one operation. No ACL and no read grant: the
      // bucket stays private and this URL cannot be turned into a download.
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: input.key,
        ContentType: captureMimeType,
        ContentLength: input.byteSize,
        Metadata: { sha256: input.sha256 },
      });

      const url = await getSignedUrl(client, command, {
        expiresIn: input.expiresInSeconds,
      });

      return {
        url,
        headers: {
          "content-type": captureMimeType,
          "content-length": String(input.byteSize),
          "x-amz-meta-sha256": input.sha256,
        },
        expiresAt: new Date(now().getTime() + input.expiresInSeconds * 1000),
      };
    },

    async head(key) {
      try {
        const response = await client.send(
          new HeadObjectCommand({ Bucket: bucket, Key: key }),
        );
        return {
          etag: response.ETag ?? "",
          contentType: response.ContentType,
          byteSize: response.ContentLength,
          metadata: response.Metadata ?? {},
        };
      } catch (error) {
        if (isMissingObject(error)) return null;
        throw error;
      }
    },

    async delete(key) {
      try {
        await client.send(
          new DeleteObjectCommand({ Bucket: bucket, Key: key }),
        );
      } catch (error) {
        if (isMissingObject(error)) return;
        throw error;
      }
    },
  };
}
