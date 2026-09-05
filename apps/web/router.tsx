import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { getContext } from "./integrations/tanstack-query/root-provider";
import { RouterPendingComponent } from "./components/router/router-pending";

export function getRouter() {
  const context = getContext();

  const router = createTanStackRouter({
    routeTree,
    context,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: RouterPendingComponent,
    defaultNotFoundComponent: () => <div>Not Found</div>,
  });

  setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }

  // Une page déclare elle-même si elle a besoin de plus que le canvas de
  // lecture (max-w-7xl) : le shell lit cette metadata sans avoir à connaître
  // le chemin de la page. `wideContent` reste optionnel, donc les routes qui
  // ne le déclarent pas n'ont pas besoin de fournir `staticData`.
  interface StaticDataRouteOption {
    wideContent?: boolean;
  }
}
