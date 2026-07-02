import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";

interface ReportsNoResultsProps {
  onResetFilters: () => void;
}

export function ReportsNoResults({ onResetFilters }: ReportsNoResultsProps) {
  return (
    <Empty className="rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Search />
        </EmptyMedia>
        <EmptyTitle>Aucun résultat</EmptyTitle>
        <EmptyDescription>
          Aucun rapport ne correspond à vos critères de recherche. Essayez de
          modifier vos filtres.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onResetFilters} className="h-10">
          Réinitialiser les filtres
        </Button>
      </EmptyContent>
    </Empty>
  );
}
