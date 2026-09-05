import { getPatientAnatomicalHistory } from "#/functions/reports.function";
import { toInternalRouteErrorResponse } from "#/lib/http/internal-route";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);

  try {
    const anatomicalPartId = searchParams.get("anatomicalPartId");
    const type = searchParams.get("type") as
      | "dysfunction"
      | "anatomicalSuspicion"
      | "observation"
      | null;

    if (!anatomicalPartId) {
      throw new Error("anatomicalPartId parameter is required");
    }

    return Response.json(
      await getPatientAnatomicalHistory({
        petId: id,
        anatomicalPartId,
        type: type || undefined,
      }),
    );
  } catch (error) {
    return toInternalRouteErrorResponse(error);
  }
}
