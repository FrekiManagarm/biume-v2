import { useMemo, useState, useEffect } from "react";
import type { AdvancedReport } from "@/lib/schemas/advancedReport/advancedReport";
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
    <div className="grid w-full gap-5 pb-8 text-slate-950">
      <ReportsHeader total={stats.total} drafts={stats.brouillons} />

      <ReportsStats
        total={stats.total}
        brouillons={stats.brouillons}
        finalises={stats.finalises}
        rapportsCeMois={stats.rapportsCeMois}
      />

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.5)] sm:p-6">
        <div className="mb-5 grid gap-4 border-b border-slate-200 pb-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm font-medium text-emerald-700">Bibliothèque</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              Comptes rendus de consultation.
            </h2>
          </div>
          <div className="text-sm text-slate-500">
            {reports.length} rapport{pluralSuffix} trouvé{pluralSuffix}
          </div>
        </div>

        <div className="grid gap-5">
          <ReportsFilters
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
          />

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
      </section>
    </div>
  );
}
