import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
  useMatches,
} from "@tanstack/react-router";
import { DashboardSidebar } from "#/components/dashboard/layout/dashboard-sidebar";
import { SidebarInset, SidebarProvider } from "#/components/ui/sidebar";
import { DashboardHeader } from "#/components/dashboard/layout/dashboard-header";
import { DashboardPageBanner } from "#/components/dashboard/layout/dashboard-page-banner";
import { cn } from "@biume/ui/lib/utils";
import { getDashboardShellFn } from "#/lib/api/actions/dashboard-shell.action";
import { getBillingGateRedirectTarget } from "#/server/billing/subscription-gate";
import type { Organization } from "@biume/db/schema/organization";
import type { AuthSession } from "@biume/auth";

type DashboardRedirectTarget = "/signin" | "/select-organization" | null;
type DashboardSessionState =
  | Pick<AuthSession, "session">
  | { session?: { activeOrganizationId?: string | null } }
  | null;
type DashboardCurrentOrganizationState = { id?: string | null } | null;

export function getDashboardRedirectTarget(
  session: DashboardSessionState,
  currentOrganization: DashboardCurrentOrganizationState = null,
): DashboardRedirectTarget {
  if (!session) {
    return "/signin";
  }

  if (!session.session?.activeOrganizationId) {
    return "/select-organization";
  }

  if (currentOrganization?.id !== session.session.activeOrganizationId) {
    return "/select-organization";
  }

  return null;
}

export const resolveDashboardBillingRedirect = getBillingGateRedirectTarget;

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | Biume" },
      {
        name: "description",
        content: "Suivez les operations, proprietaires et rapports dans Biume.",
      },
    ],
  }),
  component: RouteComponent,
  beforeLoad: async ({ location, preload }) => {
    // Un seul aller-retour pour tout le contexte du shell (voir
    // `getDashboardShellFn`), au lieu des cinq appels sérialisés d'avant.
    const shell = await getDashboardShellFn({
      data: { pathname: location.pathname, preload },
    });

    const redirectTarget = getDashboardRedirectTarget(shell.session, {
      id: shell.currentOrganizationId,
    });

    if (redirectTarget) {
      throw redirect({ to: redirectTarget });
    }

    if (!shell.session) {
      // Inatteignable : `getDashboardRedirectTarget` renvoie déjà "/signin"
      // sans session. Le garde sert à TypeScript, qui ne peut pas déduire
      // le rétrécissement depuis la fonction pure.
      throw redirect({ to: "/signin" });
    }

    const billingRedirectTarget = resolveDashboardBillingRedirect(
      location.pathname,
      shell.hasActiveOrTrialingSubscription,
    );

    if (billingRedirectTarget) {
      throw redirect({
        to: billingRedirectTarget,
        search: { tab: "billing", blocked: true },
      });
    }

    return {
      session: shell.session,
      organizations: shell.organizations,
      sidebarDefaultOpen: shell.sidebarDefaultOpen,
    };
  },
});

function RouteComponent() {
  const { session, organizations, sidebarDefaultOpen } =
    Route.useRouteContext();
  const pathname = useLocation({ select: (location) => location.pathname });
  const isAssistantRoute = pathname.startsWith("/dashboard/assistant");
  // La largeur de lecture est un paramètre quantitatif ordinaire, appelé à
  // se reproduire à chaque nouvelle page dense : le shell ne doit pas
  // connaître la liste des pages larges (une page ajoutée plus tard sans
  // y penser resterait bornée par erreur). C'est la page qui déclare, via
  // `staticData.wideContent`, qu'elle a besoin de plus que max-w-7xl ; le
  // shell se contente de lire la metadata de la route active.
  const matches = useMatches();
  const wideContent = matches.some((match) => match.staticData.wideContent);

  // Contenu commun à toutes les routes : bannière + contenu de la page.
  const pageContent = (
    <>
      <DashboardPageBanner />
      <Outlet />
    </>
  );

  return (
    <SidebarProvider defaultOpen={sidebarDefaultOpen}>
      <div className="flex min-h-dvh w-screen">
        <DashboardSidebar
          session={session}
          organizations={organizations as Organization[]}
        />
        <SidebarInset>
          <DashboardHeader />
          <div
            className={cn(
              "min-h-0 w-full flex-1 bg-background",
              isAssistantRoute
                ? "mb-0 flex flex-col overflow-hidden p-4"
                : "mb-4 overflow-y-auto p-4 sm:p-6",
            )}
          >
            {isAssistantRoute ? (
              // AssistantPage (h-full flex-1 min-h-0) doit être un item flex
              // direct du conteneur flex-col ci-dessus : c'est ce qui lui
              // permet de remplir la hauteur restante et d'autoriser le
              // défilement interne du chat. Un wrapper non-flex inséré ici
              // casserait cette chaîne — donc pas de wrapper sur cette
              // branche, et pas de canvas borné pour l'assistant (son propre
              // contenu se centre déjà sur une largeur de bulle de chat).
              pageContent
            ) : (
              <div
                className={cn("mx-auto w-full", !wideContent && "max-w-7xl")}
              >
                {pageContent}
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
