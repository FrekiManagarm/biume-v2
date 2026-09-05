import { getAnatomicalParts } from "#/functions/reports.function";
import { toInternalRouteErrorResponse } from "#/lib/http/internal-route";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const animalType = params.get("animalType");
  const zone = params.get("zone");

  try {
    return Response.json(
      await getAnatomicalParts({
        animalType: animalType ?? "",
        zone: zone ?? "",
      } as Parameters<typeof getAnatomicalParts>[0]),
    );
  } catch (error) {
    return toInternalRouteErrorResponse(error);
  }
}
