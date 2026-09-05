import type { Metadata } from "next";
import { Suspense } from "react";

import { getSession } from "#/functions/auth.function";
import { getOrganizationSettings } from "#/functions/organization.function";
import { requireActiveBilling } from "#/lib/dashboard-billing-guard";

import { SettingsView } from "./settings-view";

export const metadata: Metadata = {
  title: "Paramètres | Biume",
  description: "Gérez les paramètres de votre espace Biume.",
};

/**
 * Seule page du dashboard exemptée du paywall : `requireActiveBilling()` lit
 * l'en-tête de chemin posé par le proxy et gère cette exemption elle-même
 * (voir sa JSDoc) — elle est appelée ici comme sur toute autre page, jamais
 * contournée ni court-circuitée à la main.
 *
 * `getSession` et `getOrganizationSettings` sont deux lectures ; sous
 * TanStack, elles n'alimentaient qu'un `loader` de route (jamais de
 * react-query) — `Route.useLoaderData()` les rendait telles quelles au
 * composant. Contrairement à `agenda`/`clients`/`patients`/`reports.tsx`,
 * rien ici ne dépend de `searchParams` pour préchargement, donc aucune
 * requête client à préremplir : pas de `QueryClient`/`dehydrate`/
 * `HydrationBoundary` (voir `agenda/page.tsx` pour ce motif quand il est
 * réellement nécessaire) — de simples props suffisent.
 *
 * `updateOrganization` et `updateUserNotifications` (les deux mutations que
 * `routes/dashboard/settings.tsx` importait aux côtés de ces deux lectures)
 * ne remontent pas ici : `settings-view.tsx` les importe directement depuis
 * `#/lib/api/actions/organization.mutations` et `user.mutations`.
 */
export default async function Page() {
  await requireActiveBilling();

  const [session, organization] = await Promise.all([
    getSession(),
    getOrganizationSettings(),
  ]);

  return (
    <Suspense fallback={null}>
      <SettingsView session={session} organization={organization} />
    </Suspense>
  );
}
