import { getAllPatients } from "#/functions/patients.function";
import { toInternalRouteErrorResponse } from "#/lib/http/internal-route";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const search = params.get("search");
  const type = params.get("type");
  const page = params.get("page");
  const limit = params.get("limit");

  try {
    return Response.json(
      await getAllPatients({
        ...(search !== null && { search }),
        ...(type !== null && { type }),
        ...(page !== null && { page: Number(page) }),
        ...(limit !== null && { limit: Number(limit) }),
      }),
    );
  } catch (error) {
    return toInternalRouteErrorResponse(error);
  }
}
