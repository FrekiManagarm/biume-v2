import {
  buildDashboardOverviewModel,
  type DashboardOverviewModel,
} from "#/lib/dashboard/dashboard-overview";
import type { AgendaAppointmentInput } from "#/lib/dashboard/day-agenda";

import { DashboardAgendaPreview } from "./dashboard-agenda-preview";
import { DashboardPrioritiesPanel } from "./dashboard-priorities-panel";
import { DashboardRecentActivity } from "./dashboard-recent-activity";
import { DashboardSummaryStrip } from "./dashboard-summary-strip";

export type DashboardOverviewViewProps = {
  appointments: AgendaAppointmentInput[];
  metrics: {
    newAnimals: number;
    newOwners: number;
    sentReports: number;
  };
  recentActivity: Array<{
    id: string;
    title: string;
    description: string;
    timestamp: string;
  }>;
  selectedDate: Date;
};

export function DashboardOverviewView({
  appointments,
  metrics,
  recentActivity,
  selectedDate,
}: DashboardOverviewViewProps) {
  const model = buildDashboardOverviewModel({
    appointments,
    metrics,
    now: new Date(),
    recentActivity,
    selectedDate,
  });

  return (
    <div className="grid w-full gap-5 pb-8 text-slate-950">
      <DashboardOverviewHeader model={model} />

      <DashboardSummaryStrip items={model.summary} />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <DashboardAgendaPreview
          appointments={model.agenda}
          emptyLabel={model.emptyStates.agenda}
        />
        <DashboardPrioritiesPanel
          emptyLabel={model.emptyStates.priorities}
          priorities={model.priorities}
        />
      </section>

      <DashboardRecentActivity
        activitySignals={model.activitySignals}
        emptyLabel={model.emptyStates.recentActivity}
        recentActivity={model.recentActivity}
      />
    </div>
  );
}

function DashboardOverviewHeader({ model }: { model: DashboardOverviewModel }) {
  return (
    <header className="grid gap-3 border-b border-slate-200 pb-5 pt-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
      <div className="min-w-0">
        <p className="text-sm font-medium text-emerald-700">Activité</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          Vue d'ensemble
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Aujourd'hui, vos séances, les comptes rendus à terminer et les suivis
          utiles au même endroit.
        </p>
      </div>
      <p className="w-fit rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600">
        {formatSelectedDate(model.selectedDate)}
      </p>
    </header>
  );
}

function formatSelectedDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(value);
}
