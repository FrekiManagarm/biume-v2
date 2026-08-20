import { authClient } from './auth-client';

/**
 * The only place that reads the Better Auth cookie. It is handed to the API
 * client as an opaque string and never logged.
 */
export function getSessionCookie(): string | null {
  const cookie = authClient.getCookie();
  return cookie.length > 0 ? cookie : null;
}

export async function signInWithEmail(input: {
  email: string;
  password: string;
}) {
  const { error } = await authClient.signIn.email({
    email: input.email,
    password: input.password,
  });
  // The message is surfaced by the screen; nothing about it is logged.
  if (error) throw new Error(error.message ?? 'Connexion impossible.');
}

export async function signOut() {
  await authClient.signOut();
}

export async function refreshSession() {
  const { data } = await authClient.getSession();
  return data ?? null;
}

type ActionResult<T> = { data: T | null; error: { message?: string } | null };

/**
 * Better Auth exposes organization endpoints as runtime proxies whose types are
 * inferred from the server plugin. That inference is degraded by the Expo
 * plugin's upstream typing defect (see `auth-client.ts`), so the two endpoints
 * this app uses are declared explicitly here rather than left untyped.
 *
 * The shape below mirrors `/organization/list` and `/organization/set-active`.
 * If it ever drifts from the server, the API client's contract validation is
 * what catches it — nothing here is trusted blindly.
 */
type OrganizationActions = {
  list(): Promise<ActionResult<Array<{ id: string; name: string }>>>;
  setActive(input: {
    organizationId: string;
  }): Promise<ActionResult<{ id: string }>>;
};

function organizationActions(): OrganizationActions {
  return (authClient as unknown as { organization: OrganizationActions })
    .organization;
}

export async function listOrganizations() {
  const { data, error } = await organizationActions().list();
  if (error) throw new Error(error.message ?? 'Entreprises indisponibles.');
  return data ?? [];
}

export async function setActiveOrganization(organizationId: string) {
  const { error } = await organizationActions().setActive({ organizationId });
  if (error) {
    throw new Error(error.message ?? 'Entreprise active non modifiée.');
  }
}
