import { resolveSessionPhase } from './session-phase';

describe('resolving a session into a phase', () => {
  it('sends an absent session to sign-in', () => {
    expect(resolveSessionPhase(null)).toEqual({
      phase: 'signed-out',
      organizationId: null,
    });
  });

  it('asks for an organization before anything else', () => {
    expect(
      resolveSessionPhase({ session: { activeOrganizationId: null } }),
    ).toEqual({ phase: 'no-organization', organizationId: null });
  });

  it('treats an empty active organization as no organization', () => {
    expect(
      resolveSessionPhase({ session: { activeOrganizationId: '' } }),
    ).toEqual({ phase: 'no-organization', organizationId: null });
  });

  it('carries the active organization into the ready phase', () => {
    // The workspace keys its agenda cache on this: an empty value would let two
    // organizations share one cache entry.
    expect(
      resolveSessionPhase({ session: { activeOrganizationId: 'org-1' } }),
    ).toEqual({ phase: 'ready', organizationId: 'org-1' });
  });
});
