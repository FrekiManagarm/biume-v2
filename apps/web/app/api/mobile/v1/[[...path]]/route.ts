import { handleMobileApiRequest } from "#/server/mobile/mobile-api";

export const runtime = "nodejs";

export const GET = (request: Request) => handleMobileApiRequest(request);
export const POST = (request: Request) => handleMobileApiRequest(request);
export const DELETE = (request: Request) => handleMobileApiRequest(request);
