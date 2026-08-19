import {
  createAppointment as createAppointmentFn,
  getAppointments as getAppointmentsFn,
  getAppointmentsByPatientId as getAppointmentsByPatientIdFn,
  getAppointmentsWithoutReport as getAppointmentsWithoutReportFn,
  getTodayAppointments as getTodayAppointmentsFn,
} from "#/functions/appointments.function";

export function getAppointments(range: { fromISO: string; toISO: string }) {
  return getAppointmentsFn({ data: range });
}

export function createAppointment(input: {
  atHome?: boolean;
  beginAt: Date;
  endAt: Date;
  note?: string;
  notifyOwner?: boolean;
  patientId: string;
  withReport?: boolean;
}) {
  return createAppointmentFn({ data: input });
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
