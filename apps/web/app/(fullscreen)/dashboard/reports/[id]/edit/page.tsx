import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdvancedReportEditor } from "#/components/dashboard/pages/reports-module/reports-editor";
import { EmptyPanel } from "#/components/dashboard/dashboard-shell";
import { requireActiveBilling } from "#/lib/dashboard-billing-guard";
import { getCurrentOrganization, getSession } from "#/functions/auth.function";
import { getDashboardRedirectTarget } from "#/lib/dashboard-guards";
import { getReportById } from "#/functions/reports.function";
import { Button } from "@biume/ui/components/button";

export const metadata: Metadata = {
  title: "Edition du rapport | Biume",
  description: "Editez les observations et recommandations d'un rapport.",
};

/**
 * Cette page échappe au shell `/dashboard` — elle vit sous
 * `app/(fullscreen)/dashboard/...`, un groupe de routes qui ne change pas
 * l'URL (toujours `/dashboard/reports/:id/edit`) mais sort cette page de
 * l'arbre de fichiers de `app/dashboard/layout.tsx`. Elle n'hérite donc pas
 * de la garde session/organisation que ce layout assure pour toute autre
 * page du dashboard : elle porte, comme sous TanStack (`beforeLoad` de
 * `dashboard_.reports_.$id_.edit.tsx`), sa propre garde — recopiée ici à
 * l'identique. Seul le paywall change de forme : `requireActiveBilling()`
 * remplace l'appel direct à `getOrganizationSubscriptionGateFn`, comme sur
 * toute autre page du dashboard (règle 1). Il est appelé après cette garde,
 * et non en première instruction : `requireActiveBilling()` s'appuie sur
 * `requireOrganizationId()`, qui lève une erreur brute (pas une redirection)
 * si la session ou l'organisation active manquent — exactement ce que la
 * garde ci-dessous exclut avant qu'il ne s'exécute.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/signin");
  }

  if (!session.session.activeOrganizationId) {
    redirect("/select-organization");
  }

  const currentOrganization = await getCurrentOrganization().catch(() => null);
  const redirectTarget = getDashboardRedirectTarget(session, currentOrganization);

  if (redirectTarget) {
    redirect(redirectTarget);
  }

  await requireActiveBilling();

  const { id } = await params;
  const result = await getReportById({ reportId: id });

  if (!result.success || !result.data) {
    return (
      <EmptyPanel
        glyph="R"
        title="Rapport introuvable"
        description="Impossible d'ouvrir l'edition de ce rapport."
        action={
          <Button render={<Link href="/dashboard/reports" />}>
            Retour aux rapports
          </Button>
        }
      />
    );
  }

  return (
    <AdvancedReportEditor
      reportId={id}
      orgId={currentOrganization?.id!}
      initialData={result.data}
    />
  );
}
