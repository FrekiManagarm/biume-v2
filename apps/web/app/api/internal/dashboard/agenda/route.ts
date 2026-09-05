import { getDashboardAgendaDay } from "#/functions/dashboard-agenda.function";
import { toInternalRouteErrorResponse } from "#/lib/http/internal-route";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const date = params.get("date") ?? new Date().toISOString().slice(0, 10);

  try {
    return Response.json(await getDashboardAgendaDay(date));
  } catch (error) {
    return toInternalRouteErrorResponse(error);
  }
}
