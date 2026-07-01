import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { getContext } from "#/integrations/tanstack-query/root-provider";
import { AutumnProvider } from "autumn-js/react";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Biume",
      },
      {
        name: "description",
        content:
          "Biume centralise le suivi des proprietaires, rendez-vous et rapports veterinaires.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument() {
  const queryClient = getContext();

  return (
    <QueryClientProvider client={queryClient.queryClient}>
      <AutumnProvider>
        <html lang="fr">
          <head>
            <HeadContent />
          </head>
          <body>
            <Outlet />

            <TanStackDevtools
              config={{
                position: "bottom-right",
              }}
              plugins={[
                {
                  name: "Tanstack Router",
                  render: <TanStackRouterDevtoolsPanel />,
                },
                TanStackQueryDevtools,
              ]}
            />
            <Scripts />
          </body>
        </html>
      </AutumnProvider>
    </QueryClientProvider>
  );
}
