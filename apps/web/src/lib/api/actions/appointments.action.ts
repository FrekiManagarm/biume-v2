import {
  getAppointmentsByPatientId as getAppointmentsByPatientIdFn,
  getAppointmentsWithoutReport as getAppointmentsWithoutReportFn,
} from "#/functions/appointments.function";

export function getAppointmentsByPatientId(patientId: string) {
  return getAppointmentsByPatientIdFn({ data: { patientId } });
}

export function getAppointmentsWithoutReport(daysBack = 30) {
  return getAppointmentsWithoutReportFn({ data: { daysBack } });
}
