import { getAllReports } from "#/functions/reports.function";
import { toInternalRouteErrorResponse } from "#/lib/http/internal-route";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const search = params.get("search");
  const status = params.get("status");

  try {
    return Response.json(
      await getAllReports({
        ...(search !== null && { search }),
        ...(status !== null && { status }),
      }),
    );
  } catch (error) {
    return toInternalRouteErrorResponse(error);
  }
}
