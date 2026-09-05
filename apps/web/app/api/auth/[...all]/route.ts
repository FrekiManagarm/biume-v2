import { auth } from "@biume/auth";

export const runtime = "nodejs";

export const GET = (request: Request) => auth.handler(request);
export const POST = (request: Request) => auth.handler(request);
