import type { Metadata } from "next";

import { DashboardOverviewView } from "#/components/dashboard/overview/dashboard-overview-view";
import { requireActiveBilling } from "#/lib/dashboard-billing-guard";
import { getDashboardOverviewDate } from "#/lib/api/queries/dashboard.query";
import { buildDashboardOverview } from "#/server/dashboard/overview";

export const metadata: Metadata = {
  title: "Vue d'ensemble | Biume",
  description:
    "Suivez vos séances du jour, comptes rendus à traiter et activité récente dans Biume.",
};

export default async function DashboardPage() {
  // Un layout Next n'est pas ré-exécuté à la navigation cliente entre deux
  // pages qu'il partage : `app/dashboard/layout.tsx` ne protège donc que le
  // premier chargement de document. Chaque page du dashboard rejoue la garde
  // à chaque navigation — cette page est la première à le faire (voir
  // lib/dashboard-billing-guard.ts). `/dashboard` est un segment statique,
  // sans paramètre : son chemin est connu ici sans passer par l'en-tête que
  // lit le layout.
  await requireActiveBilling("/dashboard");

  const selectedDate = getDashboardOverviewDate();
  const overview = await buildDashboardOverview(selectedDate);

  return (
    <DashboardOverviewView
      appointments={overview.appointments}
      metrics={{
        newAnimals: overview.metrics.newPatients.value,
        newOwners: overview.metrics.newClients.value,
        sentReports: overview.metrics.sentReports.value,
      }}
      recentActivity={overview.recentActivity}
      now={overview.generatedAt}
      selectedDate={new Date(`${overview.selectedDate}T00:00:00`)}
    />
  );
}
