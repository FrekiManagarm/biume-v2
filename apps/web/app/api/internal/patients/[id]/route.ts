import { getPatientById } from "#/functions/patients.function";
import { toInternalRouteErrorResponse } from "#/lib/http/internal-route";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    return Response.json(await getPatientById({ id }));
  } catch (error) {
    return toInternalRouteErrorResponse(error);
  }
}
