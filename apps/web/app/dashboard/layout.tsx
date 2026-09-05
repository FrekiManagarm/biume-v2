import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getDashboardShellFn } from "#/lib/api/actions/dashboard-shell.action";
import {
  getDashboardRedirectTarget,
  resolveDashboardBillingRedirect,
} from "#/lib/dashboard-guards";
import { PATHNAME_HEADER } from "#/middleware";
import type { Organization } from "@biume/db/schema/organization";

import { DashboardLayoutView } from "./dashboard-layout-view";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Le middleware (`middleware.ts`, matcher `/dashboard/:path*`) recopie le
  // chemin dans cet en-tête : un layout Next n'est pas re-rendu par segment
  // et ne reçoit sinon aucune information de route. La garde de facturation
  // en dépend pour ne pas boucler (voir `resolveDashboardBillingRedirect`).
  const pathname = (await headers()).get(PATHNAME_HEADER) ?? "";

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
  // information à un layout — il n'y a pas d'équivalent direct. Aucune page
  // de ce lot n'en a besoin (seules `/dashboard/reports` et
  // `/dashboard/agenda`, non portées ici, la déclaraient) : le mécanisme est
  // donc laissé de côté pour l'instant plutôt que recréé sur une seule
  // supposition. La tâche qui portera ces deux pages devra réintroduire un
  // moyen pour elles de le signaler au layout (par exemple un test sur le
  // pathname, à l'image d'`isBillingSettingsPath`).
  const isAssistantRoute = pathname.startsWith("/dashboard/assistant");

  return (
    <DashboardLayoutView
      session={shell.session}
      organizations={shell.organizations as Organization[]}
      sidebarDefaultOpen={shell.sidebarDefaultOpen}
      isAssistantRoute={isAssistantRoute}
    >
      {children}
    </DashboardLayoutView>
  );
}
