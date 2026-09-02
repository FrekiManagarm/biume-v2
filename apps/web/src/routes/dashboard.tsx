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
import {
  getCurrentOrganization,
  getOrganizations,
  getSession,
} from "#/functions/auth.function";
import { getSidebarDefaultOpen } from "#/functions/sidebar.function";
import { getOrganizationSubscriptionGateFn } from "#/lib/api/actions/subscription-gate.action";
import {
  getBillingGateRedirectTarget,
  shouldCheckBillingGate,
} from "#/server/billing/subscription-gate";
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
    const session = await getSession();

    if (!session) {
      throw redirect({ to: "/signin" });
    }

    if (!session.session.activeOrganizationId) {
      throw redirect({ to: "/select-organization" });
    }

    const currentOrganization = await getCurrentOrganization().catch(
      () => null,
    );

    const redirectTarget = getDashboardRedirectTarget(
      session,
      currentOrganization,
    );

    if (redirectTarget) {
      throw redirect({ to: redirectTarget });
    }

    // `session.session.activeOrganizationId` est garanti non-null ici (le
    // premier throw plus haut couvre le cas contraire), contrairement à
    // `currentOrganization` qui reste `Organization | null` pour TypeScript
    // après le `.catch(() => null)` — utiliser l'org directement produirait
    // une erreur de type sans apporter d'info supplémentaire, puisque
    // `getDashboardRedirectTarget` a déjà vérifié qu'ils coïncident.
    if (shouldCheckBillingGate({ preload, pathname: location.pathname })) {
      const { hasActiveOrTrialingSubscription } =
        await getOrganizationSubscriptionGateFn({
          data: { organizationId: session.session.activeOrganizationId },
        });

      const billingRedirectTarget = resolveDashboardBillingRedirect(
        location.pathname,
        hasActiveOrTrialingSubscription,
      );

      if (billingRedirectTarget) {
        throw redirect({
          to: billingRedirectTarget,
          search: { tab: "billing", blocked: true },
        });
      }
    }

    const [organizations, sidebarDefaultOpen] = await Promise.all([
      getOrganizations(),
      getSidebarDefaultOpen(),
    ]);

    return { session, organizations, sidebarDefaultOpen };
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
