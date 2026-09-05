import { autumnApiHandler } from "#/server/autumn";

export const runtime = "nodejs";

export const GET = (request: Request) => autumnApiHandler(request);
export const POST = (request: Request) => autumnApiHandler(request);
