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
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Search />
        </EmptyMedia>
        <EmptyTitle>Aucun résultat</EmptyTitle>
        <EmptyDescription>
          Aucun rapport ne correspond à vos critères de recherche.
          Essayez de modifier vos filtres.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onResetFilters}>
          Réinitialiser les filtres
        </Button>
      </EmptyContent>
    </Empty>
  );
}
