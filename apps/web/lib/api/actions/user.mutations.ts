"use server";

import {
  updateUserNotifications as updateUserNotificationsFn,
  type UpdateUserNotificationsInput,
} from "#/functions/user.function";

import { toActionResult } from "./action-result";

export const updateUserNotifications = toActionResult(
  (input: UpdateUserNotificationsInput) => updateUserNotificationsFn(input),
);
