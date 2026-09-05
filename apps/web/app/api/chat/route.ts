import { handleChatRequest } from "#/server/ai/chat";

export const runtime = "nodejs";

// Le streaming du Vercel AI SDK passe par la Response renvoyée telle quelle :
// ne jamais la reconstruire ici, ce qui romprait le flux.
export const POST = (request: Request) => handleChatRequest(request);
