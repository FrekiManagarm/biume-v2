import type { SignedUpload } from './upload-client';
import { createUploadClient } from './upload-client';

const bytes = new Uint8Array([1, 2, 3, 4]);

const signed: SignedUpload = {
  url: 'https://bucket.r2.example.com/captures/abc/audio.m4a?signature=secret',
  headers: {
    'content-type': 'audio/mp4',
    'content-length': '4',
    'x-amz-meta-sha256': 'a'.repeat(64),
  },
};

function response(
  status: number,
  headers: Record<string, string> = {},
): Response {
  return new Response(null, { status, headers });
}

describe('signed upload', () => {
  it('sends exactly one PUT with the headers the server signed', async () => {
    const fetchImpl = jest.fn(async () => response(200, { ETag: '"etag-1"' }));
    const client = createUploadClient({ fetch: fetchImpl as never });

    const result = await client.put({ ...signed, bytes });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = (fetchImpl as jest.Mock).mock.calls[0];
    expect(url).toBe(signed.url);
    expect(init.method).toBe('PUT');
    expect(init.headers).toEqual(signed.headers);
    expect(init.body).toBe(bytes);
    expect(result.etag).toBe('"etag-1"');
  });

  it('reads the ETag whatever case the storage used', async () => {
    const fetchImpl = jest.fn(async () => response(200, { etag: '"lower"' }));
    const client = createUploadClient({ fetch: fetchImpl as never });

    expect((await client.put({ ...signed, bytes })).etag).toBe('"lower"');
  });

  it('refuses a success without an ETag to confirm', async () => {
    const fetchImpl = jest.fn(async () => response(200));
    const client = createUploadClient({ fetch: fetchImpl as never });

    await expect(client.put({ ...signed, bytes })).rejects.toMatchObject({
      code: 'object_incomplete',
      retryable: true,
    });
  });

  it('never follows a redirect to another origin', async () => {
    const fetchImpl = jest.fn(async () =>
      response(307, { location: 'https://evil.example.com/steal' }),
    );
    const client = createUploadClient({ fetch: fetchImpl as never });

    await expect(client.put({ ...signed, bytes })).rejects.toMatchObject({
      code: 'storage_unavailable',
    });
    const [, init] = (fetchImpl as jest.Mock).mock.calls[0];
    expect(init.redirect).toBe('manual');
  });

  it('treats an expired authorization as recoverable', async () => {
    const fetchImpl = jest.fn(async () => response(403));
    const client = createUploadClient({ fetch: fetchImpl as never });

    await expect(client.put({ ...signed, bytes })).rejects.toMatchObject({
      code: 'upload_url_expired',
      retryable: true,
    });
  });

  it.each([429, 500, 503])('retries after a %s', async (status) => {
    const fetchImpl = jest.fn(async () => response(status));
    const client = createUploadClient({ fetch: fetchImpl as never });

    await expect(client.put({ ...signed, bytes })).rejects.toMatchObject({
      retryable: true,
    });
  });

  it('maps a dropped connection to a retryable network failure', async () => {
    const fetchImpl = jest.fn(async () => {
      throw new TypeError('Network request failed');
    });
    const client = createUploadClient({ fetch: fetchImpl as never });

    await expect(client.put({ ...signed, bytes })).rejects.toMatchObject({
      code: 'network',
      retryable: true,
    });
  });

  it('never carries the signed URL or its headers into the error', async () => {
    const fetchImpl = jest.fn(async () => response(500));
    const client = createUploadClient({ fetch: fetchImpl as never });

    const error = await client
      .put({ ...signed, bytes })
      .then(() => null)
      .catch((caught: unknown) => caught as Error);

    const serialized = `${error?.name} ${error?.message} ${String(error?.stack)}`;
    expect(serialized).not.toContain('signature=secret');
    expect(serialized).not.toContain('x-amz-meta-sha256');
    expect(serialized).not.toContain('bucket.r2.example.com');
  });
});
