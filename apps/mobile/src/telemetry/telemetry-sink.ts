import type { ProductEvent } from '@biume/contracts/product-events';
import {
  createCaptureTelemetry,
  type CaptureTelemetry,
  type CaptureTelemetrySink,
} from './capture-events';

let transport: CaptureTelemetrySink | null = null;

/**
 * Installs the destination capture events are delivered to.
 *
 * This slice ships no analytics endpoint, so events are built, validated
 * against the shared contract, and dropped unless a transport is installed. The
 * validation is the point: whatever is plugged in later can only ever receive
 * payloads the contract already accepted.
 */
export function setCaptureTelemetryTransport(
  sink: CaptureTelemetrySink | null,
): void {
  transport = sink;
}

function deliver(event: ProductEvent): void {
  if (transport) {
    transport(event);
    return;
  }
  // Development only, and only ever schema-validated technical fields — no
  // name, note, signed URL, or audio can reach this line.
  if (__DEV__) console.log('[telemetry]', event.name, event.properties);
}

export const captureTelemetry: CaptureTelemetry =
  createCaptureTelemetry(deliver);
