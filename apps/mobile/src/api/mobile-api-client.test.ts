import {
  MobileApiClientError,
  createMobileApiClient,
} from './mobile-api-client';

const captureId = '6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70';
const sha256 = 'a'.repeat(64);

const captureResponse = {
  id: captureId,
  organizationId: 'org-1',
  practitionerId: 'user-1',
  appointmentId: null,
  patientId: null,
  reportId: null,
  durationMs: 120_000,
  mimeType: 'audio/mp4',
  byteSize: 1_048_576,
  sha256,
  objectKey: `captures/9f86d081884c7d65/${captureId}/audio.m4a`,
  objectEtag: null,
  status: 'pending_upload',
  attemptCount: 0,
  lastErrorCode: null,
  createdAt: '2026-07-19T10:00:00.000Z',
  uploadedAt: null,
  expiresAt: '2026-07-20T10:00:00.000Z',
  purgedAt: null,
};

const createRequest = {
  id: captureId,
  appointmentId: null,
  durationMs: 120_000,
  mimeType: 'audio/mp4' as const,
  byteSize: 1_048_576,
  sha256,
  createdAt: '2026-07-19T09:59:00.000Z',
};

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function createClient(
  fetchImpl: typeof fetch,
  overrides: { timeoutMs?: number; cookie?: string | null } = {},
) {
  return createMobileApiClient({
    baseUrl: 'https://app.biume.test',
    fetch: fetchImpl,
    // `??` would swallow an explicit null, which is exactly the case under test.
    getCookie: () =>
      'cookie' in overrides ? overrides.cookie! : 'better-auth.session=abc',
    timeoutMs: overrides.timeoutMs ?? 10_000,
  });
}

describe('successful calls', () => {
  it('creates a capture and returns the parsed contract', async () => {
    const fetchImpl = jest.fn(async () => jsonResponse(201, captureResponse));
    const client = createClient(fetchImpl as never);

    const created = await client.createCapture(createRequest);

    expect(created.id).toBe(captureId);
    const [url, init] = (fetchImpl as jest.Mock).mock.calls[0];
    expect(url).toBe('https://app.biume.test/api/mobile/v1/captures');
    expect(init.method).toBe('POST');
  });

  it('sends the Better Auth cookie on every call', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse(200, { items: [], nextCursor: null }),
    );
    const client = createClient(fetchImpl as never);

    await client.listCaptures({ limit: 20, cursor: null });

    const [, init] = (fetchImpl as jest.Mock).mock.calls[0];
    expect(init.headers.cookie).toBe('better-auth.session=abc');
  });

  it('omits the cookie header when there is no session', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse(200, {
        userId: 'user-1',
        organization: null,
        canUploadCaptures: false,
      }),
    );
    const client = createClient(fetchImpl as never, { cookie: null });

    await client.getSession();

    const [, init] = (fetchImpl as jest.Mock).mock.calls[0];
    expect(init.headers.cookie).toBeUndefined();
  });

  it('cancels a capture without expecting a body', async () => {
    const fetchImpl = jest.fn(async () => new Response(null, { status: 204 }));
    const client = createClient(fetchImpl as never);

    await expect(client.cancelCapture(captureId)).resolves.toBeUndefined();
  });
});

describe('response validation', () => {
  it('refuses a body that is not JSON', async () => {
    const fetchImpl = jest.fn(
      async () => new Response('<html>gateway</html>', { status: 200 }),
    );
    const client = createClient(fetchImpl as never);

    await expect(client.createCapture(createRequest)).rejects.toMatchObject({
      code: 'validation',
      retryable: false,
    });
  });

  it('refuses a body that does not match the contract', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse(201, { ...captureResponse, status: 'teleported' }),
    );
    const client = createClient(fetchImpl as never);

    await expect(client.createCapture(createRequest)).rejects.toMatchObject({
      code: 'validation',
    });
  });
});

describe('error mapping', () => {
  it('treats an expired session as a manual step, never a retry', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse(401, {
        code: 'unauthorized',
        message: 'Session expirée',
        retryable: false,
      }),
    );
    const client = createClient(fetchImpl as never);

    await expect(client.listCaptures({ limit: 20, cursor: null })).rejects.toMatchObject(
      { code: 'unauthorized', retryable: false },
    );
  });

  it('treats an identity conflict as non-retryable', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse(409, {
        code: 'conflict',
        message: 'Conflit',
        retryable: false,
      }),
    );
    const client = createClient(fetchImpl as never);

    await expect(client.createCapture(createRequest)).rejects.toMatchObject({
      code: 'conflict',
      retryable: false,
    });
  });

  it('treats rate limiting as retryable', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse(429, {
        code: 'rate_limited',
        message: 'Trop de requêtes',
        retryable: true,
      }),
    );
    const client = createClient(fetchImpl as never);

    await expect(client.createCapture(createRequest)).rejects.toMatchObject({
      code: 'rate_limited',
      retryable: true,
    });
  });

  it('treats a server failure as retryable', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse(500, {
        code: 'server_error',
        message: 'Erreur interne',
        retryable: true,
      }),
    );
    const client = createClient(fetchImpl as never);

    await expect(client.createCapture(createRequest)).rejects.toMatchObject({
      code: 'server_error',
      retryable: true,
    });
  });

  it('falls back to a normalized code when the error body is unusable', async () => {
    const fetchImpl = jest.fn(
      async () => new Response('upstream exploded', { status: 502 }),
    );
    const client = createClient(fetchImpl as never);

    await expect(client.createCapture(createRequest)).rejects.toMatchObject({
      code: 'server_error',
      retryable: true,
    });
  });
});

describe('transport failures', () => {
  it('gives up after the timeout and stays retryable', async () => {
    const fetchImpl = jest.fn(
      (_url: string, init: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener('abort', () => {
            reject(
              Object.assign(new Error('Aborted'), { name: 'AbortError' }),
            );
          });
        }),
    );
    const client = createClient(fetchImpl as never, { timeoutMs: 5 });

    await expect(client.createCapture(createRequest)).rejects.toMatchObject({
      code: 'network',
      retryable: true,
    });
  });

  it('maps an offline device to a retryable network failure', async () => {
    const fetchImpl = jest.fn(async () => {
      throw new TypeError('Network request failed');
    });
    const client = createClient(fetchImpl as never);

    await expect(client.createCapture(createRequest)).rejects.toMatchObject({
      code: 'network',
      retryable: true,
    });
  });
});

describe('confidentiality', () => {
  it('never puts a body, a cookie, or a URL in the error it raises', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse(500, {
        code: 'server_error',
        message: 'camille@example.com a échoué',
        retryable: true,
      }),
    );
    const client = createClient(fetchImpl as never);

    const error: unknown = await client
      .createCapture(createRequest)
      .then(() => null)
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(MobileApiClientError);
    const raised = error as MobileApiClientError;
    const serialized = `${raised.name} ${raised.message} ${String(raised.stack)}`;
    expect(serialized).not.toContain('camille@example.com');
    expect(serialized).not.toContain('better-auth.session');
    expect(serialized).not.toContain('app.biume.test');
  });
});
