import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Parametres | Biume" },
      {
        name: "description",
        content: "Gerez les parametres de votre espace Biume.",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/dashboard/settings"!</div>;
}
