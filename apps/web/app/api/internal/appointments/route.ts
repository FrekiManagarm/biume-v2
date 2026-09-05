import { getAppointments } from "#/functions/appointments.function";
import { toInternalRouteErrorResponse } from "#/lib/http/internal-route";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const fromISO = params.get("fromISO");
  const toISO = params.get("toISO");

  try {
    return Response.json(
      await getAppointments({
        fromISO: fromISO ?? "",
        toISO: toISO ?? "",
      }),
    );
  } catch (error) {
    return toInternalRouteErrorResponse(error);
  }
}
