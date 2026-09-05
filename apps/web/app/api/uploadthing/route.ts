import { uploadThingHandler } from "#/server/uploadthing";

export const runtime = "nodejs";

export const GET = (request: Request) => uploadThingHandler(request);
export const POST = (request: Request) => uploadThingHandler(request);
