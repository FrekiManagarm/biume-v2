import { productEventSchema } from '@biume/contracts/product-events';
import type { ProductEvent } from '@biume/contracts/product-events';
import type { LocalCaptureErrorCode } from '../capture/local-capture';

/**
 * The only capture events the mobile app is allowed to emit.
 */
export const captureEventNames = [
  'capture_started',
  'capture_completed',
  'capture_queued_offline',
  'capture_uploaded',
] as const;

export type CaptureEventName = (typeof captureEventNames)[number];

/**
 * A closed property set rather than an open record.
 *
 * Every field here is technical. There is deliberately no escape hatch for an
 * arbitrary payload: a free-form record is how a patient name or a signed URL
 * ends up in telemetry.
 */
export type CaptureEventProperties = {
  captureId: string;
  journeyType?: 'appointment' | 'free_capture';
  platform?: 'ios' | 'android';
  appVersion?: string;
  durationMs?: number;
  byteSize?: number;
  online?: boolean;
  errorCategory?: NonNullable<ProductEvent['properties']['errorCategory']>;
  source?: 'mobile_appointment' | 'mobile_free_capture';
};

/**
 * Returns `null` rather than throwing when the event does not satisfy the
 * shared contract, so a rejected event is dropped instead of interrupting the
 * capture flow that produced it.
 */
export function buildCaptureEvent(
  name: CaptureEventName,
  properties: CaptureEventProperties,
): ProductEvent | null {
  const parsed = productEventSchema.safeParse({ name, properties });
  return parsed.success ? parsed.data : null;
}

export type CaptureErrorCategory = NonNullable<
  ProductEvent['properties']['errorCategory']
>;

/**
 * Collapses the local error vocabulary into the few categories telemetry is
 * allowed to carry. The mapping is deliberately lossy: a category answers "what
 * kind of thing went wrong", never "what exactly happened to this capture".
 */
const errorCategories: Record<LocalCaptureErrorCode, CaptureErrorCategory> = {
  microphone_denied: 'permission_denied',
  network: 'network',
  local_storage_full: 'storage',
  local_file_missing: 'storage',
  storage_unavailable: 'storage',
  unauthorized: 'authorization',
  active_organization_required: 'authorization',
  forbidden: 'authorization',
  validation: 'validation',
  conflict: 'validation',
  not_found: 'validation',
  method_not_allowed: 'validation',
  expired: 'validation',
  rate_limited: 'upload',
  server_error: 'upload',
  object_incomplete: 'upload',
  upload_url_expired: 'upload',
  unknown: 'unknown',
};

export function errorCategoryFor(
  code: LocalCaptureErrorCode,
): CaptureErrorCategory {
  return errorCategories[code] ?? 'unknown';
}

export type CaptureTelemetrySink = (event: ProductEvent) => void;

export type CaptureTelemetry = {
  emit(name: CaptureEventName, properties: CaptureEventProperties): void;
};

export function createCaptureTelemetry(sink: CaptureTelemetrySink): CaptureTelemetry {
  return {
    emit(name: CaptureEventName, properties: CaptureEventProperties): void {
      const event = buildCaptureEvent(name, properties);
      if (!event) return;
      try {
        sink(event);
      } catch {
        // Telemetry is never allowed to break the capture it is describing.
      }
    },
  };
}
