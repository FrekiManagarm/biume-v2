export type AppPhase = 'loading' | 'signed-out' | 'no-organization' | 'ready';

/** The only part of a Better Auth session that decides where the app goes. */
export type SessionLike = {
  session: { activeOrganizationId?: string | null };
} | null;

export type ResolvedSession = {
  phase: Exclude<AppPhase, 'loading'>;
  organizationId: string | null;
};

/**
 * The active organization is resolved once, here, and handed down. Screens and
 * workspace ports never read it from the session themselves, so nothing can
 * fall back to an empty tenant key.
 */
export function resolveSessionPhase(session: SessionLike): ResolvedSession {
  if (!session) return { phase: 'signed-out', organizationId: null };

  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) {
    return { phase: 'no-organization', organizationId: null };
  }

  return { phase: 'ready', organizationId };
}
