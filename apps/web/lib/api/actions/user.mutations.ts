"use server";

import {
  updateUserNotifications as updateUserNotificationsFn,
  type UpdateUserNotificationsInput,
} from "#/functions/user.function";

export async function updateUserNotifications(
  input: UpdateUserNotificationsInput,
) {
  return updateUserNotificationsFn(input);
}
