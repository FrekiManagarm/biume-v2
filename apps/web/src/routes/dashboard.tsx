import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
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
  beforeLoad: async () => {
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
            {/*
              Aucun wrapper, sur aucune branche. Le contenu de chaque page
              occupe toute la largeur que lui laisse le shell : c'est à la
              page de borner sa propre colonne de lecture si elle en a besoin,
              pas au shell de la contraindre pour tout le monde.

              Pour l'assistant, l'absence de wrapper est en plus nécessaire :
              AssistantPage (h-full flex-1 min-h-0) doit être un item flex
              direct du conteneur flex-col ci-dessus pour remplir la hauteur
              et autoriser le défilement interne du chat.
            */}
            {pageContent}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
