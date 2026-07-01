import {
  getAppointments as getAppointmentsFn,
  getAppointmentsByPatientId as getAppointmentsByPatientIdFn,
  getAppointmentsWithoutReport as getAppointmentsWithoutReportFn,
  getTodayAppointments as getTodayAppointmentsFn,
} from "#/functions/appointments.function";

export function getAppointments() {
  return getAppointmentsFn();
}

export function getAppointmentsByPatientId(patientId: string) {
  return getAppointmentsByPatientIdFn({ data: { patientId } });
}

export function getAppointmentsWithoutReport(daysBack = 30) {
  return getAppointmentsWithoutReportFn({ data: { daysBack } });
}

export function getTodayAppointments() {
  return getTodayAppointmentsFn();
}
