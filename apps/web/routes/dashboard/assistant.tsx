import { createFileRoute, notFound } from "@tanstack/react-router";

import { AssistantPage } from "#/components/dashboard/assistant/assistant-page";

export const Route = createFileRoute("/dashboard/assistant")({
  head: () => ({
    meta: [
      { title: "Assistant | Biume" },
      {
        name: "description",
        content:
          "Utilisez l'assistant Biume pour préparer les consultations, structurer les rapports et organiser les prochaines actions.",
      },
    ],
  }),
  beforeLoad: () => {
    if (process.env.NODE_ENV === "production") {
      throw notFound();
    }
  },
  component: AssistantPage,
});
