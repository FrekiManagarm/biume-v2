"use server";

import {
  updateOrganization as updateOrganizationFn,
  type UpdateOrganizationInput,
} from "#/functions/organization.function";

import { toActionResult } from "./action-result";

export const updateOrganization = toActionResult(
  (input: UpdateOrganizationInput) => updateOrganizationFn(input),
);
