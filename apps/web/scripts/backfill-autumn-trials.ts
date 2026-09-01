/**
 * Backfill ponctuel : attache le plan mensuel (avec un nouvel essai de 15
 * jours) à toute organisation qui n'a aujourd'hui aucun abonnement Autumn
 * actif ou à l'essai — nécessaire avant d'activer le blocage dur du
 * dashboard, faute de quoi ces organisations seraient bloquées
 * immédiatement.
 *
 * Usage : bun run apps/web/scripts/backfill-autumn-trials.ts
 *
 * Option --dry-run : n'effectue aucune écriture (ni attach Autumn, ni envoi
 * d'email) et se contente de journaliser ce qui serait fait pour chaque
 * organisation. À utiliser pour prévisualiser l'impact avant une exécution
 * réelle contre les organisations de production.
 * Usage : bun run apps/web/scripts/backfill-autumn-trials.ts --dry-run
 */
import { Autumn } from "autumn-js";
import { and, eq } from "drizzle-orm";

import { env } from "@biume/env/server";
import { db } from "../src/lib/utils/db";
import { member } from "@biume/db/schema/index";
import { hasActiveOrTrialingSubscription } from "../src/server/billing/subscription-gate";
import { startOrganizationTrial } from "../src/server/billing/start-trial";
import { createProductionStartTrialDeps } from "../src/server/billing/start-trial.deps";

const isDryRun = process.argv.includes("--dry-run");

const client = new Autumn({ secretKey: env.AUTUMN_SECRET_KEY });
const deps = createProductionStartTrialDeps();

const organizations = await db.query.organization.findMany();

let started = 0;
let skipped = 0;
let failed = 0;

for (const org of organizations) {
  try {
    const customer = await client.customers.get({ customerId: org.id });

    if (hasActiveOrTrialingSubscription(customer.subscriptions)) {
      skipped += 1;
      continue;
    }
  } catch {
    // Customer inexistant côté Autumn : à traiter comme "sans abonnement".
  }

  const owner = await db.query.member.findFirst({
    where: and(eq(member.organizationId, org.id), eq(member.role, "owner")),
    with: { user: true },
  });

  if (!owner?.user?.email) {
    console.warn(`[backfill] ${org.id} (${org.name}) : aucun propriétaire avec email, ignorée`);
    failed += 1;
    continue;
  }

  if (isDryRun) {
    started += 1;
    console.log(
      `[backfill] [DRY RUN] essai serait démarré pour ${org.id} (${org.name}) — propriétaire ${owner.user.email}`,
    );
    continue;
  }

  try {
    await startOrganizationTrial(deps, {
      organizationId: org.id,
      organizationName: org.name,
      ownerEmail: owner.user.email,
      ownerUserId: owner.user.id,
    });
    started += 1;
    console.log(`[backfill] essai démarré pour ${org.id} (${org.name})`);
  } catch (error) {
    failed += 1;
    console.error(`[backfill] échec pour ${org.id} (${org.name})`, error);
  }
}

console.log(
  `[backfill]${isDryRun ? " [DRY RUN]" : ""} terminé : ${started} démarrés, ${skipped} déjà couverts, ${failed} échecs`,
);
