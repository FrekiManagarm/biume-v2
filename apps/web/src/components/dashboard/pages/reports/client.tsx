
import { useMemo } from "react";
import type { AdvancedReport } from "@/lib/schemas/advancedReport/advancedReport";
import { AdvancedReportsTable } from ".";

interface ReportsPageClientProps {
  reports: AdvancedReport[];
  searchQuery: string;
  statusFilter: string;
  currentPage: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPageChange: (page: number) => void;
}

export function ReportsPageClient({
  reports,
  searchQuery,
  statusFilter,
  currentPage,
  onSearchChange,
  onStatusChange,
  onPageChange,
}: ReportsPageClientProps) {
  // Assure une page minimale à 1
  const safePage = useMemo(
    () => (currentPage < 1 ? 1 : currentPage),
    [currentPage],
  );

  return (
    <AdvancedReportsTable
      reports={reports}
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      currentPage={safePage}
      onSearchChange={onSearchChange}
      onStatusChange={onStatusChange}
      onPageChange={onPageChange}
    />
  );
}

export default ReportsPageClient;
