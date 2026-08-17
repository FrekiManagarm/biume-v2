import { createFileRoute } from "@tanstack/react-router";

async function handleMobileRequest(request: Request) {
  const { handleMobileApiRequest } = await import("#/server/mobile/mobile-api");
  return handleMobileApiRequest(request);
}

export const Route = createFileRoute("/api/mobile/v1/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleMobileRequest(request),
      POST: ({ request }) => handleMobileRequest(request),
      DELETE: ({ request }) => handleMobileRequest(request),
    },
  },
});
