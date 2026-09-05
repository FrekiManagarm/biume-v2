import { getAllClients } from "#/functions/clients.function";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const search = params.get("search");
  const page = params.get("page");
  const limit = params.get("limit");

  try {
    return Response.json(
      await getAllClients({
        ...(search !== null && { search }),
        ...(page !== null && { page: Number(page) }),
        ...(limit !== null && { limit: Number(limit) }),
      }),
    );
  } catch (error) {
    // `requireOrganizationId` lève quand la session n'a pas d'organisation
    // active. C'est un défaut d'autorisation, pas une panne : le client doit
    // pouvoir le distinguer d'un 500 pour rediriger plutôt que réessayer.
    if (error instanceof Error && error.message === "Organization not found") {
      return Response.json({ error: "Organization not found" }, { status: 401 });
    }

    throw error;
  }
}
