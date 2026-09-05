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
 * Composition partagée par `app/api/internal/dashboard/overview/route.ts`
 * (qui la sert au client existant) et `app/dashboard/page.tsx` (qui l'appelle
 * directement pour son premier rendu, sans passer par le réseau).
 *
 * Recopier ces cinq lectures dans la page les aurait fait diverger au
 * premier changement ; elles vivent donc ici, une seule fois.
 *
 * Les fenêtres 90 / 90 / 30 / 5 sont celles que le praticien voit déjà en
 * production : les changer modifierait silencieusement les chiffres
 * affichés (nouveaux clients et nouveaux patients sur 90 jours, rapports
 * envoyés sur 30 jours, 5 dernières activités).
 *
 * `generatedAt` est un vrai `Date`, pas une chaîne : cette fonction est un
 * appel direct (pas un aller-retour réseau), donc rien ne la sérialise en
 * JSON avant que l'appelant ne la lise. Le route handler, qui répond à un
 * client HTTP, est responsable de la convertir en chaîne ISO à la sortie.
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
