import type { LocalCaptureErrorCode } from '../capture/local-capture';

/**
 * Carries a normalized code and nothing else, so a signed URL, its headers, or
 * a response body can never reach a log through a thrown error.
 */
export class UploadError extends Error {
  readonly code: LocalCaptureErrorCode;
  readonly retryable: boolean;

  constructor(code: LocalCaptureErrorCode, retryable: boolean) {
    super(`upload_error:${code}`);
    this.name = 'UploadError';
    this.code = code;
    this.retryable = retryable;
  }
}
