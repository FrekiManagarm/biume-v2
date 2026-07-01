import { createFileRoute } from "@tanstack/react-router";

import {
  DashboardMetric,
  DashboardPage,
  StatusPill,
} from "#/components/dashboard/dashboard-shell";
import {
  owners,
  overviewStats,
  ownerStatusLabels,
  type OwnerStatus,
} from "#/components/dashboard/dashboard-data";
import { Button } from "@biume/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@biume/ui/components/table";

export const Route = createFileRoute("/dashboard/owners")({
  head: () => ({
    meta: [
      { title: "Proprietaires | Biume" },
      {
        name: "description",
        content: "Pilotez les proprietaires, portefeuilles et relances.",
      },
    ],
  }),
  component: RouteComponent,
});

const statusTone: Record<OwnerStatus, "success" | "warning" | "danger"> = {
  stable: "success",
  attention: "warning",
  blocked: "danger",
};

function RouteComponent() {
  return (
    <DashboardPage
      eyebrow="Dashboard"
      title="Proprietaires"
      description="Vue de controle des portefeuilles, relances et dossiers ouverts pour chaque proprietaire."
      actions={
        <>
          <Button variant="outline">Filtrer</Button>
          <Button>Exporter</Button>
        </>
      }
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((stat) => (
          <DashboardMetric key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-border bg-card shadow-sm shadow-foreground/5">
          <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Portefeuilles suivis</h2>
              <p className="text-sm text-muted-foreground">
                Priorises par prochaines actions et volume de rapports.
              </p>
            </div>
            <StatusPill>4 actifs</StatusPill>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proprietaire</TableHead>
                <TableHead>Portefeuille</TableHead>
                <TableHead className="text-right">Lots</TableHead>
                <TableHead className="text-right">Rapports</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Prochaine action</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {owners.map((owner) => (
                <TableRow key={owner.id}>
                  <TableCell>
                    <div className="font-medium">{owner.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {owner.company}
                    </div>
                  </TableCell>
                  <TableCell>{owner.portfolio}</TableCell>
                  <TableCell className="text-right font-mono">
                    {owner.units}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {owner.openReports}
                  </TableCell>
                  <TableCell>
                    <StatusPill tone={statusTone[owner.status]}>
                      {ownerStatusLabels[owner.status]}
                    </StatusPill>
                  </TableCell>
                  <TableCell>{owner.nextTouch}</TableCell>
                  <TableCell>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Actions proprietaire"
                    >
                      <span className="font-mono text-xs" aria-hidden="true">
                        ...
                      </span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <aside className="grid gap-4">
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm shadow-foreground/5">
            <h2 className="font-semibold">Relances rapides</h2>
            <div className="mt-4 grid gap-3">
              {owners.slice(0, 3).map((owner) => (
                <div
                  key={owner.id}
                  className="flex items-center justify-between gap-3 border-b border-border/70 pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{owner.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {owner.revenue}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon-sm"
                      variant="outline"
                      aria-label="Appeler"
                    >
                      <span
                        className="font-mono text-[10px]"
                        aria-hidden="true"
                      >
                        T
                      </span>
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="outline"
                      aria-label="Envoyer un mail"
                    >
                      <span
                        className="font-mono text-[10px]"
                        aria-hidden="true"
                      >
                        M
                      </span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-foreground p-4 text-background shadow-sm">
            <p className="text-sm font-medium">Capacite equipe</p>
            <p className="mt-3 font-mono text-3xl font-semibold">82%</p>
            <p className="mt-2 text-sm text-background/70">
              Charge saine, mais les dossiers sinistre concentrent les risques.
            </p>
          </div>
        </aside>
      </section>
    </DashboardPage>
  );
}
