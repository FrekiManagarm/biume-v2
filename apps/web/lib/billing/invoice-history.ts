/**
 * Mise en forme de l'historique de factures renvoyé par Autumn
 * (`useCustomer({ expand: ["invoices"] })`).
 *
 * Le hook ne trie ni ne traduit rien : il expose la charge utile brute de
 * l'API. On isole ici la logique de présentation pour la tester sans monter la
 * page réglages.
 */

export type BillingStatusTone = "neutral" | "success" | "warning" | "danger";

/**
 * Forme structurelle d'une facture Autumn (`GetCustomerInvoice`). On ne
 * réutilise pas le type du SDK : il est marqué optionnel sur le customer et
 * change de nom entre les points d'entrée `react` et `sdk`.
 */
export type AutumnInvoice = {
  stripeId: string;
  planIds: string[];
  status: string;
  /** Montant dans l'unité majeure de la devise (29.99 pour 29,99 €). */
  total: number;
  currency: string;
  createdAt: number;
  hostedInvoiceUrl?: string | null;
};

export type InvoiceHistoryRow = {
  id: string;
  createdAt: number;
  planLabel: string;
  /** Converti en centimes pour `formatCurrency`, qui divise par 100. */
  amountInCents: number;
  currency: string;
  status: { label: string; tone: BillingStatusTone };
  hostedInvoiceUrl: string | null;
};

const invoiceStatusLabels: Record<
  string,
  { label: string; tone: BillingStatusTone }
> = {
  paid: { label: "Payée", tone: "success" },
  open: { label: "À régler", tone: "warning" },
  draft: { label: "Brouillon", tone: "neutral" },
  void: { label: "Annulée", tone: "neutral" },
  uncollectible: { label: "Impayée", tone: "danger" },
};

export function invoiceStatusPresentation(status: string) {
  return invoiceStatusLabels[status] ?? { label: status, tone: "neutral" };
}

export function toInvoiceHistoryRows(
  invoices: AutumnInvoice[] | undefined | null,
  planLabels: Record<string, string>,
): InvoiceHistoryRow[] {
  if (!invoices?.length) {
    return [];
  }

  return [...invoices]
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((invoice) => {
      const planId = invoice.planIds[0];

      return {
        id: invoice.stripeId,
        createdAt: invoice.createdAt,
        planLabel: planId ? (planLabels[planId] ?? planId) : "Abonnement Biume",
        // `29.99 * 100` vaut 2998.9999999999995 : sans arrondi la facture
        // s'afficherait à un centime près en dessous.
        amountInCents: Math.round(invoice.total * 100),
        currency: invoice.currency.toUpperCase(),
        status: invoiceStatusPresentation(invoice.status),
        hostedInvoiceUrl: invoice.hostedInvoiceUrl ?? null,
      };
    });
}
