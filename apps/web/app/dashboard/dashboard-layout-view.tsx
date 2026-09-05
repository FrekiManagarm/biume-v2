"use client";

import { DashboardHeader } from "#/components/dashboard/layout/dashboard-header";
import { DashboardPageBanner } from "#/components/dashboard/layout/dashboard-page-banner";
import { DashboardSidebar } from "#/components/dashboard/layout/dashboard-sidebar";
import { SidebarInset, SidebarProvider } from "#/components/ui/sidebar";
import { cn } from "@biume/ui/lib/utils";
import type { Organization } from "@biume/db/schema/organization";
import type { AuthSession } from "@biume/auth";

/**
 * Frontière client du shell dashboard.
 *
 * `DashboardHeader`, `DashboardPageBanner` et `components/ui/sidebar.tsx`
 * (dont `SidebarProvider`) utilisent des hooks React (context, état) et les
 * hooks client de `@tanstack/react-router`, mais aucun ne porte "use client" —
 * inutile sous Vite/TanStack Start, où tout le SPA est déjà côté client.
 *
 * Sous Next, importés directement depuis `app/dashboard/layout.tsx` (un
 * Server Component), ils sont compilés dans le graphe *serveur* : React y
 * refuse `createContext`/`useContext` ("createContext only works in Client
 * Components"), et la page part en 500 sur chaque route du dashboard.
 *
 * La consigne de la tâche est de ne pas modifier ces trois composants
 * au-delà du déballage de `dashboard-sidebar.tsx`. Plutôt que d'y poser
 * "use client" un par un, cette frontière unique les importe tous : une fois
 * franchie, ils sont compilés pour le client sans qu'aucun n'ait besoin de
 * sa propre directive — exactement le motif page/vue déjà en place ailleurs
 * dans ce lot, appliqué ici au layout plutôt qu'à une page.
 *
 * `children` reste un Server Component (la page dashboard, lot suivant) :
 * passé en prop, il n'a pas besoin d'être lui-même client.
 */
export function DashboardLayoutView({
  session,
  organizations,
  sidebarDefaultOpen,
  isAssistantRoute,
  children,
}: {
  session: AuthSession;
  organizations: Organization[];
  sidebarDefaultOpen: boolean;
  isAssistantRoute: boolean;
  children: React.ReactNode;
}) {
  const pageContent = (
    <>
      <DashboardPageBanner />
      {children}
    </>
  );

  return (
    <SidebarProvider defaultOpen={sidebarDefaultOpen}>
      <div className="flex min-h-dvh w-screen">
        <DashboardSidebar session={session} organizations={organizations} />
        <SidebarInset>
          <DashboardHeader />
          <div
            className={cn(
              "min-h-0 w-full flex-1 bg-background",
              isAssistantRoute
                ? "mb-0 flex flex-col overflow-hidden p-4"
                : "mb-4 overflow-y-auto p-4 sm:p-6",
            )}
          >
            {isAssistantRoute ? (
              // AssistantPage (h-full flex-1 min-h-0) doit être un item flex
              // direct du conteneur flex-col ci-dessus : c'est ce qui lui
              // permet de remplir la hauteur restante et d'autoriser le
              // défilement interne du chat. Un wrapper non-flex inséré ici
              // casserait cette chaîne — donc pas de wrapper sur cette
              // branche, et pas de canvas borné pour l'assistant (son propre
              // contenu se centre déjà sur une largeur de bulle de chat).
              pageContent
            ) : (
              <div className="mx-auto w-full max-w-7xl">{pageContent}</div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
