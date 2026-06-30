import { useMemo, useState, useEffect } from "react";
import { type AdvancedReport } from "@biume/db/schema/index";
import { Card, CardContent } from "@biume/ui/components/card";
import {
  ReportsHeader,
  ReportsStats,
  ReportsFilters,
  ReportsTable,
  ReportsPagination,
  ReportsNoResults,
} from "./components";

interface AdvancedReportsTableProps {
  reports: AdvancedReport[];
  // Props de contrôle optionnels (NuQS / URL state)
  searchQuery?: string;
  statusFilter?: string;
  currentPage?: number;
  onSearchChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
}

export function AdvancedReportsTable({
  reports,
  searchQuery: controlledSearchQuery,
  statusFilter: controlledStatusFilter,
  currentPage: controlledCurrentPage,
  onSearchChange,
  onStatusChange,
  onPageChange,
}: AdvancedReportsTableProps) {
  // États internes (fallback si non contrôlé)
  const [uncontrolledSearchQuery, setUncontrolledSearchQuery] = useState("");
  const [uncontrolledStatusFilter, setUncontrolledStatusFilter] =
    useState<string>("tous");
  const [uncontrolledCurrentPage, setUncontrolledCurrentPage] = useState(1);

  // Valeurs effectives
  const searchQuery = controlledSearchQuery ?? uncontrolledSearchQuery;
  const statusFilter = controlledStatusFilter ?? uncontrolledStatusFilter;
  const currentPage = controlledCurrentPage ?? uncontrolledCurrentPage;

  // Handlers effectifs
  const handleSearchChange = onSearchChange ?? setUncontrolledSearchQuery;
  const handleStatusChange = onStatusChange ?? setUncontrolledStatusFilter;
  const handlePageChange = onPageChange ?? setUncontrolledCurrentPage;
  const itemsPerPage = 10;

  // Calcul des statistiques
  const stats = useMemo(() => {
    const total = reports.length;
    const brouillons = reports.filter((r) => r.status === "draft").length;
    const finalises = reports.filter((r) => r.status === "finalized").length;

    // Rapports créés ce mois
    const ceMois = new Date();
    const rapportsCeMois = reports.filter(
      (r) =>
        r.createdAt &&
        r.createdAt.getMonth() === ceMois.getMonth() &&
        r.createdAt.getFullYear() === ceMois.getFullYear(),
    ).length;

    return {
      total,
      brouillons,
      finalises,
      rapportsCeMois,
    };
  }, [reports]);

  // Pagination
  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = reports.slice(startIndex, endIndex);

  // Reset à la page 1 quand on filtre
  useEffect(() => {
    handlePageChange(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter]);

  // Suffixe pluriel pour l'affichage (évite la duplication des ternaires)
  const pluralSuffix = reports.length > 1 ? "s" : "";

  return (
    <div className="space-y-4">
      {/* Header */}
      <ReportsHeader />

      {/* Cartes de statistiques */}
      <ReportsStats
        total={stats.total}
        brouillons={stats.brouillons}
        finalises={stats.finalises}
        rapportsCeMois={stats.rapportsCeMois}
      />

      {/* Contenu */}
      <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
        <CardContent>
          <div className="space-y-4">
            {/* Filtres */}
            <ReportsFilters
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              onSearchChange={handleSearchChange}
              onStatusChange={handleStatusChange}
            />

            {/* Statistiques */}
            <div className="text-muted-foreground text-sm">
              {reports.length} rapport{pluralSuffix} trouvé{pluralSuffix}
            </div>

            {/* Table ou Empty state si filtrage sans résultat */}
            {reports.length === 0 ? (
              <ReportsNoResults
                onResetFilters={() => {
                  handleSearchChange("");
                  handleStatusChange("tous");
                }}
              />
            ) : (
              <>
                <ReportsTable reports={currentReports} />
                <ReportsPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
