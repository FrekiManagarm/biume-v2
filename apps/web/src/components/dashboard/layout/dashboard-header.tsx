"use client";

import { useMemo, Fragment, useState } from "react";
import { Link, useLocation, useParams } from "@tanstack/react-router";
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
import { useCustomer } from "autumn-js/react";
// import { AISearch } from "./ai-search";
// import { AIChatDialog } from "./ai-chat-dialog";

export function DashboardHeader() {
  const { toggleSidebar } = useSidebar();
  const pathname = useLocation({ select: (location) => location.pathname });
  const params = useParams({ strict: false });
  const { data: customer, isLoading } = useCustomer();
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  // Vérifier si le customer a un produit en statut "trialing"
  const trialingProduct = customer?.subscriptions?.find(
    (subscription) => subscription.status === "trialing",
  );

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
    <>
      <div className="flex flex-row justify-between items-center h-16 px-4 py-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-10 w-10 rounded-xl border-border transition-all duration-300 hover:shadow-md p-0 m-0 bg-sidebar"
            onClick={toggleSidebar}
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
                          render={<Link to={crumb.href}>{crumb.title}</Link>}
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
        {/*<div className="flex items-center justify-center gap-2">
          {(trialingProduct && trialingProduct.currentPeriodEnd) ||
          isLoading ? (
            <TrialCountdownComponent
              endTime={trialingProduct?.currentPeriodEnd ?? 0}
              isLoading={isLoading}
            />
          ) : null}
          <AISearch onOpen={() => setAiDialogOpen(true)} />
          <ModeToggle />
        </div>*/}
      </div>
      {/*<AIChatDialog open={aiDialogOpen} onOpenChange={setAiDialogOpen} />*/}
    </>
  );
}
