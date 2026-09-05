import { useMemo, Fragment } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { useSidebar } from "#/components/ui/sidebar";
import { breadcrumbProList } from "#/lib/breadcrumb-list";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@biume/ui/components/breadcrumb";
import { Separator } from "@biume/ui/components/separator";

export function DashboardHeader() {
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const params = useParams();

  // `useParams()` de `next/navigation` rend `Record<string, string | string[]>`
  // (contre un objet typé selon la route sous TanStack) : un segment
  // catch-all (`[...id]`) donnerait un tableau ici, et `breadcrumbProList`
  // recevrait silencieusement `undefined`. Les deux seules routes qui
  // fournissent ce paramètre (`dashboard/reports/[id]` et
  // `dashboard/reports/[id]/edit`, `$id` sous TanStack) sont des segments
  // dynamiques simples, jamais un catch-all : `params.id` y est toujours une
  // chaîne, jamais un tableau. Le garde `typeof … === "string"` reste donc
  // suffisant et n'a pas besoin d'un cast.
  const breadcrumb = breadcrumbProList(
    typeof params.id === "string" ? params.id : undefined,
  );

  const trail = useMemo(() => {
    const items: { title: string; href: string }[] = [];
    for (const item of breadcrumb) {
      if (pathname.startsWith(item.href)) {
        items.push({ title: item.title, href: item.href });
        if (
          Array.isArray(
            (item as { items: { title: string; href: string }[] }).items,
          ) &&
          (item as { items: { title: string; href: string }[] }).items.length >
            0
        ) {
          let deepest = null as null | { title: string; href: string };
          for (const sub of (
            item as { items: { title: string; href: string }[] }
          ).items as {
            title: string;
            href: string;
          }[]) {
            if (pathname.startsWith(sub.href)) {
              if (!deepest || sub.href.length > deepest.href.length) {
                deepest = { title: sub.title, href: sub.href };
              }
            }
          }
          if (deepest) items.push(deepest);
        }
      }
    }
    if (items.length === 0 && breadcrumb[0]) {
      items.push({
        title: breadcrumb[0].title as string,
        href: breadcrumb[0].href as string,
      });
    }
    return items;
  }, [breadcrumb, pathname]);

  return (
    <div className="flex h-16 flex-row items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="size-10 rounded-lg border-border bg-card p-0 transition duration-300 hover:bg-muted active:scale-[0.98]"
          onClick={toggleSidebar}
          aria-label="Basculer la barre latérale"
        >
          <PanelLeft size={24} />
        </Button>
        <Separator orientation="vertical" className="mx-2 h-4 bg-accent" />
        <Breadcrumb>
          <BreadcrumbList>
            {trail.map((crumb, index) => {
              const isLast = index === trail.length - 1;
              return (
                <Fragment key={crumb.href}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        render={<Link href={crumb.href}>{crumb.title}</Link>}
                      />
                    )}
                  </BreadcrumbItem>
                  {!isLast ? <BreadcrumbSeparator /> : null}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
