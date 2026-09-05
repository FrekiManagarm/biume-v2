import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSession } from "#/functions/auth.function";

import { CreateOrganizationView } from "./create-organization-view";

export const metadata: Metadata = {
  title: "Créer une entreprise | Biume",
  description: "Creez une nouvelle entreprise Biume.",
};

export default async function Page() {
  const session = await getSession();

  if (!session) {
    redirect("/signin");
  }

  return <CreateOrganizationView session={session} />;
}
