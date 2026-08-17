import { expoClient } from '@better-auth/expo/client';
import type { BetterAuthClientPlugin } from 'better-auth/client';
import { organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';

const baseURL = process.env.EXPO_PUBLIC_API_URL;

if (!baseURL) {
  throw new Error(
    'EXPO_PUBLIC_API_URL est requis pour joindre l’API Biume depuis le mobile.',
  );
}

const rawExpoPlugin = expoClient({
  scheme: 'biume',
  storagePrefix: 'biume',
  storage: SecureStore,
});

/**
 * Intersected rather than widened.
 *
 * `@better-auth/expo@1.6.25` publishes a `getActions` signature that does not
 * structurally satisfy `BetterAuthClientPlugin` in `better-auth@1.6.25`: it
 * declares `BetterFetch<CreateFetchOption, …>` where the interface expects a
 * bare `BetterFetch`, and takes two parameters where three are declared. This
 * is an upstream typing defect, not a version skew — it reproduces with both
 * packages pinned to the same version and a single `better-auth` in the graph.
 *
 * Casting to `BetterAuthClientPlugin`, or suppressing with `@ts-expect-error`,
 * collapses inference across the whole plugins array and silently removes
 * `organization.list` and `organization.setActive` from the client. The
 * intersection keeps the plugin's own shape while satisfying the constraint.
 * Re-check on the next `@better-auth/expo` upgrade and drop it.
 */
const expoAuthPlugin = rawExpoPlugin as typeof rawExpoPlugin &
  BetterAuthClientPlugin;

/**
 * The official Expo integration keeps the session cookie in the system keystore
 * rather than in AsyncStorage, and drives the `biume://` deep link declared in
 * `app.config.ts` and in the server's trusted origins.
 */
export const authClient = createAuthClient({
  baseURL,
  plugins: [expoAuthPlugin, organizationClient()],
});

export type AuthClient = typeof authClient;
