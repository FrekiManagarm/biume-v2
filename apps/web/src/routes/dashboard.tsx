import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { DashboardSidebar } from "#/components/dashboard/layout/dashboard-sidebar";
import { SidebarInset, SidebarProvider } from "#/components/ui/sidebar";
import { DashboardHeader } from "#/components/dashboard/layout/dashboard-header";
import { getOrganizations, getSession } from "#/functions/auth.function";
import { getSidebarDefaultOpen } from "#/functions/sidebar.function";
import type { Organization } from "@biume/db/schema/organization";

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
    const [session, organizations, sidebarDefaultOpen] = await Promise.all([
      getSession(),
      getOrganizations(),
      getSidebarDefaultOpen(),
    ]);

    if (!session) {
      throw redirect({ to: "/signin" });
    }
    return { session, organizations, sidebarDefaultOpen };
  },
});

function RouteComponent() {
  const { session, organizations, sidebarDefaultOpen } = Route.useRouteContext();

  return (
    <SidebarProvider defaultOpen={sidebarDefaultOpen}>
      <div className="flex w-screen h-screen">
        <DashboardSidebar
          session={session}
          organizations={organizations as Organization[]}
        />
        <SidebarInset>
          <DashboardHeader />
          <div className="w-full overflow-y-auto p-4 mb-4">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
