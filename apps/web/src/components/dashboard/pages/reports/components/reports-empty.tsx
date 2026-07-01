import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { ReportsHeader } from "./reports-header";
import { Link } from "@tanstack/react-router";

export function ReportsEmpty() {
  return (
    <div className="grid w-full gap-5 pb-8 text-slate-950">
      <ReportsHeader />
      <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-6 py-12 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.5)]">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>Aucun rapport</EmptyTitle>
            <EmptyDescription>
              Vous n&apos;avez pas encore de rapports avancés. Commencez par en
              créer un.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild variant="default" className="h-10">
              <Link to="/dashboard/reports">
                Créer votre premier rapport
                <Plus className="size-4" data-icon="inline-end" />
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  );
}
