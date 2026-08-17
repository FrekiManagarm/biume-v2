import { UploadError } from './upload-error';

export type SignedUpload = {
  url: string;
  headers: Record<string, string>;
};

export type UploadClientOptions = {
  fetch: typeof fetch;
  timeoutMs?: number;
};

const defaultTimeoutMs = 120_000;

/**
 * Sends the encrypted bytes straight to the object store.
 *
 * The client is deliberately dumb: it accepts only the URL and headers the
 * server signed, adds nothing, and follows no redirect. Following one would
 * replay a signed request — and its body — against an origin the server never
 * authorized.
 */
export function createUploadClient(options: UploadClientOptions) {
  const timeoutMs = options.timeoutMs ?? defaultTimeoutMs;

  return {
    async put(input: SignedUpload & { bytes: Uint8Array }) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      let response: Response;
      try {
        response = await options.fetch(input.url, {
          method: 'PUT',
          headers: input.headers,
          // React Native's fetch accepts a typed array; the DOM lib types do not
          // describe that overload.
          body: input.bytes as unknown as BodyInit,
          redirect: 'manual',
          signal: controller.signal,
        });
      } catch {
        throw new UploadError('network', true);
      } finally {
        clearTimeout(timer);
      }

      if (response.status >= 300 && response.status < 400) {
        throw new UploadError('storage_unavailable', false);
      }
      if (response.status === 403 || response.status === 401) {
        // A signed URL that expired mid-flight: the capture is fine, the
        // authorization simply has to be renewed.
        throw new UploadError('upload_url_expired', true);
      }
      if (!response.ok) {
        const retryable = response.status === 429 || response.status >= 500;
        throw new UploadError(
          retryable ? 'server_error' : 'storage_unavailable',
          retryable,
        );
      }

      const etag = response.headers.get('etag');
      if (!etag) {
        // Without an ETag the server cannot confirm the object, so the upload
        // is treated as incomplete rather than optimistically accepted.
        throw new UploadError('object_incomplete', true);
      }

      return { etag };
    },
  };
}

export type UploadClient = ReturnType<typeof createUploadClient>;
