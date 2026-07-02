import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import { DashboardSidebar } from "#/components/dashboard/layout/dashboard-sidebar";
import { SidebarInset, SidebarProvider } from "#/components/ui/sidebar";
import { DashboardHeader } from "#/components/dashboard/layout/dashboard-header";
import { cn } from "#/lib/style";
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

  return (
    <SidebarProvider defaultOpen={sidebarDefaultOpen}>
      <div className="flex min-h-[100dvh] w-screen">
        <DashboardSidebar
          session={session}
          organizations={organizations as Organization[]}
        />
        <SidebarInset>
          {isAssistantRoute ? null : <DashboardHeader />}
          <div
            className={cn(
              "w-full",
              isAssistantRoute
                ? "min-h-0 flex-1 overflow-hidden p-2"
                : "mb-4 overflow-y-auto p-4",
            )}
          >
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
