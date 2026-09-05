import { handleVulgarisationRequest } from "#/server/ai/vulgarisation";

export const runtime = "nodejs";

export const POST = (request: Request) => handleVulgarisationRequest(request);
