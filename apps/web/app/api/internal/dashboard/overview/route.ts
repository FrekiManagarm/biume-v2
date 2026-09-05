import { buildDashboardOverview } from "#/server/dashboard/overview";
import { toInternalRouteErrorResponse } from "#/lib/http/internal-route";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const selectedDate =
    new URL(request.url).searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

  try {
    // La composition (cinq lectures en parallèle, fenêtres 90/90/30/5) vit
    // dans `#/server/dashboard/overview` : `app/dashboard/page.tsx` l'appelle
    // aussi, directement, pour son premier rendu. La recopier ici l'aurait
    // fait diverger au premier changement.
    //
    // Ce n'est PAS une session résolue une seule fois : `cache()` de React
    // ne mémoïse que dans une portée de Server Component, qu'un route
    // handler n'installe pas. Les cinq appels faits par `buildDashboardOverview`
    // relisent donc chacun la session (cinq lectures, pas une). Voir spec
    // § 13, risque 7.
    const overview = await buildDashboardOverview(selectedDate);

    return Response.json({
      generatedAt: overview.generatedAt.toISOString(),
      selectedDate: overview.selectedDate,
      appointments: overview.appointments,
      metrics: overview.metrics,
      recentActivity: overview.recentActivity,
    });
  } catch (error) {
    return toInternalRouteErrorResponse(error);
  }
}
