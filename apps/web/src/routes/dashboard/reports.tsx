import { Link, createFileRoute } from "@tanstack/react-router";

import {
  DashboardPage,
  ProgressBar,
  StatusPill,
} from "#/components/dashboard/dashboard-shell";
import {
  reportStatusLabels,
  reports,
  type ReportStatus,
} from "#/components/dashboard/dashboard-data";
import { Button } from "@biume/ui/components/button";

export const Route = createFileRoute("/dashboard/reports")({
  component: RouteComponent,
});

const reportTone: Record<ReportStatus, "success" | "warning" | "neutral"> = {
  ready: "success",
  review: "warning",
  draft: "neutral",
};

function RouteComponent() {
  return (
    <DashboardPage
      eyebrow="Rapports"
      title="Production documentaire"
      description="Suivez les rapports par niveau de preparation, risque et date cible avant partage proprietaire."
      actions={
        <>
          <Button variant="outline">Vues</Button>
          <Button>Nouveau rapport</Button>
        </>
      }
    >
      <section className="grid gap-4">
        {reports.map((report) => (
          <article
            key={report.id}
            className="grid gap-4 rounded-lg border border-border bg-card p-4 shadow-sm shadow-foreground/5 transition-colors hover:border-foreground/20 lg:grid-cols-[1fr_220px_auto] lg:items-center"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone={reportTone[report.status]}>
                  {reportStatusLabels[report.status]}
                </StatusPill>
                <span className="text-xs text-muted-foreground">
                  {report.due}
                </span>
              </div>
              <h2 className="mt-3 text-lg font-semibold">{report.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {report.owner} - {report.property}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                {report.summary}
              </p>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avancement</span>
                <span className="font-mono font-medium">
                  {report.progress}%
                </span>
              </div>
              <ProgressBar value={report.progress} />
              <p className="text-xs text-muted-foreground">
                Inspecteur: {report.inspector}
              </p>
            </div>

            <Button
              render={
                <Link to="/dashboard/reports/$id" params={{ id: report.id }} />
              }
            >
              Ouvrir
            </Button>
          </article>
        ))}
      </section>
    </DashboardPage>
  );
}
