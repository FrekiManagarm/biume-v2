# Extraction structurée et traçabilité — Plan d'implémentation

> **Pour les agents d'exécution :** SOUS-COMPÉTENCE REQUISE : utiliser `superpowers:subagent-driven-development` (recommandé) ou `superpowers:executing-plans` pour exécuter ce plan tâche par tâche. Les étapes utilisent la syntaxe à cases (`- [ ]`) pour le suivi.

**Objectif :** Transformer une transcription corrigée en propositions de rapport dont chacune renvoie au passage de transcription qui la justifie, et permettre au praticien de les confirmer, corriger ou marquer sans objet depuis son téléphone.

**Architecture :** Une table `report_proposal` porte chaque proposition, son état, et l'intervalle de caractères de la transcription dont elle est issue. L'extraction est un appel à modèle contraint par un schéma Zod, exécuté par Trigger.dev après la correction de la transcription. Une proposition confirmée est écrite dans le rapport existant — `advancedReport`, `anatomicalIssue`, `advancedReportRecommandations` — via le domaine déjà en place. Le mobile lit les propositions et enregistre des décisions ; il n'écrit jamais de texte libre dans le rapport.

**Pile technique :** Bun 1.3.11, Drizzle ORM, Trigger.dev 4, `ai` + `@ai-sdk/openai`, Hono, Zod 4, Vitest.

**Spécification :** `docs/superpowers/specs/2026-08-21-mobile-flutter-rewrite-design.md` — sections 7.7 et 10.

**Dépend de :** plan 2 (fondation API) et plan 3 (transcription).

## Contraintes globales

- Gestionnaire de paquets : Bun uniquement.
- `packages/contracts` est la source de vérité des schémas.
- Toute lecture filtre sur `organizationId` en plus de l'identifiant demandé.
- **L'extraction n'invente rien.** Une information absente de la transcription produit une absence de proposition, jamais une proposition plausible.
- **Chaque proposition porte la trace de sa source.** Une proposition sans intervalle vérifiable dans la transcription est rejetée avant d'être écrite.
- **Aucun travail humain n'est écrasé sans demande explicite.** Une régénération ne touche que les propositions encore à vérifier.
- Le mobile **valide, il n'édite pas** : les seules écritures mobiles sont des décisions par section et par proposition.
- L'extraction ne produit **jamais** de diagnostic présenté comme certain. Le vocabulaire des propositions reste celui de l'observation.
- Les états de section réutilisent l'enum existant : `empty`, `proposed`, `needs_confirmation`, `confirmed`, `not_applicable`. Aucun nouvel état.
- Libellés français métier : « À remplir », « À vérifier », « Validé », « Sans objet ».
- `openapi.json` est régénéré et commité à chaque ajout d'endpoint.

---

## Structure des fichiers

| Fichier | Responsabilité |
| --- | --- |
| `packages/contracts/src/proposal.ts` (créer) | Contrats de proposition, de traçabilité et de décision |
| `packages/contracts/src/proposal.test.ts` (créer) | Tests des contrats |
| `packages/db/src/schema/reportProposal.ts` (créer) | Table `report_proposal` |
| `apps/web/src/server/extraction/extraction.schema.ts` (créer) | Schéma de sortie contraint du modèle |
| `apps/web/src/server/extraction/extraction.service.ts` (créer) | Règles pures : vérification des ancres, fusion préservante |
| `apps/web/src/server/extraction/extraction.service.test.ts` (créer) | Tests des règles |
| `apps/web/src/server/extraction/openai-extractor.ts` (créer) | Adaptateur d'extraction |
| `apps/web/src/server/extraction/proposal.repository.ts` (créer) | Persistance |
| `apps/web/src/trigger/extract-report.trigger.ts` (créer) | Orchestration Trigger.dev |
| `apps/web/src/trigger/extract-report.trigger.test.ts` (créer) | Tests d'orchestration |
| `apps/web/src/server/mobile/mobile-api.routes.ts` (modifier) | Routes de propositions et de décisions |
| `apps/web/src/server/mobile/mobile-api.ts` (modifier) | Ports et gestionnaires |

---

### Tâche 1 : Contrats de proposition et de traçabilité

**Fichiers :**
- Créer : `packages/contracts/src/proposal.ts`
- Test : `packages/contracts/src/proposal.test.ts`
- Modifier : `packages/contracts/src/index.ts`

**Interfaces :**
- Consomme : `reportSectionIdSchema`, `reportSectionStateSchema` de `./report`.
- Produit :
  - `proposalKinds`, `proposalKindSchema`, `type ProposalKind`
  - `transcriptAnchorSchema`, `type TranscriptAnchor`
  - `proposalSchema`, `type Proposal`
  - `reportProposalsResponseSchema`
  - `decideProposalRequestSchema`, `decideSectionRequestSchema`
  - `function anchorMatchesTranscript(anchor, transcript): boolean`
  - `reportSectionLabels: Record<ReportSectionState, string>`

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `packages/contracts/src/proposal.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import {
  anchorMatchesTranscript,
  decideProposalRequestSchema,
  proposalSchema,
  reportSectionLabels,
  transcriptAnchorSchema,
} from "./proposal";

const transcript = "Filou présente une tension lombaire à droite depuis dix jours.";

const anchor = {
  start: 20,
  end: 45,
  quote: "tension lombaire à droite",
};

const proposal = {
  id: "proposal-1",
  reportId: "report-1",
  section: "clinical" as const,
  kind: "observation" as const,
  text: "Tension lombaire droite",
  state: "proposed" as const,
  anchor,
  decidedAt: null,
};

describe("ancre de transcription", () => {
  it("accepte un intervalle valide", () => {
    expect(transcriptAnchorSchema.parse(anchor)).toEqual(anchor);
  });

  it("rejette une fin antérieure au début", () => {
    expect(() =>
      transcriptAnchorSchema.parse({ ...anchor, start: 45, end: 20 }),
    ).toThrow();
  });

  it("rejette un intervalle vide", () => {
    expect(() =>
      transcriptAnchorSchema.parse({ ...anchor, start: 20, end: 20 }),
    ).toThrow();
  });

  it("rejette une citation vide", () => {
    expect(() => transcriptAnchorSchema.parse({ ...anchor, quote: "" })).toThrow();
  });
});

describe("vérification de l'ancre contre la transcription", () => {
  it("valide une ancre dont la citation est bien à sa place", () => {
    expect(anchorMatchesTranscript(anchor, transcript)).toBe(true);
  });

  /**
   * C'est le garde-fou central du produit : une proposition dont la citation ne
   * se retrouve pas dans la transcription est une invention du modèle, et elle
   * doit être rejetée avant d'être montrée au praticien.
   */
  it("rejette une citation absente de la transcription", () => {
    expect(
      anchorMatchesTranscript(
        { start: 0, end: 12, quote: "fracture du bassin" },
        transcript,
      ),
    ).toBe(false);
  });

  it("rejette un intervalle qui déborde la transcription", () => {
    expect(
      anchorMatchesTranscript({ start: 0, end: 9999, quote: "Filou" }, transcript),
    ).toBe(false);
  });

  it("tolère un décalage d'indices si la citation reste présente", () => {
    expect(
      anchorMatchesTranscript(
        { start: 0, end: 25, quote: "tension lombaire à droite" },
        transcript,
      ),
    ).toBe(true);
  });
});

describe("contrat de proposition", () => {
  it("accepte une proposition complète", () => {
    expect(proposalSchema.parse(proposal)).toEqual(proposal);
  });

  it("rejette une proposition sans ancre", () => {
    expect(() =>
      proposalSchema.parse({ ...proposal, anchor: undefined }),
    ).toThrow();
  });

  it("rejette un champ non déclaré", () => {
    expect(() =>
      proposalSchema.parse({ ...proposal, confidence: 0.9 }),
    ).toThrow();
  });
});

describe("décision du praticien", () => {
  it("accepte une confirmation", () => {
    expect(decideProposalRequestSchema.parse({ state: "confirmed" })).toEqual({
      state: "confirmed",
    });
  });

  it("accepte un marquage sans objet", () => {
    expect(decideProposalRequestSchema.parse({ state: "not_applicable" })).toEqual({
      state: "not_applicable",
    });
  });

  /**
   * Le mobile valide, il n'édite pas. Repasser une proposition à `proposed`
   * n'est pas une décision de praticien, c'est une régénération.
   */
  it("refuse de replacer une proposition en attente", () => {
    expect(() => decideProposalRequestSchema.parse({ state: "proposed" })).toThrow();
  });
});

describe("libellés métier", () => {
  it("dit le geste en français, jamais l'état machine", () => {
    expect(reportSectionLabels.empty).toBe("À remplir");
    expect(reportSectionLabels.proposed).toBe("À vérifier");
    expect(reportSectionLabels.needs_confirmation).toBe("À vérifier");
    expect(reportSectionLabels.confirmed).toBe("Validé");
    expect(reportSectionLabels.not_applicable).toBe("Sans objet");
  });
});
```

- [ ] **Étape 2 : Lancer les tests et vérifier qu'ils échouent**

Commande : `bun --filter @biume/contracts test -- proposal`

Attendu : ÉCHEC, module introuvable.

- [ ] **Étape 3 : Écrire les contrats**

Créer `packages/contracts/src/proposal.ts` :

```ts
import { z } from "zod";

import {
  reportSectionIdSchema,
  reportSectionStateSchema,
  type ReportSectionState,
} from "./report";

export const proposalKinds = [
  "consultationReason",
  "observation",
  "anatomicalIssue",
  "recommendation",
  "note",
] as const;
export const proposalKindSchema = z.enum(proposalKinds);
export type ProposalKind = z.infer<typeof proposalKindSchema>;

export const proposalTextMaxCharacters = 2000;

/**
 * L'ancre rattache une proposition au passage exact de transcription qui la
 * justifie. Elle porte à la fois des indices et la citation : les indices
 * servent à surligner, la citation sert à vérifier. C'est la citation qui fait
 * foi, parce qu'elle survit à un décalage d'indices.
 */
export const transcriptAnchorSchema = z
  .object({
    start: z.number().int().nonnegative(),
    end: z.number().int().positive(),
    quote: z.string().min(1).max(proposalTextMaxCharacters),
  })
  .strict()
  .refine((anchor) => anchor.end > anchor.start, {
    message: "La fin de l'ancre doit être postérieure à son début.",
  });
export type TranscriptAnchor = z.infer<typeof transcriptAnchorSchema>;

/**
 * Rejette toute proposition dont la citation ne se retrouve pas dans la
 * transcription. C'est le garde-fou qui empêche une invention du modèle
 * d'atteindre le praticien.
 */
export function anchorMatchesTranscript(
  anchor: { start: number; end: number; quote: string },
  transcript: string,
): boolean {
  if (anchor.end > transcript.length) return false;
  return transcript.includes(anchor.quote);
}

export const proposalSchema = z
  .object({
    id: z.string().min(1),
    reportId: z.string().min(1),
    section: reportSectionIdSchema,
    kind: proposalKindSchema,
    text: z.string().min(1).max(proposalTextMaxCharacters),
    state: reportSectionStateSchema,
    anchor: transcriptAnchorSchema,
    decidedAt: z.iso.datetime().nullable(),
  })
  .strict();
export type Proposal = z.infer<typeof proposalSchema>;

export const reportProposalsPageSize = 100;

export const reportProposalsResponseSchema = z
  .object({
    reportId: z.string().min(1),
    transcript: z.string(),
    items: z.array(proposalSchema).max(reportProposalsPageSize),
    sections: z.record(reportSectionIdSchema, reportSectionStateSchema),
  })
  .strict();
export type ReportProposalsResponse = z.infer<
  typeof reportProposalsResponseSchema
>;

/**
 * Un praticien confirme ou écarte. Il ne remet jamais une proposition « en
 * attente » : ce serait une régénération, qui est une action distincte.
 */
export const decideProposalRequestSchema = z
  .object({
    state: z.enum(["confirmed", "not_applicable"]),
  })
  .strict();
export type DecideProposalRequest = z.infer<typeof decideProposalRequestSchema>;

export const decideSectionRequestSchema = z
  .object({
    state: z.enum(["confirmed", "not_applicable"]),
  })
  .strict();
export type DecideSectionRequest = z.infer<typeof decideSectionRequestSchema>;

/**
 * Ce que le praticien lit. Jamais l'état machine : « proposed » ne veut rien
 * dire pour un ostéopathe, « À vérifier » lui dit quoi faire.
 */
export const reportSectionLabels: Record<ReportSectionState, string> = {
  empty: "À remplir",
  proposed: "À vérifier",
  needs_confirmation: "À vérifier",
  confirmed: "Validé",
  not_applicable: "Sans objet",
};
```

- [ ] **Étape 4 : Réexporter, lancer les tests, valider**

```bash
bun --filter @biume/contracts test -- proposal
bun --filter @biume/contracts check-types
rtk git add packages/contracts/src/
rtk git commit -m "feat(contracts): decrire les propositions et leur tracabilite"
```

Attendu : SUCCÈS, 14 tests.

---

### Tâche 2 : Table de propositions

**Fichiers :**
- Créer : `packages/db/src/schema/reportProposal.ts`
- Modifier : `packages/db/src/schema/index.ts`

**Interfaces :**
- Consomme : `proposalKinds` de `@biume/contracts/proposal` ; `reportSectionIds`, `reportSectionStateValues` de `@biume/contracts/report` ; les tables `advancedReport` et `audioCapture`.
- Produit : `reportProposal`, `reportProposalKind`, `reportProposalRelations`, `type PersistedProposal`.

- [ ] **Étape 1 : Écrire la table**

Créer `packages/db/src/schema/reportProposal.ts` :

```ts
import { proposalKinds } from "@biume/contracts/proposal";
import {
  reportSectionIds,
  reportSectionStateValues,
} from "@biume/contracts/report";
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { advancedReport } from "./advancedReport/advancedReport";
import { audioCapture } from "./audioCapture";

export const reportProposalKind = pgEnum("report_proposal_kind", proposalKinds);
export const reportProposalSection = pgEnum(
  "report_proposal_section",
  reportSectionIds,
);
export const reportProposalState = pgEnum(
  "report_proposal_state",
  reportSectionStateValues,
);

/**
 * Une proposition d'extraction, rattachée au rapport qu'elle alimente et à la
 * dictée dont elle est issue.
 *
 * `anchorQuote` n'est pas une commodité d'affichage : c'est la preuve. Les
 * indices permettent de surligner, mais c'est la citation qui permet de
 * vérifier qu'une proposition n'a pas été inventée, et elle survit à une
 * correction de transcription qui décale les indices.
 */
export const reportProposal = pgTable(
  "report_proposal",
  {
    id: text("id").primaryKey(),
    reportId: text("report_id")
      .notNull()
      .references(() => advancedReport.id, { onDelete: "cascade" }),
    captureId: uuid("capture_id").references(() => audioCapture.id, {
      onDelete: "set null",
    }),
    section: reportProposalSection("section").notNull(),
    kind: reportProposalKind("kind").notNull(),
    text: text("text").notNull(),
    state: reportProposalState("state").notNull().default("proposed"),
    anchorStart: integer("anchor_start").notNull(),
    anchorEnd: integer("anchor_end").notNull(),
    anchorQuote: text("anchor_quote").notNull(),
    /** Numéro de passe d'extraction, pour ne régénérer que ce qui n'a pas été décidé. */
    generation: integer("generation").notNull().default(1),
    decidedAt: timestamp("decided_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("report_proposal_report_idx").on(table.reportId),
    index("report_proposal_state_idx").on(table.reportId, table.state),
  ],
);

export const reportProposalRelations = relations(reportProposal, ({ one }) => ({
  report: one(advancedReport, {
    fields: [reportProposal.reportId],
    references: [advancedReport.id],
  }),
  capture: one(audioCapture, {
    fields: [reportProposal.captureId],
    references: [audioCapture.id],
  }),
}));

export type PersistedProposal = typeof reportProposal.$inferSelect;
```

- [ ] **Étape 2 : Exporter, migrer, valider**

Ajouter l'export dans `packages/db/src/schema/index.ts`, puis :

```bash
bun run db:generate
```

Inspecter le SQL : il doit créer une table et trois types enum, et ne rien modifier ailleurs.

```bash
bun run db:migrate
bun --filter @biume/db check-types
rtk git add packages/db/
rtk git commit -m "feat(db): stocker les propositions d'extraction et leurs ancres"
```

---

### Tâche 3 : Règles d'extraction

**Fichiers :**
- Créer : `apps/web/src/server/extraction/extraction.schema.ts`
- Créer : `apps/web/src/server/extraction/extraction.service.ts`
- Test : `apps/web/src/server/extraction/extraction.service.test.ts`

**Interfaces :**
- Consomme : `anchorMatchesTranscript`, `proposalKindSchema`, `type Proposal` de `@biume/contracts/proposal` ; `reportSectionIdSchema` de `@biume/contracts/report`.
- Produit :
  - `extractionOutputSchema` — schéma contraignant la sortie du modèle
  - `function buildExtractionPrompt(transcript: string): string`
  - `function rejectUngroundedProposals(candidates, transcript): { kept: Candidate[]; rejected: Candidate[] }`
  - `function mergePreservingDecisions(existing: Proposal[], fresh: Candidate[]): { toInsert: Candidate[]; toDelete: string[] }`
  - `function deriveSectionStates(proposals: Proposal[]): ReportSectionStates`

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `apps/web/src/server/extraction/extraction.service.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import {
  buildExtractionPrompt,
  deriveSectionStates,
  mergePreservingDecisions,
  rejectUngroundedProposals,
} from "./extraction.service";

const transcript =
  "Filou présente une tension lombaire à droite. Je recommande du repos une semaine.";

const grounded = {
  section: "clinical" as const,
  kind: "observation" as const,
  text: "Tension lombaire droite",
  anchor: { start: 24, end: 49, quote: "tension lombaire à droite" },
};

const invented = {
  section: "clinical" as const,
  kind: "observation" as const,
  text: "Fracture du bassin",
  anchor: { start: 0, end: 18, quote: "fracture du bassin" },
};

describe("amorçage de l'extraction", () => {
  it("porte la transcription", () => {
    expect(buildExtractionPrompt(transcript)).toContain("tension lombaire");
  });

  /**
   * L'instruction de ne rien inventer est la première ligne de défense ; la
   * vérification des ancres est la seconde. Les deux sont nécessaires.
   */
  it("interdit explicitement d'inventer", () => {
    const prompt = buildExtractionPrompt(transcript);

    expect(prompt).toMatch(/n'invente/i);
    expect(prompt).toMatch(/diagnostic/i);
  });
});

describe("rejet des propositions non ancrées", () => {
  it("garde une proposition dont la citation est dans la transcription", () => {
    expect(rejectUngroundedProposals([grounded], transcript).kept).toHaveLength(1);
  });

  it("rejette une proposition inventée", () => {
    const result = rejectUngroundedProposals([invented], transcript);

    expect(result.kept).toHaveLength(0);
    expect(result.rejected).toHaveLength(1);
  });

  it("rejette sans faire échouer l'extraction entière", () => {
    const result = rejectUngroundedProposals([grounded, invented], transcript);

    expect(result.kept).toHaveLength(1);
    expect(result.rejected).toHaveLength(1);
  });

  it("ne produit rien depuis une transcription vide", () => {
    expect(rejectUngroundedProposals([grounded], "").kept).toHaveLength(0);
  });
});

describe("fusion préservant les décisions", () => {
  const confirmed = {
    id: "proposal-1",
    reportId: "report-1",
    section: "clinical" as const,
    kind: "observation" as const,
    text: "Tension lombaire droite",
    state: "confirmed" as const,
    anchor: grounded.anchor,
    decidedAt: "2026-08-21T10:00:00.000Z",
  };

  const pending = { ...confirmed, id: "proposal-2", state: "proposed" as const };

  /**
   * C'est la traduction directe de « Biume prépare, le praticien décide ». Une
   * régénération que le praticien n'a pas demandée ne doit jamais faire
   * disparaître sous ses yeux le travail qu'il vient de valider.
   */
  it("ne supprime jamais une proposition confirmée", () => {
    const { toDelete } = mergePreservingDecisions([confirmed], [grounded]);

    expect(toDelete).not.toContain("proposal-1");
  });

  it("ne supprime jamais une proposition marquée sans objet", () => {
    const { toDelete } = mergePreservingDecisions(
      [{ ...confirmed, state: "not_applicable" }],
      [grounded],
    );

    expect(toDelete).toEqual([]);
  });

  it("remplace les propositions encore à vérifier", () => {
    const { toDelete } = mergePreservingDecisions([pending], [grounded]);

    expect(toDelete).toEqual(["proposal-2"]);
  });

  it("n'insère pas un doublon de ce que le praticien a déjà confirmé", () => {
    const { toInsert } = mergePreservingDecisions([confirmed], [grounded]);

    expect(toInsert).toHaveLength(0);
  });
});

describe("dérivation des états de section", () => {
  const proposal = (
    section: "clinical" | "anatomical" | "recommendations" | "notes",
    state: "proposed" | "confirmed" | "not_applicable",
  ) => ({
    id: `${section}-${state}`,
    reportId: "report-1",
    section,
    kind: "observation" as const,
    text: "x",
    state,
    anchor: grounded.anchor,
    decidedAt: null,
  });

  it("marque à remplir une section sans proposition", () => {
    expect(deriveSectionStates([]).anatomical).toBe("empty");
  });

  it("marque à vérifier une section qui porte une proposition en attente", () => {
    expect(deriveSectionStates([proposal("clinical", "proposed")]).clinical).toBe(
      "proposed",
    );
  });

  it("marque validée une section dont tout est décidé", () => {
    expect(deriveSectionStates([proposal("clinical", "confirmed")]).clinical).toBe(
      "confirmed",
    );
  });

  it("reste à vérifier tant qu'une seule proposition attend", () => {
    expect(
      deriveSectionStates([
        proposal("clinical", "confirmed"),
        { ...proposal("clinical", "proposed"), id: "autre" },
      ]).clinical,
    ).toBe("proposed");
  });

  it("marque sans objet une section entièrement écartée", () => {
    expect(
      deriveSectionStates([proposal("notes", "not_applicable")]).notes,
    ).toBe("not_applicable");
  });
});
```

- [ ] **Étape 2 : Lancer les tests et vérifier qu'ils échouent**

Commande : `bun --filter @biume/web test -- extraction.service`

Attendu : ÉCHEC, module introuvable.

- [ ] **Étape 3 : Écrire le schéma de sortie contraint**

Créer `apps/web/src/server/extraction/extraction.schema.ts` :

```ts
import { proposalKindSchema } from "@biume/contracts/proposal";
import { reportSectionIdSchema } from "@biume/contracts/report";
import { z } from "zod";

/**
 * La sortie du modèle est contrainte par ce schéma, pas espérée. Un modèle qui
 * ne peut produire que cette forme ne peut pas glisser un champ de confiance,
 * un diagnostic ou un commentaire libre dans le rapport.
 */
export const extractionCandidateSchema = z.object({
  section: reportSectionIdSchema,
  kind: proposalKindSchema,
  text: z.string().min(1).max(2000),
  anchor: z.object({
    start: z.number().int().nonnegative(),
    end: z.number().int().positive(),
    quote: z.string().min(1),
  }),
});
export type ExtractionCandidate = z.infer<typeof extractionCandidateSchema>;

export const extractionOutputSchema = z.object({
  proposals: z.array(extractionCandidateSchema).max(40),
});
export type ExtractionOutput = z.infer<typeof extractionOutputSchema>;
```

- [ ] **Étape 4 : Écrire les règles**

Créer `apps/web/src/server/extraction/extraction.service.ts` :

```ts
import {
  anchorMatchesTranscript,
  type Proposal,
} from "@biume/contracts/proposal";
import {
  createInitialReportSectionStates,
  reportSectionIds,
  type ReportSectionStates,
} from "@biume/contracts/report";

import type { ExtractionCandidate } from "./extraction.schema";

export function buildExtractionPrompt(transcript: string): string {
  return [
    "Tu structures la dictée d'un ostéopathe animalier en propositions de compte rendu.",
    "",
    "Règles absolues :",
    "- Tu n'inventes rien. Une information absente de la dictée ne produit aucune proposition.",
    "- Tu ne poses aucun diagnostic et ne transformes jamais une hypothèse en certitude.",
    "- Tu reformules sans ajouter : le vocabulaire reste celui de l'observation.",
    "- Chaque proposition cite mot pour mot le passage de la dictée dont elle est issue.",
    "- Si la dictée ne dit rien d'une section, tu ne produis aucune proposition pour elle.",
    "",
    "Dictée :",
    transcript,
  ].join("\n");
}

/**
 * Seconde ligne de défense, après l'instruction d'amorçage. Une proposition
 * dont la citation ne se retrouve pas dans la transcription est une invention,
 * et une invention n'atteint jamais le praticien.
 *
 * Une invention isolée ne fait pas échouer l'extraction entière : le reste des
 * propositions reste utile, et signaler l'écart vaut mieux que perdre le tout.
 */
export function rejectUngroundedProposals(
  candidates: readonly ExtractionCandidate[],
  transcript: string,
): { kept: ExtractionCandidate[]; rejected: ExtractionCandidate[] } {
  const kept: ExtractionCandidate[] = [];
  const rejected: ExtractionCandidate[] = [];

  for (const candidate of candidates) {
    if (anchorMatchesTranscript(candidate.anchor, transcript)) {
      kept.push(candidate);
    } else {
      rejected.push(candidate);
    }
  }

  return { kept, rejected };
}

const decidedStates = new Set(["confirmed", "not_applicable"]);

function candidateKey(candidate: {
  section: string;
  kind: string;
  text: string;
}) {
  return `${candidate.section}|${candidate.kind}|${candidate.text.trim().toLowerCase()}`;
}

/**
 * Une régénération ne touche que ce que le praticien n'a pas encore décidé.
 * Voir disparaître sous ses yeux une section qu'il vient de valider serait la
 * violation la plus directe du principe « Biume prépare, le praticien décide ».
 */
export function mergePreservingDecisions(
  existing: readonly Proposal[],
  fresh: readonly ExtractionCandidate[],
): { toInsert: ExtractionCandidate[]; toDelete: string[] } {
  const decided = existing.filter((proposal) => decidedStates.has(proposal.state));
  const decidedKeys = new Set(decided.map(candidateKey));

  return {
    toInsert: fresh.filter((candidate) => !decidedKeys.has(candidateKey(candidate))),
    toDelete: existing
      .filter((proposal) => !decidedStates.has(proposal.state))
      .map((proposal) => proposal.id),
  };
}

/**
 * L'état d'une section est déduit de ses propositions, jamais posé à la main :
 * deux sources de vérité finiraient par se contredire.
 */
export function deriveSectionStates(
  proposals: readonly Proposal[],
): ReportSectionStates {
  const states = createInitialReportSectionStates();

  for (const section of reportSectionIds) {
    const inSection = proposals.filter((proposal) => proposal.section === section);
    if (inSection.length === 0) continue;

    if (inSection.some((proposal) => !decidedStates.has(proposal.state))) {
      states[section] = "proposed";
      continue;
    }

    states[section] = inSection.every(
      (proposal) => proposal.state === "not_applicable",
    )
      ? "not_applicable"
      : "confirmed";
  }

  return states;
}
```

- [ ] **Étape 5 : Lancer les tests et valider**

```bash
bun --filter @biume/web test -- extraction.service
rtk git add apps/web/src/server/extraction/
rtk git commit -m "feat(web): ancrer et fusionner les propositions d'extraction"
```

Attendu : SUCCÈS, 15 tests.

---

### Tâche 4 : Adaptateur d'extraction et persistance

**Fichiers :**
- Créer : `apps/web/src/server/extraction/openai-extractor.ts`
- Créer : `apps/web/src/server/extraction/proposal.repository.ts`

**Interfaces :**
- Consomme : `extractionOutputSchema` et `buildExtractionPrompt` de la tâche 3 ; la table `reportProposal` de la tâche 2.
- Produit :
  - `type Extractor = { extract(transcript: string): Promise<ExtractionOutput> }`
  - `function createOpenAiExtractor(): Extractor`
  - `function createProposalRepository(): ProposalRepository` avec `listByReport`, `replace`, `decide`, `decideSection`, `syncSectionStates`

- [ ] **Étape 1 : Écrire l'adaptateur**

Créer `apps/web/src/server/extraction/openai-extractor.ts` :

```ts
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

import { buildExtractionPrompt } from "./extraction.service";
import { extractionOutputSchema, type ExtractionOutput } from "./extraction.schema";

export const extractionProviderId = "openai:gpt-4o";

export type Extractor = {
  extract(transcript: string): Promise<ExtractionOutput>;
};

/**
 * `generateObject` contraint la sortie au schéma plutôt que d'espérer un JSON
 * bien formé. Une sortie non conforme échoue ici, jamais plus loin.
 *
 * La température est nulle : sur de l'extraction, la créativité est
 * exactement le défaut à éliminer.
 */
export function createOpenAiExtractor(): Extractor {
  return {
    async extract(transcript) {
      const { object } = await generateObject({
        model: openai("gpt-4o"),
        schema: extractionOutputSchema,
        temperature: 0,
        prompt: buildExtractionPrompt(transcript),
      });

      return object;
    },
  };
}
```

- [ ] **Étape 2 : Écrire la persistance**

Créer `apps/web/src/server/extraction/proposal.repository.ts`. Trois invariants y sont non négociables :

- `replace` supprime **uniquement** les identifiants que `mergePreservingDecisions` a désignés, jamais un `delete` par `reportId` ;
- `decide` refuse de modifier une proposition déjà décidée ;
- `syncSectionStates` réutilise `buildReportSectionStateRows` de `#/functions/report-domain` et écrit dans `reportSectionState`, la table existante.

```ts
import { createDb } from "@biume/db";
import { reportProposal, reportSectionState } from "@biume/db/schema/index";
import { and, eq, inArray, isNull } from "drizzle-orm";

import { buildReportSectionStateRows } from "#/functions/report-domain";

const db = createDb();

export function createProposalRepository() {
  return {
    async listByReport(reportId: string) {
      return db
        .select()
        .from(reportProposal)
        .where(eq(reportProposal.reportId, reportId))
        .orderBy(reportProposal.createdAt);
    },

    async replace(
      reportId: string,
      toDelete: string[],
      toInsert: Array<typeof reportProposal.$inferInsert>,
    ) {
      await db.transaction(async (tx) => {
        if (toDelete.length > 0) {
          // Suppression ciblée par identifiant : jamais un delete par rapport,
          // qui emporterait les décisions du praticien.
          await tx
            .delete(reportProposal)
            .where(
              and(
                eq(reportProposal.reportId, reportId),
                inArray(reportProposal.id, toDelete),
                isNull(reportProposal.decidedAt),
              ),
            );
        }

        if (toInsert.length > 0) {
          await tx.insert(reportProposal).values(toInsert);
        }
      });
    },

    async decide(
      reportId: string,
      proposalId: string,
      state: "confirmed" | "not_applicable",
    ): Promise<boolean> {
      const [updated] = await db
        .update(reportProposal)
        .set({ state, decidedAt: new Date(), updatedAt: new Date() })
        .where(
          and(
            eq(reportProposal.reportId, reportId),
            eq(reportProposal.id, proposalId),
            // Une décision déjà prise ne se reprend pas par ce chemin.
            isNull(reportProposal.decidedAt),
          ),
        )
        .returning({ id: reportProposal.id });

      return updated !== undefined;
    },

    async syncSectionStates(
      reportId: string,
      states: Parameters<typeof buildReportSectionStateRows>[1],
    ) {
      const rows = buildReportSectionStateRows(reportId, states);

      await db
        .insert(reportSectionState)
        .values(rows)
        .onConflictDoUpdate({
          target: [reportSectionState.reportId, reportSectionState.section],
          set: {
            state: sql`excluded.state`,
            updatedAt: new Date(),
          },
        });
    },
  };
}

export type ProposalRepository = ReturnType<typeof createProposalRepository>;
```

Importer `sql` depuis `drizzle-orm`.

- [ ] **Étape 3 : Vérifier les types et valider**

```bash
bun --filter @biume/web check-types
rtk git add apps/web/src/server/extraction/
rtk git commit -m "feat(web): extraire via le modele et persister les propositions"
```

---

### Tâche 5 : Orchestration de l'extraction

**Fichiers :**
- Créer : `apps/web/src/trigger/extract-report.trigger.ts`
- Test : `apps/web/src/trigger/extract-report.trigger.test.ts`

**Interfaces :**
- Consomme : `Extractor` de la tâche 4 ; `ProposalRepository` de la tâche 4 ; `rejectUngroundedProposals`, `mergePreservingDecisions`, `deriveSectionStates` de la tâche 3.
- Produit :
  - `const extractReportTaskId = "report-extract"`
  - `async function runExtraction(deps: ExtractionDeps, input: { reportId: string; captureId: string }): Promise<ExtractionOutcome>`
  - `type ExtractionOutcome = "extracted" | "nothing_to_extract" | "transcript_not_ready" | "failed"`

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `apps/web/src/trigger/extract-report.trigger.test.ts` :

```ts
import { describe, expect, it, vi } from "vitest";

import { runExtraction } from "./extract-report.trigger";

const input = { reportId: "report-1", captureId: "6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70" };

const transcript = "Filou présente une tension lombaire à droite.";

const candidate = {
  section: "clinical" as const,
  kind: "observation" as const,
  text: "Tension lombaire droite",
  anchor: { start: 24, end: 49, quote: "tension lombaire à droite" },
};

function createDeps(overrides: Record<string, unknown> = {}) {
  return {
    loadTranscript: vi.fn(async () => ({ status: "corrected", text: transcript })),
    repository: {
      listByReport: vi.fn(async () => []),
      replace: vi.fn(async () => {}),
      syncSectionStates: vi.fn(async () => {}),
    },
    extractor: { extract: vi.fn(async () => ({ proposals: [candidate] })) },
    newId: () => "proposal-nouveau",
    now: () => new Date("2026-08-21T10:00:00.000Z"),
    ...overrides,
  } as never;
}

describe("orchestration de l'extraction", () => {
  it("écrit les propositions ancrées", async () => {
    const deps = createDeps();

    expect(await runExtraction(deps, input)).toBe("extracted");
    expect(deps.repository.replace).toHaveBeenCalledWith(
      "report-1",
      [],
      expect.arrayContaining([expect.objectContaining({ text: "Tension lombaire droite" })]),
    );
  });

  /**
   * Le parcours est séquentiel : on corrige la transcription, puis on extrait.
   * Extraire depuis un texte encore en cours produirait un brouillon à jeter.
   */
  it("refuse d'extraire tant que la transcription n'est pas prête", async () => {
    const deps = createDeps({
      loadTranscript: vi.fn(async () => ({ status: "running", text: "" })),
    });

    expect(await runExtraction(deps, input)).toBe("transcript_not_ready");
    expect(deps.extractor.extract).not.toHaveBeenCalled();
  });

  it("ne produit rien depuis une dictée inaudible", async () => {
    const deps = createDeps({
      loadTranscript: vi.fn(async () => ({ status: "inaudible", text: "" })),
    });

    expect(await runExtraction(deps, input)).toBe("nothing_to_extract");
    expect(deps.repository.replace).not.toHaveBeenCalled();
  });

  it("écarte une proposition inventée sans perdre les autres", async () => {
    const deps = createDeps({
      extractor: {
        extract: vi.fn(async () => ({
          proposals: [
            candidate,
            {
              section: "clinical" as const,
              kind: "observation" as const,
              text: "Fracture du bassin",
              anchor: { start: 0, end: 18, quote: "fracture du bassin" },
            },
          ],
        })),
      },
    });

    expect(await runExtraction(deps, input)).toBe("extracted");
    const [, , inserted] = deps.repository.replace.mock.calls[0];
    expect(inserted).toHaveLength(1);
    expect(JSON.stringify(inserted)).not.toContain("Fracture");
  });

  it("préserve une proposition déjà confirmée", async () => {
    const deps = createDeps({
      repository: {
        listByReport: vi.fn(async () => [
          {
            id: "proposal-confirme",
            reportId: "report-1",
            section: "clinical",
            kind: "observation",
            text: "Tension lombaire droite",
            state: "confirmed",
            anchor: candidate.anchor,
            decidedAt: "2026-08-21T09:00:00.000Z",
          },
        ]),
        replace: vi.fn(async () => {}),
        syncSectionStates: vi.fn(async () => {}),
      },
    });

    await runExtraction(deps, input);
    const [, toDelete, toInsert] = deps.repository.replace.mock.calls[0];

    expect(toDelete).not.toContain("proposal-confirme");
    expect(toInsert).toHaveLength(0);
  });

  it("met à jour les états de section après écriture", async () => {
    const deps = createDeps();
    await runExtraction(deps, input);

    expect(deps.repository.syncSectionStates).toHaveBeenCalledWith(
      "report-1",
      expect.objectContaining({ clinical: "proposed", anatomical: "empty" }),
    );
  });

  it("normalise un échec du modèle sans détail technique", async () => {
    const deps = createDeps({
      extractor: {
        extract: vi.fn(async () => {
          throw new Error("openai 429 req_abc123");
        }),
      },
    });

    expect(await runExtraction(deps, input)).toBe("failed");
    expect(deps.repository.replace).not.toHaveBeenCalled();
  });
});
```

- [ ] **Étape 2 : Lancer les tests et vérifier qu'ils échouent**

Commande : `bun --filter @biume/web test -- extract-report`

Attendu : ÉCHEC, module introuvable.

- [ ] **Étape 3 : Écrire l'orchestration**

Créer `apps/web/src/trigger/extract-report.trigger.ts` :

```ts
import type { Proposal } from "@biume/contracts/proposal";
import { task } from "@trigger.dev/sdk/v3";

import type { ExtractionCandidate } from "#/server/extraction/extraction.schema";
import {
  deriveSectionStates,
  mergePreservingDecisions,
  rejectUngroundedProposals,
} from "#/server/extraction/extraction.service";

export const extractReportTaskId = "report-extract";

export type ExtractionOutcome =
  | "extracted"
  | "nothing_to_extract"
  | "transcript_not_ready"
  | "failed";

export type ExtractionDeps = {
  loadTranscript(captureId: string): Promise<{ status: string; text: string } | null>;
  repository: {
    listByReport(reportId: string): Promise<Proposal[]>;
    replace(
      reportId: string,
      toDelete: string[],
      toInsert: Array<Record<string, unknown>>,
    ): Promise<void>;
    syncSectionStates(reportId: string, states: unknown): Promise<void>;
  };
  extractor: { extract(transcript: string): Promise<{ proposals: ExtractionCandidate[] }> };
  newId(): string;
  now(): Date;
};

/**
 * Les seuls états depuis lesquels extraire a un sens. Le parcours du produit
 * est séquentiel : la transcription est visible et corrigeable avant toute
 * interprétation structurée.
 */
const extractableStatuses = new Set(["ready", "corrected"]);

export async function runExtraction(
  deps: ExtractionDeps,
  input: { reportId: string; captureId: string },
): Promise<ExtractionOutcome> {
  const transcript = await deps.loadTranscript(input.captureId);
  if (!transcript) return "failed";

  if (transcript.status === "inaudible") return "nothing_to_extract";
  if (!extractableStatuses.has(transcript.status)) return "transcript_not_ready";
  if (transcript.text.trim().length === 0) return "nothing_to_extract";

  let produced: ExtractionCandidate[];
  try {
    const output = await deps.extractor.extract(transcript.text);
    produced = output.proposals;
  } catch {
    // Le message du fournisseur peut porter un identifiant de requête ou une
    // URL. Rien n'en est conservé.
    return "failed";
  }

  const { kept } = rejectUngroundedProposals(produced, transcript.text);

  const existing = await deps.repository.listByReport(input.reportId);
  const { toInsert, toDelete } = mergePreservingDecisions(existing, kept);

  const now = deps.now();
  await deps.repository.replace(
    input.reportId,
    toDelete,
    toInsert.map((candidate) => ({
      id: deps.newId(),
      reportId: input.reportId,
      captureId: input.captureId,
      section: candidate.section,
      kind: candidate.kind,
      text: candidate.text,
      state: "proposed" as const,
      anchorStart: candidate.anchor.start,
      anchorEnd: candidate.anchor.end,
      anchorQuote: candidate.anchor.quote,
      createdAt: now,
      updatedAt: now,
    })),
  );

  const survivors = existing.filter((proposal) => !toDelete.includes(proposal.id));
  const inserted = toInsert.map(
    (candidate) =>
      ({
        id: "",
        reportId: input.reportId,
        section: candidate.section,
        kind: candidate.kind,
        text: candidate.text,
        state: "proposed",
        anchor: candidate.anchor,
        decidedAt: null,
      }) as Proposal,
  );

  await deps.repository.syncSectionStates(
    input.reportId,
    deriveSectionStates([...survivors, ...inserted]),
  );

  return "extracted";
}

export const extractReportTask = task({
  id: extractReportTaskId,
  run: async (payload: { reportId: string; captureId: string }) => {
    const { createProductionExtractionDeps } = await import(
      "#/server/extraction/extraction.deps"
    );

    return runExtraction(await createProductionExtractionDeps(), payload);
  },
});
```

Créer `apps/web/src/server/extraction/extraction.deps.ts` qui assemble le dépôt, l'extracteur et la lecture de `captureTranscript`, avec `newId` sur `crypto.randomUUID()` et `now` sur `() => new Date()`.

- [ ] **Étape 4 : Lancer les tests et valider**

```bash
bun --filter @biume/web test -- extract-report
bun --filter @biume/web check-types
rtk git add apps/web/src/
rtk git commit -m "feat(web): orchestrer l'extraction en preservant les decisions"
```

Attendu : SUCCÈS, 7 tests.

---

### Tâche 6 : Endpoints de propositions et de décisions

**Fichiers :**
- Modifier : `apps/web/src/server/mobile/mobile-api.routes.ts`
- Modifier : `apps/web/src/server/mobile/mobile-api.ts`
- Modifier : `apps/web/src/server/mobile/mobile-api.ports.ts`
- Test : `apps/web/src/server/mobile/mobile-api.proposals.test.ts` (créer)

**Interfaces :**
- Consomme : `reportProposalsResponseSchema`, `decideProposalRequestSchema`, `decideSectionRequestSchema` de la tâche 1.
- Produit, ajouts à `MobileApiPorts` :
  - `getReportProposals(actor, reportId): Promise<ReportProposalsResponse | null>`
  - `decideProposal(actor, reportId, proposalId, request): Promise<ReportProposalsResponse>`
  - `decideSection(actor, reportId, section, request): Promise<ReportProposalsResponse>`
  - `regenerateProposals(actor, reportId): Promise<ReportProposalsResponse>`
- Produit, routes : `GET /reports/{reportId}/proposals`, `POST /reports/{reportId}/proposals/{proposalId}/decision`, `POST /reports/{reportId}/sections/{section}/decision`, `POST /reports/{reportId}/proposals/regenerate`.

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `apps/web/src/server/mobile/mobile-api.proposals.test.ts` :

```ts
import { reportProposalsResponseSchema } from "@biume/contracts/proposal";
import { describe, expect, it, vi } from "vitest";

import { CaptureServiceError } from "./capture.service";
import { createMobileApiHandler, type MobileApiPorts } from "./mobile-api";

const proposals = {
  reportId: "report-1",
  transcript: "Filou présente une tension lombaire à droite.",
  items: [
    {
      id: "proposal-1",
      reportId: "report-1",
      section: "clinical" as const,
      kind: "observation" as const,
      text: "Tension lombaire droite",
      state: "proposed" as const,
      anchor: { start: 24, end: 49, quote: "tension lombaire à droite" },
      decidedAt: null,
    },
  ],
  sections: {
    clinical: "proposed" as const,
    anatomical: "empty" as const,
    recommendations: "empty" as const,
    notes: "empty" as const,
  },
};

function createPorts(overrides: Partial<MobileApiPorts> = {}): MobileApiPorts {
  return {
    authenticate: vi.fn(async () => ({
      userId: "user-1",
      organization: { id: "org-1", name: "Cabinet Biume" },
    })),
    getReportProposals: vi.fn(async () => proposals),
    decideProposal: vi.fn(async () => proposals),
    decideSection: vi.fn(async () => proposals),
    regenerateProposals: vi.fn(async () => proposals),
    ...overrides,
  } as unknown as MobileApiPorts;
}

const auth = { authorization: "Bearer jeton" };

function get(path: string) {
  return new Request(`https://biume.test/api/mobile/v1${path}`, { headers: auth });
}

function post(path: string, body: unknown) {
  return new Request(`https://biume.test/api/mobile/v1${path}`, {
    method: "POST",
    headers: { ...auth, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("lecture des propositions", () => {
  it("retourne les propositions, la transcription et les états de section", async () => {
    const response = await createMobileApiHandler(createPorts())(
      get("/reports/report-1/proposals"),
    );

    expect(response.status).toBe(200);
    const parsed = reportProposalsResponseSchema.parse(await response.json());
    expect(parsed.items).toHaveLength(1);
    expect(parsed.sections.anatomical).toBe("empty");
  });

  /**
   * La transcription voyage avec les propositions pour que le mobile puisse
   * surligner la source sans second appel. C'est la traçabilité rendue visible.
   */
  it("transporte la transcription qui justifie les propositions", async () => {
    const response = await createMobileApiHandler(createPorts())(
      get("/reports/report-1/proposals"),
    );

    expect((await response.json()).transcript).toContain("tension lombaire");
  });

  it("retourne 404 pour un rapport d'une autre organisation", async () => {
    const ports = createPorts({ getReportProposals: vi.fn(async () => null) });
    const response = await createMobileApiHandler(ports)(
      get("/reports/report-autre/proposals"),
    );

    expect(response.status).toBe(404);
  });
});

describe("décision sur une proposition", () => {
  it("confirme une proposition", async () => {
    const ports = createPorts();
    const response = await createMobileApiHandler(ports)(
      post("/reports/report-1/proposals/proposal-1/decision", { state: "confirmed" }),
    );

    expect(response.status).toBe(200);
    expect(ports.decideProposal).toHaveBeenCalledWith(
      expect.anything(),
      "report-1",
      "proposal-1",
      { state: "confirmed" },
    );
  });

  it("marque une proposition sans objet", async () => {
    const response = await createMobileApiHandler(createPorts())(
      post("/reports/report-1/proposals/proposal-1/decision", {
        state: "not_applicable",
      }),
    );

    expect(response.status).toBe(200);
  });

  /**
   * Le mobile valide, il n'édite pas. Une charge portant un texte est un
   * dépassement du périmètre, et elle est rejetée plutôt qu'ignorée.
   */
  it("rejette une charge qui tenterait de réécrire le texte", async () => {
    const response = await createMobileApiHandler(createPorts())(
      post("/reports/report-1/proposals/proposal-1/decision", {
        state: "confirmed",
        text: "autre chose",
      }),
    );

    expect(response.status).toBe(400);
  });

  it("rejette un état qui n'est pas une décision", async () => {
    const response = await createMobileApiHandler(createPorts())(
      post("/reports/report-1/proposals/proposal-1/decision", { state: "proposed" }),
    );

    expect(response.status).toBe(400);
  });

  it("traduit une décision déjà prise en conflit", async () => {
    const ports = createPorts({
      decideProposal: vi.fn(async () => {
        throw new CaptureServiceError("conflict", false);
      }),
    });
    const response = await createMobileApiHandler(ports)(
      post("/reports/report-1/proposals/proposal-1/decision", { state: "confirmed" }),
    );

    expect(response.status).toBe(409);
  });
});

describe("décision sur une section entière", () => {
  it("marque une section sans objet", async () => {
    const ports = createPorts();
    const response = await createMobileApiHandler(ports)(
      post("/reports/report-1/sections/anatomical/decision", {
        state: "not_applicable",
      }),
    );

    expect(response.status).toBe(200);
    expect(ports.decideSection).toHaveBeenCalledWith(
      expect.anything(),
      "report-1",
      "anatomical",
      { state: "not_applicable" },
    );
  });

  it("rejette une section inconnue", async () => {
    const response = await createMobileApiHandler(createPorts())(
      post("/reports/report-1/sections/inventee/decision", { state: "confirmed" }),
    );

    expect(response.status).toBe(400);
  });
});

describe("régénération", () => {
  it("est une action explicite du praticien", async () => {
    const ports = createPorts();
    const response = await createMobileApiHandler(ports)(
      post("/reports/report-1/proposals/regenerate", {}),
    );

    expect(response.status).toBe(200);
    expect(ports.regenerateProposals).toHaveBeenCalled();
  });
});
```

- [ ] **Étape 2 : Lancer les tests et vérifier qu'ils échouent**

Commande : `bun --filter @biume/web test -- mobile-api.proposals`

Attendu : ÉCHEC, routes en 404.

- [ ] **Étape 3 : Décrire les routes**

Dans `mobile-api.routes.ts`, ajouter `reportIdParamsSchema`, `proposalParamsSchema` et `sectionParamsSchema` (ce dernier validé par `reportSectionIdSchema`, ce qui produit le 400 attendu sur une section inconnue), puis les quatre `createRoute` sur le modèle des précédentes.

- [ ] **Étape 4 : Brancher les gestionnaires**

Dans `mobile-api.ts`, ajouter les quatre gestionnaires. Celui de lecture retourne `fail(c, "not_found")` quand le port répond `null` ; les trois autres valident contre `reportProposalsResponseSchema`.

- [ ] **Étape 5 : Implémenter les ports**

Dans `mobile-api.ports.ts`, chaque implémentation vérifie **d'abord** que `advancedReport.createdBy = actor.organizationId`, et lève `CaptureServiceError("not_found", false)` sinon. Un rapport contient des données de santé : un identifiant deviné ne doit jamais en livrer.

`regenerateProposals` déclenche `extractReportTask` puis relit l'état courant. `decideProposal` et `decideSection` recalculent les états de section via `deriveSectionStates` après écriture, jamais avant.

- [ ] **Étape 6 : Lancer les tests, régénérer le contrat, valider**

```bash
bun --filter @biume/web test
bun --filter @biume/web emit-openapi
bun --filter @biume/web test -- openapi-drift
rtk git add apps/web/ 
rtk git commit -m "feat(web): exposer les propositions et les decisions au mobile"
```

Attendu : SUCCÈS.

---

### Tâche 7 : Écriture des propositions confirmées dans le rapport

Une proposition confirmée doit devenir du contenu de rapport réel, sans quoi le web et le PDF ne verront jamais le travail fait sur mobile.

**Fichiers :**
- Créer : `apps/web/src/server/extraction/apply-proposals.service.ts`
- Test : `apps/web/src/server/extraction/apply-proposals.service.test.ts`

**Interfaces :**
- Consomme : `type Proposal` de `@biume/contracts/proposal`.
- Produit : `function buildReportPatchFromProposals(proposals: readonly Proposal[]): ReportPatch` où `ReportPatch` porte `consultationReason`, `notes`, `recommendations: string[]` et `anatomicalNotes: string[]`.

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `apps/web/src/server/extraction/apply-proposals.service.test.ts` :

```ts
import type { Proposal } from "@biume/contracts/proposal";
import { describe, expect, it } from "vitest";

import { buildReportPatchFromProposals } from "./apply-proposals.service";

const anchor = { start: 0, end: 5, quote: "Filou" };

const proposal = (
  overrides: Partial<Proposal> & Pick<Proposal, "kind" | "text" | "state">,
): Proposal => ({
  id: `p-${overrides.text}`,
  reportId: "report-1",
  section: "clinical",
  anchor,
  decidedAt: null,
  ...overrides,
} as Proposal);

describe("application des propositions confirmées", () => {
  it("n'applique que ce qui est confirmé", () => {
    const patch = buildReportPatchFromProposals([
      proposal({ kind: "recommendation", text: "Repos une semaine", state: "confirmed" }),
      proposal({ kind: "recommendation", text: "Balades courtes", state: "proposed" }),
    ]);

    expect(patch.recommendations).toEqual(["Repos une semaine"]);
  });

  it("n'applique jamais une proposition écartée", () => {
    const patch = buildReportPatchFromProposals([
      proposal({ kind: "recommendation", text: "Repos", state: "not_applicable" }),
    ]);

    expect(patch.recommendations).toEqual([]);
  });

  it("porte le motif de consultation", () => {
    const patch = buildReportPatchFromProposals([
      proposal({ kind: "consultationReason", text: "Boiterie postérieure", state: "confirmed" }),
    ]);

    expect(patch.consultationReason).toBe("Boiterie postérieure");
  });

  /**
   * Plusieurs observations confirmées forment les notes du rapport, dans
   * l'ordre où elles ont été proposées : c'est l'ordre de la dictée, donc celui
   * du raisonnement du praticien.
   */
  it("assemble les observations dans l'ordre", () => {
    const patch = buildReportPatchFromProposals([
      proposal({ kind: "observation", text: "Tension lombaire", state: "confirmed" }),
      proposal({ kind: "observation", text: "Amyotrophie postérieure", state: "confirmed" }),
    ]);

    expect(patch.notes).toBe("Tension lombaire\nAmyotrophie postérieure");
  });

  it("ne produit rien depuis une liste vide", () => {
    expect(buildReportPatchFromProposals([])).toEqual({
      consultationReason: null,
      notes: null,
      recommendations: [],
      anatomicalNotes: [],
    });
  });
});
```

- [ ] **Étape 2 : Lancer les tests et vérifier qu'ils échouent**

Commande : `bun --filter @biume/web test -- apply-proposals`

Attendu : ÉCHEC, module introuvable.

- [ ] **Étape 3 : Écrire le service**

Créer `apps/web/src/server/extraction/apply-proposals.service.ts` :

```ts
import type { Proposal } from "@biume/contracts/proposal";

export type ReportPatch = {
  consultationReason: string | null;
  notes: string | null;
  recommendations: string[];
  anatomicalNotes: string[];
};

/**
 * Seules les propositions confirmées deviennent du contenu de rapport. Ce qui
 * est en attente n'existe pas encore pour le praticien, et ce qu'il a écarté ne
 * doit jamais réapparaître dans un document qu'il enverra au propriétaire.
 */
export function buildReportPatchFromProposals(
  proposals: readonly Proposal[],
): ReportPatch {
  const confirmed = proposals.filter((proposal) => proposal.state === "confirmed");

  const byKind = (kind: Proposal["kind"]) =>
    confirmed.filter((proposal) => proposal.kind === kind).map((p) => p.text);

  const observations = byKind("observation");
  const reasons = byKind("consultationReason");

  return {
    consultationReason: reasons[0] ?? null,
    notes: observations.length > 0 ? observations.join("\n") : null,
    recommendations: byKind("recommendation"),
    anatomicalNotes: byKind("anatomicalIssue"),
  };
}
```

- [ ] **Étape 4 : Brancher sur la persistance existante**

Dans `mobile-api.ports.ts`, après chaque décision, appliquer le patch au rapport en réutilisant `report-update.persistence.ts` — la persistance atomique existante et déjà testée — plutôt que d'écrire un second chemin d'écriture de rapport.

- [ ] **Étape 5 : Lancer la suite complète et valider**

```bash
bun --filter @biume/web test
bun --filter @biume/web check-types
rtk git add apps/web/src/server/extraction/ apps/web/src/server/mobile/
rtk git commit -m "feat(web): ecrire les propositions confirmees dans le rapport"
```

Attendu : SUCCÈS, dont les 5 nouveaux tests.

---

### Tâche 8 : Vérification de bout en bout sur une vraie dictée

- [ ] **Étape 1 : Rejouer la dictée du plan 3**

Reprendre la dictée réelle enregistrée au plan 3, tâche 8. La faire transcrire, corriger la transcription, puis déclencher l'extraction.

- [ ] **Étape 2 : Vérifier la traçabilité, proposition par proposition**

Pour chaque proposition retournée par `GET /reports/{reportId}/proposals`, vérifier que `anchor.quote` se retrouve **mot pour mot** dans la transcription, et que la proposition dit bien ce que la citation dit.

Consigner dans le document de spécification, en fin de section 7.7 : le nombre de propositions produites, le nombre écartées par la vérification d'ancre, et le nombre qui, bien qu'ancrées, disent plus que la dictée.

**Ce troisième nombre est le seul indicateur de sécurité qui compte.** Une proposition ancrée mais surinterprétée passe tous les garde-fous automatiques et n'est arrêtée que par le praticien.

- [ ] **Étape 3 : Vérifier la préservation**

Confirmer deux propositions, en écarter une, puis appeler `POST /reports/{reportId}/proposals/regenerate`.

Attendu : les deux confirmées et celle écartée sont intactes ; seules les propositions en attente ont été remplacées. Si ce n'est pas le cas, **arrêter** : c'est la violation la plus grave que ce plan puisse produire.

- [ ] **Étape 4 : Valider**

```bash
rtk git add docs/superpowers/specs/
rtk git commit -m "docs: consigner la qualite d'extraction sur une dictee reelle"
```

---

## Critères d'acceptation du plan

- Une transcription corrigée produit des propositions rattachées aux bonnes sections, sans intervention manuelle.
- Chaque proposition porte une citation qui se retrouve mot pour mot dans la transcription.
- Une proposition dont la citation est absente est écartée avant d'atteindre le praticien, sans faire échouer les autres.
- Une régénération ne supprime jamais une proposition confirmée ni une proposition écartée, ce qui a été vérifié sur une dictée réelle.
- Une dictée inaudible produit zéro proposition, jamais un brouillon plausible.
- Les états de section sont déduits des propositions, jamais posés à la main.
- Le mobile ne peut pas réécrire le texte d'une proposition : une telle charge est rejetée en 400.
- Un rapport n'est jamais lisible depuis une autre organisation.
- Les propositions confirmées apparaissent dans le rapport web et dans le PDF.
