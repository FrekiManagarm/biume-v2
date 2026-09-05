import type { Metadata } from "next";
import Link from "next/link";

import ReportDetails from "#/components/dashboard/pages/reports-module/reports-details";
import { EmptyPanel } from "#/components/dashboard/dashboard-shell";
import { requireActiveBilling } from "#/lib/dashboard-billing-guard";
import { getReportById } from "#/functions/reports.function";
import { Button } from "@biume/ui/components/button";

export const metadata: Metadata = {
  title: "Detail du rapport | Biume",
  description: "Consultez le detail d'un rapport veterinaire.",
};

/**
 * `ReportDetails` ne lit pas de `useSuspenseQuery` : sous TanStack, la route
 * chargeait `reportQueryOptions(id)` elle-même et passait `result.data` en
 * prop. Ici, `getReportById` (lecture serveur, voir règle 2) fait
 * directement ce travail — pas de `QueryClient`/`dehydrate` nécessaire,
 * contrairement à `agenda`/`reports` (liste), qui alimentent un
 * `useSuspenseQuery` interne à leur composant client.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireActiveBilling();

  const { id } = await params;
  const result = await getReportById({ reportId: id });

  if (!result.success || !result.data) {
    return (
      <EmptyPanel
        glyph="R"
        title="Rapport introuvable"
        description="Ce rapport n'existe pas dans la liste de travail actuelle."
        action={
          <Button render={<Link href="/dashboard/reports" />}>
            Retour aux rapports
          </Button>
        }
      />
    );
  }

  return <ReportDetails report={result.data} />;
}
