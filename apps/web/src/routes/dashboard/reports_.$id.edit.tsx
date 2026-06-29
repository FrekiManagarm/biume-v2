import { Link, createFileRoute } from "@tanstack/react-router";

import {
  DashboardPage,
  EmptyPanel,
  StatusPill,
} from "#/components/dashboard/dashboard-shell";
import { getReportById } from "#/components/dashboard/dashboard-data";
import { Button } from "@biume/ui/components/button";
import { Input } from "@biume/ui/components/input";
import { Label } from "@biume/ui/components/label";
import { Textarea } from "@biume/ui/components/textarea";

export const Route = createFileRoute("/dashboard/reports_/$id/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const report = getReportById(id);

  if (!report) {
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
    <DashboardPage
      eyebrow="Edition rapport"
      title={`Modifier - ${report.title}`}
      description="Ajustez les informations visibles avant la validation finale."
      actions={
        <>
          <Button
            variant="outline"
            render={
              <Link to="/dashboard/reports/$id" params={{ id: report.id }} />
            }
          >
            Annuler
          </Button>
          <Button type="button">Enregistrer</Button>
        </>
      }
    >
      <form className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-lg border border-border bg-card p-4 shadow-sm shadow-foreground/5">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titre du rapport</Label>
              <Input id="title" defaultValue={report.title} />
              <p className="text-xs text-muted-foreground">
                Le titre apparait dans la liste proprietaire.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="property">Adresse du bien</Label>
              <Input id="property" defaultValue={report.property} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="summary">Synthese</Label>
              <Textarea
                id="summary"
                defaultValue={report.summary}
                className="min-h-32"
              />
              <p className="text-xs text-muted-foreground">
                Gardez une synthese factuelle et directement partageable.
              </p>
            </div>

            <div className="grid gap-3">
              <Label>Sections</Label>
              {report.sections.map((section) => (
                <div
                  key={section.name}
                  className="grid gap-3 rounded-lg border border-border bg-background/70 p-3 sm:grid-cols-[160px_1fr]"
                >
                  <div>
                    <p className="text-sm font-medium">{section.name}</p>
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
                  </div>
                  <Textarea
                    aria-label={`Notes ${section.name}`}
                    defaultValue={section.notes}
                    className="min-h-20"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="grid gap-4 self-start">
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm shadow-foreground/5">
            <h2 className="font-semibold">Parametres</h2>
            <div className="mt-4 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Statut</Label>
                <select
                  id="status"
                  defaultValue={report.status}
                  className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="draft">Brouillon</option>
                  <option value="review">A relire</option>
                  <option value="ready">Pret</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="due">Echeance</Label>
                <Input id="due" defaultValue={report.due} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="inspector">Inspecteur</Label>
                <Input id="inspector" defaultValue={report.inspector} />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-foreground p-4 text-background shadow-sm">
            <p className="text-sm font-medium">Controle avant envoi</p>
            <p className="mt-3 text-sm leading-6 text-background/72">
              Verifiez les annexes, les notes de section et le statut avant de
              partager le rapport au proprietaire.
            </p>
          </div>
        </aside>
      </form>
    </DashboardPage>
  );
}
