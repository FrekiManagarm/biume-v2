import { Link, createFileRoute } from "@tanstack/react-router";

import { AdvancedReportEditor } from "#/components/reports-module/reports-editor";
import { EmptyPanel } from "#/components/dashboard/dashboard-shell";
import { getCurrentOrganization } from "#/functions/auth.function";
import { getReportById } from "#/lib/api/actions/reports.action";
import { Button } from "@biume/ui/components/button";

export const Route = createFileRoute("/dashboard/reports_/$id/edit")({
  loader: async ({ params }) => {
    const [org, reportResult] = await Promise.all([
      getCurrentOrganization(),
      getReportById({ reportId: params.id }),
    ]);

    return { org, reportResult };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { org, reportResult } = Route.useLoaderData();
  const { id: reportId } = Route.useParams();

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
      orgId={org.id}
      initialData={reportResult.data}
    />
  );
}
