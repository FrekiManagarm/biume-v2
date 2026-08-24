import { createFileRoute } from "@tanstack/react-router";

async function handleOwnerRequest(request: Request) {
  const { handleOwnerApiRequest } = await import("#/server/owner/owner-api.ports");
  return handleOwnerApiRequest(request);
}

export const Route = createFileRoute("/api/owner/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleOwnerRequest(request),
      POST: ({ request }) => handleOwnerRequest(request),
    },
  },
});
