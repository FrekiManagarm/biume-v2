import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";

import { AdvancedReportEditor } from "#/components/dashboard/pages/reports-module/reports-editor";
import { EmptyPanel } from "#/components/dashboard/dashboard-shell";
import { getCurrentOrganization, getSession } from "#/functions/auth.function";
import { reportQueryOptions } from "#/lib/api/queries/reports.query";
import { Button } from "@biume/ui/components/button";
import { getOrganizationSubscriptionGateFn } from "#/lib/api/actions/subscription-gate.action";
import { getDashboardRedirectTarget, resolveDashboardBillingRedirect } from "./dashboard";

export const Route = createFileRoute("/dashboard_/reports_/$id_/edit")({
  head: () => ({
    meta: [
      { title: "Edition du rapport | Biume" },
      {
        name: "description",
        content: "Editez les observations et recommandations d'un rapport.",
      },
    ],
  }),
  beforeLoad: async ({ location }) => {
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

    // Même remarque que dans `dashboard.tsx` : `activeOrganizationId` est
    // sûr ici, `currentOrganization` reste nullable pour TypeScript.
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

    return { org: currentOrganization };
  },
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(reportQueryOptions(params.id)),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { org } = Route.useRouteContext();
  const { id: reportId } = Route.useParams();
  const { data: reportResult } = useSuspenseQuery(reportQueryOptions(reportId));

  if (!reportResult.success || !reportResult.data) {
    return (
      <EmptyPanel
        glyph="R"
        title="Rapport introuvable"
        description="Impossible d'ouvrir l'edition de ce rapport."
        action={
          <Button render={<Link to="/dashboard/reports" />}>
            Retour aux rapports
          </Button>
        }
      />
    );
  }

  return (
    <AdvancedReportEditor
      reportId={reportId}
      orgId={org?.id!}
      initialData={reportResult.data}
    />
  );
}
