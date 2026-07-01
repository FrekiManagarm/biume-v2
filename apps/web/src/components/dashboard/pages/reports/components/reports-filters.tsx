import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportsFiltersProps {
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function ReportsFilters({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: ReportsFiltersProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Rechercher par titre, patient ou propriétaire..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 bg-white pl-9"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="h-11 w-full bg-white lg:w-[220px]">
          <SlidersHorizontal className="size-4 text-slate-400" />
          <SelectValue placeholder="Filtrer par statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tous">Tous les statuts</SelectItem>
          <SelectItem value="brouillon">Brouillon</SelectItem>
          <SelectItem value="finalisé">Finalisé</SelectItem>
          <SelectItem value="envoyé">Envoyé</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
