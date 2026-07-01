import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { AdvancedReportEditor } from "#/components/dashboard/pages/reports-module/reports-editor";
import { EmptyPanel } from "#/components/dashboard/dashboard-shell";
import { getCurrentOrganization } from "#/functions/auth.function";
import { reportQueryOptions } from "#/lib/api/queries/reports.query";
import { Button } from "@biume/ui/components/button";

export const Route = createFileRoute("/dashboard/reports_/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edition du rapport | Biume" },
      {
        name: "description",
        content: "Editez les observations et recommandations d'un rapport.",
      },
    ],
  }),
  loader: async ({ context, params }) => {
    const [org] = await Promise.all([
      getCurrentOrganization(),
      context.queryClient.ensureQueryData(reportQueryOptions(params.id)),
    ]);

    return { org };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { org } = Route.useLoaderData();
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
      orgId={org.id}
      initialData={reportResult.data}
    />
  );
}
