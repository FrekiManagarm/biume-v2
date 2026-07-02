import {
  AlertCircle,
  CalendarClock,
  ClipboardList,
  FileText,
  HeartHandshake,
  type LucideIcon,
} from "lucide-react";

import type { DashboardSummaryItem } from "#/lib/dashboard/dashboard-overview";
import { cn } from "#/lib/utils";

type DashboardSummaryStripProps = {
  items: DashboardSummaryItem[];
};

const iconBySummaryId: Record<DashboardSummaryItem["id"], LucideIcon> = {
  next: CalendarClock,
  appointments: ClipboardList,
  reports: FileText,
  activity: HeartHandshake,
};

const toneClassName: Record<DashboardSummaryItem["tone"], string> = {
  neutral: "border-slate-200 bg-white text-slate-600",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
};

export function DashboardSummaryStrip({ items }: DashboardSummaryStripProps) {
  return (
    <section
      aria-label="Indicateurs du tableau de bord"
      className="grid gap-3 md:grid-cols-4"
    >
      {items.map((item) => {
        const Icon =
          item.tone === "warning" ? AlertCircle : iconBySummaryId[item.id];

        return (
          <article
            key={item.id}
            className="grid min-h-28 grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-46px_rgba(15,23,42,0.45)]"
          >
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-lg border",
                toneClassName[item.tone],
              )}
            >
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase text-slate-500">
                {item.label}
              </p>
              <p className="mt-1 truncate text-2xl font-semibold tracking-tight text-slate-950">
                {item.value}
              </p>
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">
                {item.detail}
              </p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
