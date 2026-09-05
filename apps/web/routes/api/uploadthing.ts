import { createFileRoute } from "@tanstack/react-router";

async function handleUploadThingRequest(request: Request) {
  const { uploadThingHandler } = await import("#/server/uploadthing");
  return uploadThingHandler(request);
}

export const Route = createFileRoute("/api/uploadthing")({
  server: {
    handlers: {
      GET: ({ request }) => handleUploadThingRequest(request),
      POST: ({ request }) => handleUploadThingRequest(request),
    },
  },
});
