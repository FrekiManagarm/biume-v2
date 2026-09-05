"use server";

import {
  switchActiveOrganization as switchActiveOrganizationFn,
  type SwitchOrganizationInput,
} from "#/functions/auth.function";

export async function switchActiveOrganization(input: SwitchOrganizationInput) {
  return switchActiveOrganizationFn(input);
}
