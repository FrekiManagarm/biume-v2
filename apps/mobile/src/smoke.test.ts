import { mobileRuntime } from './runtime';

describe('mobile runtime', () => {
  it('targets the capture alpha', () => {
    expect(mobileRuntime).toEqual({
      maxDurationMs: 600_000,
      maxBytes: 16 * 1024 * 1024,
      maxAutomaticFailures: 5,
      retentionMs: 24 * 60 * 60 * 1000,
    });
  });
});
