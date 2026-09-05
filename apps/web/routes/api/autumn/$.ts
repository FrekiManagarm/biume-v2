import { createFileRoute } from "@tanstack/react-router";

async function handleAutumnRequest(request: Request) {
  const { autumnApiHandler } = await import("#/server/autumn");
  return autumnApiHandler(request);
}

export const Route = createFileRoute("/api/autumn/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleAutumnRequest(request),
      POST: ({ request }) => handleAutumnRequest(request),
    },
  },
});
