import { createFileRoute } from "@tanstack/react-router";

async function handleRequest(request: Request) {
  const { handleVulgarisationRequest } = await import(
    "#/server/ai/vulgarisation"
  );

  return handleVulgarisationRequest(request);
}

export const Route = createFileRoute("/api/vulgarisation")({
  server: {
    handlers: {
      POST: ({ request }) => handleRequest(request),
    },
  },
});
