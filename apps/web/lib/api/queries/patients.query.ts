import { queryOptions } from "@tanstack/react-query";

import {
  getAllAnimals,
  getAllPatients,
  type GetAllPatientsParams,
} from "#/lib/api/actions/patients.action";

export const patientsQueryOptions = (params: GetAllPatientsParams = {}) => {
  const normalizedParams = {
    search: params.search ?? "",
    type: params.type ?? "tous",
    page: params.page ?? 1,
    limit: params.limit ?? 250,
  };

  return queryOptions({
    queryKey: ["patients", "list", normalizedParams] as const,
    queryFn: () => getAllPatients(normalizedParams),
  });
};

export const animalsQueryOptions = () =>
  queryOptions({
    queryKey: ["animals", "list"] as const,
    queryFn: () => getAllAnimals(),
  });
