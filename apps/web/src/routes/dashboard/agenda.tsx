import { createFileRoute } from "@tanstack/react-router";

import {
  DashboardPage,
  StatusPill,
} from "#/components/dashboard/dashboard-shell";
import { agendaItems, owners } from "#/components/dashboard/dashboard-data";
import { Button } from "@biume/ui/components/button";

export const Route = createFileRoute("/dashboard/agenda")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DashboardPage
      eyebrow="Planning"
      title="Agenda operations"
      description="Un planning resserre pour coordonner inspections, validations et relances proprietaires."
      actions={<Button>Ajouter un rendez-vous</Button>}
    >
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-border bg-card shadow-sm shadow-foreground/5">
          <div className="grid gap-2 border-b border-border p-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <h2 className="font-semibold">Aujourd'hui</h2>
              <p className="text-sm text-muted-foreground">
                Lundi 29 juin 2026, fuseau Europe/Paris.
              </p>
            </div>
            <StatusPill tone="warning">2 points sensibles</StatusPill>
          </div>

          <div className="divide-y divide-border">
            {agendaItems.map((item) => (
              <article
                key={`${item.time}-${item.title}`}
                className="grid gap-3 p-4 sm:grid-cols-[76px_1fr_auto] sm:items-center"
              >
                <div className="font-mono text-sm font-semibold">
                  {item.time}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{item.title}</h3>
                    <StatusPill
                      tone={
                        item.tone === "warning"
                          ? "warning"
                          : item.tone === "success"
                            ? "success"
                            : "neutral"
                      }
                    >
                      {item.owner}
                    </StatusPill>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <span className="font-mono text-xs" aria-hidden="true">
                      @
                    </span>
                    {item.location}
                  </p>
                </div>
                <Button variant="outline">Ouvrir</Button>
              </article>
            ))}
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm shadow-foreground/5">
            <h2 className="font-semibold">Files de priorite</h2>
            <div className="mt-4 grid gap-3">
              {owners.map((owner) => (
                <div
                  key={owner.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {owner.company}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {owner.nextTouch}
                    </p>
                  </div>
                  <span className="font-mono text-sm">{owner.openReports}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 shadow-sm shadow-foreground/5">
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full bg-secondary"
                aria-hidden="true"
              />
              <h2 className="font-semibold">Creneaux libres</h2>
            </div>
            <div className="mt-4 grid gap-2">
              {["11:45", "15:20", "17:10"].map((slot) => (
                <button
                  key={slot}
                  className="flex h-10 items-center justify-between rounded-lg border border-border px-3 text-left text-sm transition-colors hover:bg-muted active:translate-y-px"
                  type="button"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="size-1.5 rounded-full bg-muted-foreground"
                      aria-hidden="true"
                    />
                    {slot}
                  </span>
                  <span className="text-xs text-muted-foreground">30 min</span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </DashboardPage>
  );
}
