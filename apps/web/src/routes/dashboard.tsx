import { useSuspenseQuery } from "@tanstack/react-query";
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
import { getCurrentOrganization, getSession } from "#/functions/auth.function";
import {
  organizationsQueryOptions,
  sidebarDefaultOpenQueryOptions,
} from "#/lib/api/queries/dashboard-layout.query";
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

    return { session };
  },
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(organizationsQueryOptions()),
      context.queryClient.ensureQueryData(sidebarDefaultOpenQueryOptions()),
    ]),
});

function RouteComponent() {
  const { session } = Route.useRouteContext();
  const { data: organizations } = useSuspenseQuery(organizationsQueryOptions());
  const { data: sidebarDefaultOpen } = useSuspenseQuery(
    sidebarDefaultOpenQueryOptions(),
  );
  const pathname = useLocation({ select: (location) => location.pathname });
  const isAssistantRoute = pathname.startsWith("/dashboard/assistant");

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
              "min-h-0 w-full flex-1 p-4",
              isAssistantRoute
                ? "mb-0 flex flex-col overflow-hidden"
                : "mb-4 overflow-y-auto",
            )}
          >
            <DashboardPageBanner />
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
