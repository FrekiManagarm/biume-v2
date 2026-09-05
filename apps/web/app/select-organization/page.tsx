import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getOrganizations, getSession } from "#/functions/auth.function";

import { SelectOrganizationView } from "./select-organization-view";

export const metadata: Metadata = {
  title: "Choisir une entreprise | Biume",
  description: "Selectionnez l'entreprise Biume a ouvrir pour cette session.",
};

export default async function Page() {
  const session = await getSession();

  if (!session) {
    redirect("/signin");
  }

  const organizations = await getOrganizations();

  return (
    <SelectOrganizationView session={session} organizations={organizations} />
  );
}
