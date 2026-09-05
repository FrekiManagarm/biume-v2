import { getPatientById } from "#/functions/patients.function";
import { toInternalRouteErrorResponse } from "#/lib/http/internal-route";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const patient = await getPatientById({ id });

    if (!patient) {
      return Response.json({ error: "Patient not found" }, { status: 404 });
    }

    return Response.json(patient);
  } catch (error) {
    return toInternalRouteErrorResponse(error);
  }
}
