export type {
  MetricResult,
  RecentActivityItem,
  RecentReport,
  SpeciesItem,
} from "#/functions/dashboard.function";

// `getNewClientsMetric`, `getNewPatientsMetric`, `getSentReportsMetric` et
// `getRecentActivity` n'ont plus d'appelant dans ce fichier :
// `buildDashboardOverview` (`server/dashboard/overview.ts`) compose
// désormais ces lectures côté serveur, appelée en direct par
// `app/dashboard/(overview)/page.tsx`, sans repasser par cette couche
// d'adaptation. `getDraftReportsMetric`, `getClienteleBySpecies` et
// `getRecentReports` n'avaient déjà aucun appelant avant cette tâche.
//
// Comme pour `getTodayAppointments`/`getAppointmentsWithoutReport` dans
// `appointments.action.ts`, elles restent de simples fonctions exportées
// par `dashboard.function.ts`, sans surface publique ici : leur donner une
// entrée — même en valeur, sans passer par un endpoint REST — romprait la
// règle qui garde `db` et Drizzle hors de ce fichier pour du code mort.
