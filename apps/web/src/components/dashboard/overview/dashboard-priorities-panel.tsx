import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  FileText,
  Send,
  type LucideIcon,
} from "lucide-react";

import { toneSoftClassName, type Tone } from "#/components/dashboard/kit";
import { Button } from "#/components/ui/button";
import type { DashboardPriorityItem } from "#/lib/dashboard/dashboard-overview";
import { cn } from "#/lib/utils";

type DashboardPrioritiesPanelProps = {
  emptyLabel: string;
  priorities: DashboardPriorityItem[];
};

/**
 * Le modèle d'agenda parle en `neutral` / `success` / `warning` ; le kit
 * parle en tons sémantiques. `success` (l'état atteint, un compte rendu
 * envoyé) devient `done` (vert) ; `warning` (une action encore à faire)
 * devient `attention`.
 */
const priorityTone: Record<DashboardPriorityItem["tone"], Tone> = {
  neutral: "neutral",
  success: "done",
  warning: "attention",
};

export function DashboardPrioritiesPanel({
  emptyLabel,
  priorities,
}: DashboardPrioritiesPanelProps) {
  const visiblePriorities = priorities.slice(0, 8);

  return (
    <aside className="grid self-start rounded-xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-46px_rgba(15,23,42,0.45)]">
      <div>
        <p className="text-sm font-medium text-emerald-700">Priorités</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          À traiter
        </h2>
      </div>

      <div className="mt-4 grid gap-2">
        {visiblePriorities.length > 0 ? (
          visiblePriorities.map((priority) => (
            <PriorityRow key={priority.id} priority={priority} />
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
            {emptyLabel}
          </p>
        )}
      </div>
    </aside>
  );
}

function PriorityRow({ priority }: { priority: DashboardPriorityItem }) {
  const Icon = getPriorityIcon(priority);

  return (
    <article className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-3">
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-lg border",
          toneSoftClassName(priorityTone[priority.tone]),
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">
          {priority.title}
        </p>
        <p className="mt-1 truncate text-xs text-slate-500">
          {priority.timeLabel} · {priority.description}
        </p>
        <PriorityAction priority={priority} />
      </div>
    </article>
  );
}

/**
 * Toute action doit mener quelque part : c'était le défaut signalé dans la
 * spec, où « Créer le compte rendu » s'affichait en texte gris non cliquable.
 * `cancelled` et `upcoming` restent des états sans geste à poser.
 */
function PriorityAction({ priority }: { priority: DashboardPriorityItem }) {
  if (priority.actionKind === "cancelled" || priority.actionKind === "upcoming") {
    return null;
  }

  if (priority.reportId) {
    const to =
      priority.actionKind === "view_report"
        ? "/dashboard/reports/$id"
        : "/dashboard/reports/$id/edit";

    return (
      <Button
        asChild
        size="sm"
        variant="outline"
        className="mt-3 h-8 w-full px-2 text-xs sm:w-auto"
      >
        <Link to={to} params={{ id: priority.reportId }}>
          {priority.actionLabel}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      asChild
      size="sm"
      variant="outline"
      className="mt-3 h-8 w-full px-2 text-xs sm:w-auto"
    >
      <Link to="/dashboard/agenda">{priority.actionLabel}</Link>
    </Button>
  );
}

function getPriorityIcon(priority: DashboardPriorityItem): LucideIcon {
  const action = priority.actionLabel.toLocaleLowerCase("fr-FR");

  if (priority.tone === "warning") return AlertCircle;
  if (action.includes("envoyer")) return Send;
  if (action.includes("finaliser")) return CheckCircle2;
  if (action.includes("compte rendu") || action.includes("créer")) {
    return FileText;
  }

  return ClipboardList;
}
