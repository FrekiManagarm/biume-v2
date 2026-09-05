import { Activity, Clock3 } from "lucide-react";

import type { DashboardActivitySignal } from "#/lib/dashboard/dashboard-overview";

type RecentActivityItem = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
};

type DashboardRecentActivityProps = {
  activitySignals: DashboardActivitySignal[];
  emptyLabel: string;
  recentActivity: RecentActivityItem[];
};

export function DashboardRecentActivity({
  activitySignals,
  emptyLabel,
  recentActivity,
}: DashboardRecentActivityProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-46px_rgba(15,23,42,0.45)]">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
          <Clock3 className="size-4 text-emerald-700" />
          <h2>Activité récente</h2>
        </div>

        {recentActivity.length > 0 ? (
          <div className="mt-4 grid gap-2">
            {recentActivity.map((activity) => (
              <article
                key={activity.id}
                className="grid gap-1 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {activity.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {activity.description}
                  </p>
                </div>
                <p className="whitespace-nowrap text-xs font-medium text-slate-500">
                  {activity.timestamp}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
            {emptyLabel}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_-46px_rgba(15,23,42,0.45)]">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
          <Activity className="size-4 text-emerald-700" />
          <h2>Signaux</h2>
        </div>
        <div className="mt-4 grid gap-2">
          {activitySignals.map((signal) => (
            <article
              key={signal.label}
              className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-700">
                  {signal.label}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {signal.detail}
                </p>
              </div>
              <p className="text-lg font-semibold tabular-nums text-slate-950">
                {signal.value}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
