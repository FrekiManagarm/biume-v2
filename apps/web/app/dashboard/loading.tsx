import { Skeleton } from "#/components/ui/skeleton";

// Reprend telle quelle la JSX de l'ancien `pendingComponent` TanStack
// (`routes/dashboard/index.tsx`, `DashboardOverviewPending`) : Next affiche
// ce fichier pendant que `app/dashboard/page.tsx` (Server Component) résout
// ses données, sans autre câblage requis.
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
