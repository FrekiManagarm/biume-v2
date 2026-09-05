"use server";

import {
  switchActiveOrganization as switchActiveOrganizationFn,
  type SwitchOrganizationInput,
} from "#/functions/auth.function";

import { toActionResult } from "./action-result";

export const switchActiveOrganization = toActionResult(
  (input: SwitchOrganizationInput) => switchActiveOrganizationFn(input),
);
