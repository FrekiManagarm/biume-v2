import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AssistantPage } from "#/components/dashboard/assistant/assistant-page";
import { requireActiveBilling } from "#/lib/dashboard-billing-guard";

export const metadata: Metadata = {
  title: "Assistant | Biume",
  description:
    "Utilisez l'assistant Biume pour préparer les consultations, structurer les rapports et organiser les prochaines actions.",
};

export default async function Page() {
  await requireActiveBilling();

  // `beforeLoad` (TanStack) masquait cette route en production — inchangé
  // ici, reproduit après la garde de facturation puisque c'est déjà l'ordre
  // dans lequel les deux s'exécutaient (garde du parent `dashboard.tsx`
  // d'abord, `beforeLoad` de la feuille ensuite).
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <AssistantPage />;
}
