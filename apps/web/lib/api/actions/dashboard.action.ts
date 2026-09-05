export type {
  MetricResult,
  RecentActivityItem,
  RecentReport,
  SpeciesItem,
} from "#/functions/dashboard.function";
import {
  getClienteleBySpecies as getClienteleBySpeciesFn,
  getDraftReportsMetric as getDraftReportsMetricFn,
  getNewClientsMetric as getNewClientsMetricFn,
  getNewPatientsMetric as getNewPatientsMetricFn,
  getRecentActivity as getRecentActivityFn,
  getRecentReports as getRecentReportsFn,
  getSentReportsMetric as getSentReportsMetricFn,
} from "#/functions/dashboard.function";

export function getNewClientsMetric(days = 90) {
  return getNewClientsMetricFn({ data: { days } });
}

export function getNewPatientsMetric(days = 90) {
  return getNewPatientsMetricFn({ data: { days } });
}

export function getSentReportsMetric(days = 30) {
  return getSentReportsMetricFn({ data: { days } });
}

export function getDraftReportsMetric(days = 30) {
  return getDraftReportsMetricFn({ data: { days } });
}

export function getClienteleBySpecies() {
  return getClienteleBySpeciesFn();
}

export function getRecentActivity(limit = 5) {
  return getRecentActivityFn({ data: { limit } });
}

export function getRecentReports(limit = 5) {
  return getRecentReportsFn({ data: { limit } });
}
