import { queryOptions } from "@tanstack/react-query";

import {
  getAllReports,
  getReportById,
  type GetAllReportsParams,
} from "#/lib/api/actions/reports.action";

export const reportsQueryOptions = (params: GetAllReportsParams = {}) => {
  const normalizedParams = {
    search: params.search ?? "",
    status: params.status ?? "tous",
  };

  return queryOptions({
    queryKey: ["reports", "list", normalizedParams] as const,
    queryFn: () => getAllReports(normalizedParams),
  });
};

export const reportQueryOptions = (reportId: string) =>
  queryOptions({
    queryKey: ["reports", "detail", reportId] as const,
    queryFn: () => getReportById({ reportId }),
  });
