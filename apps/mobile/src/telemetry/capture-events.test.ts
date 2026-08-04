import { buildCaptureEvent, createCaptureTelemetry } from './capture-events';

const base = {
  captureId: 'capture-1',
  journeyType: 'appointment' as const,
  platform: 'ios' as const,
  appVersion: '0.1.0',
};

describe('event shape', () => {
  it('builds a lifecycle event the shared contract accepts', () => {
    expect(buildCaptureEvent('capture_uploaded', base)).toEqual({
      name: 'capture_uploaded',
      properties: {
        captureId: 'capture-1',
        journeyType: 'appointment',
        platform: 'ios',
        appVersion: '0.1.0',
      },
    });
  });

  it('carries the technical measurements the plan asks for', () => {
    const event = buildCaptureEvent('capture_completed', {
      ...base,
      durationMs: 120_000,
      byteSize: 1_048_576,
    });

    expect(event?.properties.durationMs).toBe(120_000);
    expect(event?.properties.byteSize).toBe(1_048_576);
  });

  it('carries a normalized failure code', () => {
    const event = buildCaptureEvent('capture_queued_offline', {
      ...base,
      errorCategory: 'network',
    });

    expect(event?.properties.errorCategory).toBe('network');
  });

  it('refuses an app version that is not a version', () => {
    expect(
      buildCaptureEvent('capture_started', { ...base, appVersion: 'Nala' }),
    ).toBeNull();
  });

  it('refuses an unknown platform', () => {
    expect(
      buildCaptureEvent('capture_started', {
        ...base,
        platform: 'windows' as never,
      }),
    ).toBeNull();
  });
});

describe('what may never be emitted', () => {
  it.each([
    ['email', { email: 'camille@example.com' }],
    ['patientName', { patientName: 'Nala' }],
    ['animalName', { animalName: 'Nala' }],
    ['appointmentNote', { appointmentNote: 'Boiterie' }],
    ['signedUrl', { signedUrl: 'https://storage.example.com/x?sig=y' }],
    ['cookie', { cookie: 'better-auth.session=abc' }],
    ['audio', { audio: 'AAAA' }],
    ['message', { message: 'anything' }],
  ])('rejects %s', (_label, extra) => {
    expect(
      buildCaptureEvent('capture_uploaded', {
        ...base,
        ...(extra as unknown as Record<string, never>),
      }),
    ).toBeNull();
  });
});

describe('emission', () => {
  it('sends only events that validated', () => {
    const sink = jest.fn();
    const telemetry = createCaptureTelemetry(sink);

    telemetry.emit('capture_uploaded', base);

    expect(sink).toHaveBeenCalledWith({
      name: 'capture_uploaded',
      properties: base,
    });
  });

  it('drops an invalid event instead of sending it', () => {
    const sink = jest.fn();
    const telemetry = createCaptureTelemetry(sink);

    telemetry.emit('capture_uploaded', {
      ...base,
      patientName: 'Nala',
    } as never);

    expect(sink).not.toHaveBeenCalled();
  });

  it('never lets a failing sink break the caller', () => {
    const telemetry = createCaptureTelemetry(() => {
      throw new Error('sink down');
    });

    expect(() => telemetry.emit('capture_started', base)).not.toThrow();
  });
});
