import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getDashboardShellFn } from "#/lib/api/actions/dashboard-shell.action";
import {
  getDashboardRedirectTarget,
  resolveDashboardBillingRedirect,
} from "#/lib/dashboard-guards";
import { PATHNAME_HEADER } from "#/lib/pathname-header";
import type { Organization } from "@biume/db/schema/organization";

import { DashboardLayoutView } from "./dashboard-layout-view";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Le proxy (`proxy.ts`, matcher `/dashboard/:path*`) recopie le chemin dans
  // cet en-tête : un layout Next n'est pas re-rendu par segment et ne reçoit
  // sinon aucune information de route. La garde de facturation en dépend
  // pour ne pas boucler (voir `resolveDashboardBillingRedirect`).
  const pathnameHeader = (await headers()).get(PATHNAME_HEADER);

  if (!pathnameHeader) {
    // Le proxy pose toujours cet en-tête sur une requête `/dashboard/:path*`
    // réelle : son absence ici signale une panne (proxy non exécuté, ou
    // en-tête filtré en amont), pas un cas nominal à dégrader silencieusement
    // vers une chaîne vide — `dashboardShellSchema` rejetterait de toute
    // façon un `pathname` vide (`z.string().min(1)`), mais avec un message
    // Zod opaque qui masquerait la vraie cause. Fail-closed assumé : mieux
    // vaut un 500 explicite ici qu'une garde de facturation qui raisonnerait
    // sur un chemin inventé.
    throw new Error(
      "En-tête pathname absent : le proxy dashboard ne s'est pas exécuté pour cette requête.",
    );
  }

  const pathname = pathnameHeader;

  // `preload` n'a plus d'équivalent : TanStack l'activait au survol d'un
  // lien, un layout Next s'exécute sur une navigation réelle.
  const shell = await getDashboardShellFn({ pathname, preload: false });

  const redirectTarget = getDashboardRedirectTarget(shell.session, {
    id: shell.currentOrganizationId,
  });

  if (redirectTarget) {
    redirect(redirectTarget);
  }

  if (!shell.session) {
    // Inatteignable : `getDashboardRedirectTarget` renvoie déjà "/signin"
    // sans session. Le garde sert à TypeScript, qui ne peut pas déduire
    // le rétrécissement depuis la fonction pure.
    redirect("/signin");
  }

  // Première ligne de défense, au chargement document : réutilise la
  // lecture déjà groupée par `getDashboardShellFn` (session + organisation +
  // facturation en un seul aller-retour) plutôt que de rappeler
  // `requireActiveBilling`, qui referait un aller-retour Autumn séparé.
  //
  // Un layout Next ne se ré-exécute pas à la navigation cliente entre deux
  // pages qu'il partage : cette vérification ne protège donc que le premier
  // chargement de document. `lib/dashboard-billing-guard.ts` existe pour que
  // chaque page du dashboard rejoue la garde à chaque navigation — la tâche
  // 6 est la première à s'en servir.
  const billingRedirectTarget = resolveDashboardBillingRedirect(
    pathname,
    shell.hasActiveOrTrialingSubscription,
  );

  if (billingRedirectTarget) {
    redirect(`${billingRedirectTarget}?tab=billing&blocked=true`);
  }

  // La largeur de lecture (`wideContent`) venait de `useMatches()` côté
  // TanStack : la route active déclarait `staticData.wideContent` et le
  // shell lisait la metadata de la route montée. Next ne donne pas cette
  // information à un layout — il n'y a pas d'équivalent direct. Rétabli
  // côté client dans `dashboard-layout-view.tsx` (voir sa JSDoc) via un test
  // sur le pathname, à l'image d'`isAssistantRoute` : pas ici, ce Server
  // Component ne reçoit le pathname qu'au premier chargement de document
  // (l'en-tête ci-dessus), pas à la navigation cliente entre deux pages
  // qu'il partage.

  return (
    <DashboardLayoutView
      session={shell.session}
      organizations={shell.organizations as Organization[]}
      sidebarDefaultOpen={shell.sidebarDefaultOpen}
    >
      {children}
    </DashboardLayoutView>
  );
}
