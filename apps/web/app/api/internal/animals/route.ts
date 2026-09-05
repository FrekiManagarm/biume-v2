import { getAllAnimals } from "#/functions/patients.function";
import { toInternalRouteErrorResponse } from "#/lib/http/internal-route";

export const runtime = "nodejs";

export async function GET() {
  try {
    return Response.json(await getAllAnimals());
  } catch (error) {
    return toInternalRouteErrorResponse(error);
  }
}
