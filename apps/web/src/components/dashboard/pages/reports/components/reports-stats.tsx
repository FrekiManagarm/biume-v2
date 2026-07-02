import { CheckCircle, Clock, FileText, Send } from "lucide-react";

import { cn } from "#/lib/utils";

interface ReportsStatsProps {
  total: number;
  brouillons: number;
  finalises: number;
  rapportsCeMois: number;
}

export function ReportsStats({
  total,
  brouillons,
  finalises,
  rapportsCeMois,
}: ReportsStatsProps) {
  const metrics = [
    {
      label: "Total",
      value: total,
      detail: `+${rapportsCeMois} ce mois`,
      icon: FileText,
      tone: "emerald",
    },
    {
      label: "En brouillon",
      value: brouillons,
      detail: `${getPercentage(brouillons, total)}% du total`,
      icon: Clock,
      tone: "amber",
    },
    {
      label: "Finalisés",
      value: finalises,
      detail: `${getPercentage(finalises, total)}% du total`,
      icon: CheckCircle,
      tone: "sky",
    },
    {
      label: "À transmettre",
      value: Math.max(total - finalises, 0),
      detail: "Suivi client",
      icon: Send,
      tone: "slate",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <div
            key={metric.label}
            className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {metric.label}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  {metric.value}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-500">
                  {metric.detail}
                </p>
              </div>
              <div
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl border",
                  metric.tone === "emerald" &&
                    "border-emerald-200 bg-emerald-50 text-emerald-800",
                  metric.tone === "amber" &&
                    "border-amber-200 bg-amber-50 text-amber-800",
                  metric.tone === "sky" &&
                    "border-sky-200 bg-sky-50 text-sky-800",
                  metric.tone === "slate" &&
                    "border-slate-200 bg-slate-50 text-slate-600",
                )}
              >
                <Icon className="size-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getPercentage(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}
