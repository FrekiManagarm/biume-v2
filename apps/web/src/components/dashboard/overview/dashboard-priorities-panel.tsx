import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  FileText,
  Send,
  type LucideIcon,
} from "lucide-react";

import type { DashboardPriorityItem } from "#/lib/dashboard/dashboard-overview";
import { cn } from "#/lib/utils";

type DashboardPrioritiesPanelProps = {
  emptyLabel: string;
  priorities: DashboardPriorityItem[];
};

const toneClassName: Record<DashboardPriorityItem["tone"], string> = {
  neutral: "border-slate-200 bg-white text-slate-600",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
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
          toneClassName[priority.tone],
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
        <span className="mt-3 inline-flex min-h-6 w-full items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 sm:w-auto">
          {priority.actionLabel}
        </span>
      </div>
    </article>
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
