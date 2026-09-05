import { Skeleton } from "#/components/ui/skeleton";

// Reprend telle quelle la JSX de l'ancien `pendingComponent` TanStack
// (`routes/dashboard/index.tsx`, `DashboardOverviewPending`) : Next affiche
// ce fichier pendant que `page.tsx` du même dossier (Server Component)
// résout ses données, sans autre câblage requis.
//
// Vit dans `(overview)` — groupe de routes sans effet sur l'URL — plutôt
// que directement sous `app/dashboard/` : un `loading.tsx` Next s'applique
// à tout le sous-arbre de son dossier. Posé au niveau `app/dashboard/`, ce
// squelette (sections calibrées sur les cartes de la vue d'ensemble)
// s'affichait pour la navigation vers n'importe quelle page du dashboard.
// Sous TanStack, seul `routes/dashboard/index.tsx` déclarait un
// `pendingComponent` — les six autres routes n'en avaient pas — donc cette
// portée page-only est celle d'origine, pas une nouveauté. Contrairement à
// `error.tsx`, pas de filet générique laissé à `app/dashboard/` : aucune
// route parente n'en définissait, il n'y a donc rien à généraliser.
export default function DashboardLoading() {
  return (
    <div className="grid gap-5 pb-8">
      <section className="grid gap-2 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-lg" />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Skeleton className="h-112 rounded-lg" />
        <Skeleton className="h-112 rounded-lg" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </section>
    </div>
  );
}
