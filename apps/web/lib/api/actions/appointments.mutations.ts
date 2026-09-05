"use server";

import {
  createAppointment as createAppointmentFn,
  deleteAppointment as deleteAppointmentFn,
  getAppointmentsWithoutReport as getAppointmentsWithoutReportFn,
  getTodayAppointments as getTodayAppointmentsFn,
  updateAppointment as updateAppointmentFn,
  type AppointmentIdInput,
  type CreateAppointmentInput,
  type DaysBackInput,
  type UpdateAppointmentInput,
} from "#/functions/appointments.function";

export async function createAppointment(input: CreateAppointmentInput) {
  return createAppointmentFn(input);
}

export async function updateAppointment(input: UpdateAppointmentInput) {
  return updateAppointmentFn(input);
}

export async function deleteAppointment(input: AppointmentIdInput) {
  return deleteAppointmentFn(input);
}

export async function getAppointmentsWithoutReport(input: DaysBackInput) {
  return getAppointmentsWithoutReportFn(input);
}

export async function getTodayAppointments() {
  return getTodayAppointmentsFn();
}
