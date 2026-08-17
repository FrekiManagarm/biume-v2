import {
  captureResponseSchema,
  mobileApiErrorSchema,
  mobileAppointmentsResponseSchema,
  mobileCapturesResponseSchema,
  mobileSessionResponseSchema,
  uploadSessionResponseSchema,
  type CaptureErrorCode,
  type CaptureResponse,
  type CompleteCaptureRequest,
  type CreateCaptureRequest,
  type MobileAppointmentsResponse,
  type MobileCapturesResponse,
  type MobileSessionResponse,
  type UploadSessionResponse,
} from '@biume/contracts/capture';
import type { z } from 'zod';

const apiBasePath = '/api/mobile/v1';
const defaultTimeoutMs = 20_000;

export type MobileApiClientOptions = {
  baseUrl: string;
  fetch: typeof fetch;
  getCookie: () => string | null;
  timeoutMs?: number;
};

/**
 * Carries a normalized code and nothing else. The message is a fixed label, so
 * a response body, a signed URL, a cookie, or a host name can never reach a log
 * through a thrown error.
 */
export class MobileApiClientError extends Error {
  readonly code: CaptureErrorCode;
  readonly retryable: boolean;

  constructor(code: CaptureErrorCode, retryable: boolean) {
    super(`mobile_api_error:${code}`);
    this.name = 'MobileApiClientError';
    this.code = code;
    this.retryable = retryable;
  }
}

const retryableCodes = new Set<CaptureErrorCode>([
  'network',
  'rate_limited',
  'server_error',
  'storage_unavailable',
  'object_incomplete',
]);

function codeForStatus(status: number): CaptureErrorCode {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 405) return 'method_not_allowed';
  if (status === 409) return 'conflict';
  if (status === 410) return 'expired';
  if (status === 429) return 'rate_limited';
  if (status >= 500) return 'server_error';
  return 'validation';
}

type RequestInput = {
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  query?: Record<string, string | number | null | undefined>;
  body?: unknown;
};

export function createMobileApiClient(options: MobileApiClientOptions) {
  const timeoutMs = options.timeoutMs ?? defaultTimeoutMs;

  async function send(input: RequestInput): Promise<Response> {
    const url = new URL(`${apiBasePath}${input.path}`, options.baseUrl);
    for (const [key, value] of Object.entries(input.query ?? {})) {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    const cookie = options.getCookie();
    const headers: Record<string, string> = {};
    if (cookie) headers.cookie = cookie;
    if (input.body !== undefined) headers['content-type'] = 'application/json';

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await options.fetch(url.toString(), {
        method: input.method,
        headers,
        signal: controller.signal,
        ...(input.body === undefined
          ? {}
          : { body: JSON.stringify(input.body) }),
      });
    } catch {
      // Every transport failure — offline, DNS, TLS, timeout — is the same
      // thing to the queue: try again later.
      throw new MobileApiClientError('network', true);
    } finally {
      clearTimeout(timer);
    }
  }

  async function failureFor(response: Response): Promise<MobileApiClientError> {
    const fallback = codeForStatus(response.status);
    try {
      const parsed = mobileApiErrorSchema.safeParse(await response.json());
      if (parsed.success) {
        return new MobileApiClientError(parsed.data.code, parsed.data.retryable);
      }
    } catch {
      // An unparseable error body tells us nothing beyond the status code.
    }
    return new MobileApiClientError(fallback, retryableCodes.has(fallback));
  }

  async function call<T>(
    input: RequestInput,
    schema: z.ZodType<T>,
  ): Promise<T> {
    const response = await send(input);
    if (!response.ok) throw await failureFor(response);

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new MobileApiClientError('validation', false);
    }

    const parsed = schema.safeParse(payload);
    if (!parsed.success) throw new MobileApiClientError('validation', false);
    return parsed.data;
  }

  return {
    getSession(): Promise<MobileSessionResponse> {
      return call({ method: 'GET', path: '/session' }, mobileSessionResponseSchema);
    },

    listAppointments(query: {
      from?: string;
      to?: string;
      limit?: number;
      cursor?: string | null;
    }): Promise<MobileAppointmentsResponse> {
      return call(
        { method: 'GET', path: '/appointments', query },
        mobileAppointmentsResponseSchema,
      );
    },

    listCaptures(query: {
      limit?: number;
      cursor?: string | null;
    }): Promise<MobileCapturesResponse> {
      return call(
        { method: 'GET', path: '/captures', query },
        mobileCapturesResponseSchema,
      );
    },

    createCapture(request: CreateCaptureRequest): Promise<CaptureResponse> {
      return call(
        { method: 'POST', path: '/captures', body: request },
        captureResponseSchema,
      );
    },

    createUploadSession(captureId: string): Promise<UploadSessionResponse> {
      return call(
        { method: 'POST', path: `/captures/${captureId}/upload-session` },
        uploadSessionResponseSchema,
      );
    },

    completeCapture(
      captureId: string,
      request: CompleteCaptureRequest,
    ): Promise<CaptureResponse> {
      return call(
        {
          method: 'POST',
          path: `/captures/${captureId}/complete`,
          body: request,
        },
        captureResponseSchema,
      );
    },

    async cancelCapture(captureId: string): Promise<void> {
      const response = await send({
        method: 'DELETE',
        path: `/captures/${captureId}`,
      });
      if (!response.ok) throw await failureFor(response);
    },
  };
}

export type MobileApiClient = ReturnType<typeof createMobileApiClient>;
