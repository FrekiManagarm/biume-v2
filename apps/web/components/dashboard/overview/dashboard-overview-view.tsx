import {
  buildDashboardOverviewModel,
  type RecentActivityInput,
} from "#/lib/dashboard/dashboard-overview";
import type { AgendaAppointmentInput } from "#/lib/dashboard/day-agenda";

import { DashboardAgendaPreview } from "./dashboard-agenda-preview";
import { DashboardPrioritiesPanel } from "./dashboard-priorities-panel";
import { DashboardRecentActivity } from "./dashboard-recent-activity";
import { DashboardSummaryStrip } from "./dashboard-summary-strip";
import {
  OnboardingReplayLink,
  OnboardingVideoCard,
} from "./onboarding-video-card";

export type DashboardOverviewViewProps = {
  appointments: AgendaAppointmentInput[];
  metrics: {
    newAnimals: number;
    newOwners: number;
    sentReports: number;
  };
  now?: Date;
  recentActivity: RecentActivityInput[];
  selectedDate: Date;
};

export function DashboardOverviewView({
  appointments,
  metrics,
  now = new Date(),
  recentActivity,
  selectedDate,
}: DashboardOverviewViewProps) {
  const model = buildDashboardOverviewModel({
    appointments,
    metrics,
    now,
    recentActivity,
    selectedDate,
  });

  return (
    <div className="grid w-full gap-5 pb-8 text-slate-950">
      {/* La présentation passe avant les indicateurs : quelqu'un qui découvre
          l'outil a un tableau de bord vide, où la carte est la seule chose à
          faire. Elle s'efface d'elle-même une fois la vidéo vue ou écartée. */}
      <OnboardingVideoCard />

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

      <OnboardingReplayLink />
    </div>
  );
}
