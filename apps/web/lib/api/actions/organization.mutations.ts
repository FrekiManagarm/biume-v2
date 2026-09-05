"use server";

import {
  updateOrganization as updateOrganizationFn,
  type UpdateOrganizationInput,
} from "#/functions/organization.function";

export async function updateOrganization(input: UpdateOrganizationInput) {
  return updateOrganizationFn(input);
}
