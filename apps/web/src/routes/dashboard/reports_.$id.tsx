import { Link, createFileRoute } from "@tanstack/react-router";

import {
  DashboardPage,
  EmptyPanel,
  ProgressBar,
  StatusPill,
} from "#/components/dashboard/dashboard-shell";
import {
  getReportById,
  reportStatusLabels,
  type ReportStatus,
} from "#/components/dashboard/dashboard-data";
import { Button } from "@biume/ui/components/button";

export const Route = createFileRoute("/dashboard/reports_/$id")({
  component: RouteComponent,
});

const reportTone: Record<ReportStatus, "success" | "warning" | "neutral"> = {
  ready: "success",
  review: "warning",
  draft: "neutral",
};

function RouteComponent() {
  const { id } = Route.useParams();
  const report = getReportById(id);

  if (!report) {
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
  return (
    <DashboardPage
      eyebrow="Detail rapport"
      title={report.title}
      description={`${report.owner} - ${report.property}`}
      actions={
        <>
          <Button variant="outline" render={<Link to="/dashboard/reports" />}>
            Retour
          </Button>
          <Button
            render={
              <Link
                to="/dashboard/reports/$id/edit"
                params={{ id: report.id }}
              />
            }
          >
            Modifier
          </Button>
        </>
      }
    >
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-4">
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm shadow-foreground/5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone={reportTone[report.status]}>
                {reportStatusLabels[report.status]}
              </StatusPill>
              <StatusPill
                tone={
                  report.risk === "High"
                    ? "danger"
                    : report.risk === "Medium"
                      ? "warning"
                      : "success"
                }
              >
                Risque {report.risk}
              </StatusPill>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
              {report.summary}
            </p>
            <div className="mt-5 grid gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avancement global</span>
                <span className="font-mono font-medium">
                  {report.progress}%
                </span>
              </div>
              <ProgressBar value={report.progress} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card shadow-sm shadow-foreground/5">
            <div className="border-b border-border p-4">
              <h2 className="font-semibold">Sections controlees</h2>
            </div>
            <div className="divide-y divide-border">
              {report.sections.map((section) => (
                <div
                  key={section.name}
                  className="grid gap-3 p-4 sm:grid-cols-[180px_110px_1fr] sm:items-center"
                >
                  <p className="font-medium">{section.name}</p>
                  <StatusPill
                    tone={
                      section.state === "Done"
                        ? "success"
                        : section.state === "Review"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {section.state}
                  </StatusPill>
                  <p className="text-sm text-muted-foreground">
                    {section.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm shadow-foreground/5">
            <h2 className="font-semibold">Meta</h2>
            <dl className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Inspecteur</dt>
                <dd className="font-medium">{report.inspector}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Echeance</dt>
                <dd className="font-medium">{report.due}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Reference</dt>
                <dd className="font-mono text-xs">{report.id}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 shadow-sm shadow-foreground/5">
            <h2 className="font-semibold">Historique</h2>
            <div className="mt-4 grid gap-4">
              {report.timeline.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[76px_1fr] gap-3"
                >
                  <div className="font-mono text-xs text-muted-foreground">
                    {item.date}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </DashboardPage>
  );
}
