import { getAnatomicalParts } from "#/functions/reports.function";
import { toInternalRouteErrorResponse } from "#/lib/http/internal-route";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const animalType = searchParams.get("animalType") as
      | "DOG"
      | "CAT"
      | "HORSE"
      | null;
    const zone = searchParams.get("zone") as
      | "articulation"
      | "fascias"
      | "organes"
      | "muscles"
      | null;

    if (!animalType || !zone) {
      throw new Error("animalType and zone parameters are required");
    }

    return Response.json(
      await getAnatomicalParts({
        animalType,
        zone,
      }),
    );
  } catch (error) {
    return toInternalRouteErrorResponse(error);
  }
}
