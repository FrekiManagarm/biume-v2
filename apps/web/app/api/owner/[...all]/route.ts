import { handleOwnerApiRequest } from "#/server/owner/owner-api.ports";

export const runtime = "nodejs";

export const GET = (request: Request) => handleOwnerApiRequest(request);
export const POST = (request: Request) => handleOwnerApiRequest(request);
