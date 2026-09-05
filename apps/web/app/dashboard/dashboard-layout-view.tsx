"use client";

import { usePathname } from "next/navigation";

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
 *
 * `isAssistantRoute` et `wideContent` sont calculés ici, via `usePathname()`,
 * plutôt que reçus en prop depuis le Server Component parent : un layout
 * Next ne se ré-exécute pas à la navigation cliente entre deux pages qu'il
 * partage, un drapeau calculé côté serveur y resterait donc figé sur la
 * valeur du premier chargement de document (un clic sur « Assistant » ou
 * « Agenda » depuis la sidebar rendrait alors la mauvaise branche de mise
 * en page). Ce composant est déjà client et déjà réactif via ses hooks
 * `usePathname()` (`DashboardSidebar`, `DashboardHeader`,
 * `DashboardPageBanner`) : autant y garder ce calcul plutôt que de le geler.
 *
 * `wideContent` reprend le rôle de `staticData.wideContent` +
 * `useMatches()` sous TanStack (`routes/dashboard.tsx`) : la route active
 * déclarait elle-même son besoin de largeur, et le shell se contentait de
 * lire cette metadata. Next n'offre pas d'équivalent — une page n'a aucun
 * moyen de signaler quoi que ce soit à son layout parent. Décider la
 * largeur dans la page elle-même ne suffirait de toute façon pas ici : la
 * bannière (`DashboardPageBanner`) est rendue par CE composant, pas par la
 * page, et sous TanStack banner et contenu partageaient toujours le même
 * conteneur de largeur (une page large élargissait aussi sa bannière). Une
 * page ne pourrait élargir que son propre contenu, pas la bannière rendue
 * au-dessus d'elle — ce qui désaligne les deux dès qu'un viewport dépasse
 * 80rem. La liste ci-dessous fait donc jouer au shell le même rôle que pour
 * `isAssistantRoute` (déjà un test sur le pathname) et que pour les libellés
 * de `DashboardPageBanner` (déjà une table de correspondance pathname →
 * copie) : c'est le shell qui sait déjà quelles routes sont spéciales,
 * `wideContent` ne fait que s'ajouter à ce savoir existant plutôt que d'en
 * introduire un nouveau canal. Seules `/dashboard/agenda` et
 * `/dashboard/reports` (la liste, pas `/dashboard/reports/:id`) déclaraient
 * `wideContent` sous TanStack — comparaison exacte, pas `startsWith`, pour
 * ne pas élargir par erreur la page de détail d'un rapport.
 */
export function DashboardLayoutView({
  session,
  organizations,
  sidebarDefaultOpen,
  children,
}: {
  session: AuthSession;
  organizations: Organization[];
  sidebarDefaultOpen: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAssistantRoute = pathname.startsWith("/dashboard/assistant");

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
              <div className={cn("mx-auto w-full")}>
                {pageContent}
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
