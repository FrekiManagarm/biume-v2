import { Link, createFileRoute } from "@tanstack/react-router";

import ReportDetails from "#/components/reports-module/reports-details";
import { EmptyPanel } from "#/components/dashboard/dashboard-shell";
import { getReportById } from "#/lib/api/actions/reports.action";
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
  loader: ({ params }) => getReportById({ reportId: params.id }),
  component: RouteComponent,
});

function RouteComponent() {
  const result = Route.useLoaderData();

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
