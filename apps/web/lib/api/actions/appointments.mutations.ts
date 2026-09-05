"use server";

import {
  createAppointment as createAppointmentFn,
  deleteAppointment as deleteAppointmentFn,
  updateAppointment as updateAppointmentFn,
  type AppointmentIdInput,
  type CreateAppointmentInput,
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
