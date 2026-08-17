import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  FileText,
  Send,
  type LucideIcon,
} from "lucide-react";

import { toneIconClassName, toneSoftClassName } from "#/components/dashboard/kit";
import { Button } from "#/components/ui/button";
import type { DashboardPriorityItem } from "#/lib/dashboard/dashboard-overview";
import { cn } from "#/lib/utils";

type DashboardPrioritiesPanelProps = {
  emptyLabel: string;
  priorities: DashboardPriorityItem[];
};

const toneMap: Record<DashboardPriorityItem["tone"], "neutral" | "done" | "attention"> = {
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
    <aside className="grid self-start rounded-xl border border-border bg-white p-4 shadow-[0_18px_50px_-46px_rgba(15,23,42,0.45)]">
      <div>
        <p className={cn("text-sm font-medium", toneIconClassName("done"))}>
          Priorités
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
          À traiter
        </h2>
      </div>

      <div className="mt-4 grid gap-2">
        {visiblePriorities.length > 0 ? (
          visiblePriorities.map((priority) => (
            <PriorityRow key={priority.id} priority={priority} />
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-border bg-muted px-4 py-8 text-sm text-muted-foreground">
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
    <article className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-lg border border-border bg-muted/60 px-3 py-3">
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-lg border",
          toneSoftClassName(toneMap[priority.tone]),
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {priority.title}
        </p>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {priority.timeLabel} · {priority.description}
        </p>
        <PriorityAction priority={priority} />
      </div>
    </article>
  );
}

function PriorityAction({ priority }: { priority: DashboardPriorityItem }) {
  if (
    priority.actionKind === "cancelled" ||
    priority.actionKind === "upcoming"
  ) {
    return null;
  }

  const to =
    priority.actionKind === "view_report" && priority.reportId
      ? "/dashboard/reports/$id"
      : "/dashboard/reports/$id/edit";

  if (priority.reportId) {
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
      <Link
        to="/dashboard/agenda"
        search={{ appointmentId: priority.appointmentId }}
      >
        {priority.actionLabel}
      </Link>
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
