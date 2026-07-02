import { createFileRoute } from "@tanstack/react-router";

async function handleRequest(request: Request) {
  const { handleChatRequest } = await import("#/server/ai/chat");

  return handleChatRequest(request);
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: ({ request }) => handleRequest(request),
    },
  },
});
