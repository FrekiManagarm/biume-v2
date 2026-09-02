import { describe, expect, test } from "vitest";

import { toInvoiceHistoryRows, type AutumnInvoice } from "./invoice-history";

const planLabels = {
  all_inclusive_monthly: "Mensuel",
  all_inclusive_yearly: "Annuel",
};

function invoice(overrides: Partial<AutumnInvoice> = {}): AutumnInvoice {
  return {
    stripeId: "in_1",
    planIds: ["all_inclusive_monthly"],
    status: "paid",
    total: 29.99,
    currency: "eur",
    createdAt: 1_756_000_000_000,
    hostedInvoiceUrl: "https://invoice.stripe.com/in_1",
    ...overrides,
  };
}

describe("toInvoiceHistoryRows", () => {
  test("convertit le total Autumn (unité majeure) en centimes sans dérive flottante", () => {
    // Autumn renvoie `total` dans l'unité majeure (29.99 €), alors que
    // `formatCurrency` de la page réglages attend des centimes. `29.99 * 100`
    // vaut 2998.9999999999995 en IEEE 754 : sans arrondi, la facture
    // s'afficherait « 29,98 € ».
    const [row] = toInvoiceHistoryRows([invoice({ total: 29.99 })], planLabels);

    expect(row?.amountInCents).toBe(2999);
  });

  test("remonte les factures les plus récentes en premier", () => {
    const rows = toInvoiceHistoryRows(
      [
        invoice({ stripeId: "in_ancienne", createdAt: 1_000 }),
        invoice({ stripeId: "in_recente", createdAt: 2_000 }),
      ],
      planLabels,
    );

    expect(rows.map((row) => row.id)).toEqual(["in_recente", "in_ancienne"]);
  });

  test("traduit les identifiants de plan et retombe sur l'identifiant brut", () => {
    const rows = toInvoiceHistoryRows(
      [
        invoice({ stripeId: "in_1", planIds: ["all_inclusive_yearly"] }),
        invoice({ stripeId: "in_2", planIds: ["plan_inconnu"], createdAt: 1 }),
        invoice({ stripeId: "in_3", planIds: [], createdAt: 0 }),
      ],
      planLabels,
    );

    expect(rows.map((row) => row.planLabel)).toEqual([
      "Annuel",
      "plan_inconnu",
      "Abonnement Biume",
    ]);
  });

  test("mappe les statuts Stripe sur un libellé et un ton", () => {
    const statuses: AutumnInvoice["status"][] = [
      "paid",
      "open",
      "draft",
      "void",
      "uncollectible",
      "statut_inconnu",
    ];

    const rows = toInvoiceHistoryRows(
      statuses.map((status, index) =>
        invoice({ stripeId: `in_${index}`, status, createdAt: -index }),
      ),
      planLabels,
    );

    expect(rows.map((row) => row.status)).toEqual([
      { label: "Payée", tone: "success" },
      { label: "À régler", tone: "warning" },
      { label: "Brouillon", tone: "neutral" },
      { label: "Annulée", tone: "neutral" },
      { label: "Impayée", tone: "danger" },
      { label: "statut_inconnu", tone: "neutral" },
    ]);
  });

  test("normalise la devise pour Intl et neutralise une URL absente", () => {
    const [row] = toInvoiceHistoryRows(
      [invoice({ currency: "usd", hostedInvoiceUrl: undefined })],
      planLabels,
    );

    expect(row?.currency).toBe("USD");
    expect(row?.hostedInvoiceUrl).toBeNull();
  });

  test("tolère une liste absente (customer sans expand invoices)", () => {
    expect(toInvoiceHistoryRows(undefined, planLabels)).toEqual([]);
  });
});
