import "server-only";

import { getDashboardAgendaDay } from "#/functions/dashboard-agenda.function";
import {
  getNewClientsMetric,
  getNewPatientsMetric,
  getRecentActivity,
  getSentReportsMetric,
  type MetricResult,
  type RecentActivityItem,
} from "#/functions/dashboard.function";
import type { AgendaAppointmentInput } from "#/lib/dashboard/day-agenda";

export type DashboardOverview = {
  generatedAt: Date;
  selectedDate: string;
  appointments: AgendaAppointmentInput[];
  metrics: {
    newClients: MetricResult;
    newPatients: MetricResult;
    sentReports: MetricResult;
  };
  recentActivity: RecentActivityItem[];
};

/**
 * Composition lue directement par `app/dashboard/(overview)/page.tsx` pour
 * son premier rendu, sans passer par le réseau. Elle a porté un second
 * appelant, `app/api/internal/dashboard/overview/route.ts`, retiré au lot E
 * une fois établi que plus rien ne l'appelait (la page ne l'a jamais fait :
 * elle lit cette fonction en direct depuis le lot D).
 *
 * Les fenêtres 90 / 90 / 30 / 5 sont celles que le praticien voit déjà en
 * production : les changer modifierait silencieusement les chiffres
 * affichés (nouveaux clients et nouveaux patients sur 90 jours, rapports
 * envoyés sur 30 jours, 5 dernières activités).
 *
 * `generatedAt` est un vrai `Date`, pas une chaîne : cette fonction est un
 * appel direct (pas un aller-retour réseau), donc rien ne la sérialise en
 * JSON avant que l'appelant ne la lise.
 */
export async function buildDashboardOverview(
  selectedDate: string,
): Promise<DashboardOverview> {
  const [newClients, newPatients, sentReports, recentActivity, agendaDay] =
    await Promise.all([
      getNewClientsMetric(90),
      getNewPatientsMetric(90),
      getSentReportsMetric(30),
      getRecentActivity(5),
      getDashboardAgendaDay(selectedDate),
    ]);

  return {
    generatedAt: new Date(),
    selectedDate: agendaDay.selectedDate,
    appointments: agendaDay.appointments,
    metrics: { newClients, newPatients, sentReports },
    recentActivity,
  };
}
