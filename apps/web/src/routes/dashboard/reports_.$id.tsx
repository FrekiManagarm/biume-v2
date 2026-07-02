import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import ReportDetails from "#/components/dashboard/pages/reports-module/reports-details";
import { EmptyPanel } from "#/components/dashboard/dashboard-shell";
import { reportQueryOptions } from "#/lib/api/queries/reports.query";
import { Button } from "@biume/ui/components/button";

export const Route = createFileRoute("/dashboard/reports_/$id")({
  head: () => ({
    meta: [
      { title: "Detail du rapport | Biume" },
      {
        name: "description",
        content: "Consultez le detail d'un rapport veterinaire.",
      },
    ],
  }),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(reportQueryOptions(params.id)),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: result } = useSuspenseQuery(reportQueryOptions(id));

  if (!result.success || !result.data) {
    return (
      <EmptyPanel
        glyph="R"
        title="Rapport introuvable"
        description="Ce rapport n'existe pas dans la liste de travail actuelle."
        action={
          <Button render={<Link to="/dashboard/reports" />}>
            Retour aux rapports
          </Button>
        }
      />
    );
  }

  return <ReportDetails report={result.data} />;
}
