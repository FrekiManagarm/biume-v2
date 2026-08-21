# Questionnaire de suivi et accès propriétaire — Plan d'implémentation

> **Pour les agents d'exécution :** SOUS-COMPÉTENCE REQUISE : utiliser `superpowers:subagent-driven-development` (recommandé) ou `superpowers:executing-plans` pour exécuter ce plan tâche par tâche. Les étapes utilisent la syntaxe à cases (`- [ ]`) pour le suivi.

**Objectif :** Fermer la boucle du produit — le propriétaire ouvre un lien sécurisé sans créer de compte, lit le compte rendu, répond à un questionnaire court à l'échéance choisie par le praticien, et seules les réponses qui demandent une action remontent.

**Architecture :** Un lien de partage opaque pointe vers une version figée du rapport. Le premier accès depuis un appareil déclenche un code à usage unique envoyé par courriel ; une session propriétaire de 30 jours en découle. Un questionnaire est programmé à la finalisation du rapport et envoyé par Trigger.dev à l'échéance. Les alertes sont produites par des **règles explicites** sur les réponses ; l'analyse du texte libre peut suggérer un signal supplémentaire, mais elle doit dire pourquoi et ne produit jamais de diagnostic.

**Pile technique :** Bun 1.3.11, TanStack Start, Drizzle ORM, Trigger.dev 4, React Email, Hono, Zod 4, Vitest.

**Spécification :** `docs/superpowers/specs/2026-08-21-mobile-flutter-rewrite-design.md` — sections 4, 7.10 et 10, et `PRODUCT.md` — « Suivi post-séance » et « Expérience propriétaire ».

**Dépend de :** plan 2 (fondation API) et plan 4 (extraction, pour la finalisation du rapport).

## Contraintes globales

- Gestionnaire de paquets : Bun uniquement.
- **Le propriétaire n'installe rien et ne crée aucun compte.** Toute conception qui exige un mot de passe est hors sujet.
- Un jeton de partage est **opaque, imprévisible et à entropie suffisante**. Il ne dérive jamais d'un identifiant de rapport, de client ou d'animal.
- Un code à usage unique est stocké **haché**, jamais en clair. Il expire, il est limité en tentatives, et il est invalidé à la première réussite.
- Une session propriétaire vaut 30 jours au maximum et ne donne accès qu'**à un seul rapport partagé**, jamais au dossier.
- Le partage porte sur une **version figée** du rapport. Modifier le rapport après partage ne change pas ce que le propriétaire a lu.
- Les alertes reposent sur des **règles explicites**. Aucune analyse de texte ne produit d'alerte à elle seule, et aucune ne produit de diagnostic.
- Le questionnaire est standardisé mais modifiable par le praticien avant envoi.
- Aucune notification n'est émise pour un événement passif. Seules les situations qui demandent une action remontent.
- Vocabulaire : le propriétaire n'est pas un professionnel. Aucun terme clinique non expliqué dans son interface.
- `openapi.json` est régénéré et commité à chaque ajout d'endpoint.

---

## Structure des fichiers

| Fichier | Responsabilité |
| --- | --- |
| `packages/contracts/src/followup.ts` (créer) | Questionnaire, réponses, règles d'alerte |
| `packages/contracts/src/followup.test.ts` (créer) | Tests des contrats et des règles |
| `packages/db/src/schema/ownerAccess.ts` (créer) | Lien de partage, défi OTP, session propriétaire |
| `packages/db/src/schema/followup.ts` (créer) | Questionnaire, réponse, alerte |
| `apps/web/src/server/owner/owner-access.service.ts` (créer) | Règles pures d'accès : entropie, expiration, tentatives |
| `apps/web/src/server/owner/owner-access.service.test.ts` (créer) | Tests des règles d'accès |
| `apps/web/src/server/owner/owner-access.repository.ts` (créer) | Persistance de l'accès |
| `apps/web/src/server/followup/followup.service.ts` (créer) | Règles d'alerte et programmation |
| `apps/web/src/server/followup/followup.service.test.ts` (créer) | Tests des règles d'alerte |
| `apps/web/src/routes/r.$token.tsx` (créer) | Page propriétaire : OTP, rapport, questionnaire |
| `apps/web/src/routes/api/owner/$.ts` (créer) | API publique de l'espace propriétaire |
| `apps/web/src/server/owner/owner-api.ts` (créer) | Application Hono de l'espace propriétaire |
| `apps/web/src/server/owner/owner-api.test.ts` (créer) | Tests de l'API propriétaire |
| `packages/transactional/emails/FollowUpQuestionnaireEmail.tsx` (créer) | Courriel du questionnaire |
| `packages/transactional/emails/OwnerAccessCodeEmail.tsx` (créer) | Courriel du code d'accès |
| `apps/web/src/trigger/send-followup.trigger.ts` (créer) | Envoi à l'échéance |
| `apps/web/src/trigger/send-followup.trigger.test.ts` (créer) | Tests d'orchestration |
| `apps/web/src/server/mobile/mobile-api.routes.ts` (modifier) | Routes de programmation et de suivis actionnables |
| `apps/web/src/server/mobile/mobile-api.ts` (modifier) | Ports et gestionnaires |

---

### Tâche 1 : Contrats du questionnaire et règles d'alerte

**Fichiers :**
- Créer : `packages/contracts/src/followup.ts`
- Test : `packages/contracts/src/followup.test.ts`
- Modifier : `packages/contracts/src/index.ts`

**Interfaces :**
- Consomme : rien.
- Produit :
  - `evolutionValues`, `evolutionSchema`, `type Evolution`
  - `followUpQuestionnaireSchema`, `followUpAnswerSchema`
  - `alertReasons`, `alertReasonSchema`, `type AlertReason`
  - `function evaluateAlertRules(answer): AlertReason[]`
  - `followUpStatuses`, `canTransitionFollowUp(from, to)`
  - `followUpMinDelayDays = 3`, `followUpMaxDelayDays = 90`
  - `defaultFollowUpQuestionnaire`

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `packages/contracts/src/followup.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import {
  canTransitionFollowUp,
  defaultFollowUpQuestionnaire,
  evaluateAlertRules,
  followUpAnswerSchema,
  followUpQuestionnaireSchema,
} from "./followup";

const answer = {
  evolution: "better" as const,
  reaction: "",
  wantsContact: false,
};

describe("questionnaire par défaut", () => {
  /**
   * Le modèle du PRODUCT.md : une échelle simple, un commentaire libre, et une
   * demande explicite de contact. Trois questions, pas une de plus — un
   * propriétaire répond depuis son téléphone, souvent d'une main.
   */
  it("pose exactement les trois questions du modèle", () => {
    expect(defaultFollowUpQuestionnaire.questions).toHaveLength(3);
    expect(followUpQuestionnaireSchema.parse(defaultFollowUpQuestionnaire)).toBeTruthy();
  });

  it("parle au propriétaire, pas au praticien", () => {
    const texte = JSON.stringify(defaultFollowUpQuestionnaire);

    expect(texte).not.toMatch(/dysfonction|amyotrophie|sacro-iliaque/i);
  });

  it("reste modifiable par le praticien", () => {
    expect(
      followUpQuestionnaireSchema.parse({
        ...defaultFollowUpQuestionnaire,
        questions: defaultFollowUpQuestionnaire.questions.map((question) =>
          question.kind === "text" ? { ...question, label: "Autre chose ?" } : question,
        ),
      }),
    ).toBeTruthy();
  });
});

describe("réponse du propriétaire", () => {
  it("accepte une réponse minimale", () => {
    expect(followUpAnswerSchema.parse(answer)).toEqual(answer);
  });

  it("rejette une évolution hors échelle", () => {
    expect(() =>
      followUpAnswerSchema.parse({ ...answer, evolution: "excellent" }),
    ).toThrow();
  });

  it("rejette un champ non déclaré", () => {
    expect(() =>
      followUpAnswerSchema.parse({ ...answer, reportId: "report-1" }),
    ).toThrow();
  });
});

describe("règles d'alerte", () => {
  it("ne signale rien quand tout va mieux", () => {
    expect(evaluateAlertRules(answer)).toEqual([]);
  });

  /**
   * Trois règles explicites, et elles seules déclenchent une alerte : une
   * dégradation déclarée, une réaction rapportée, une demande de contact. Le
   * praticien doit pouvoir prédire ce qui va le déranger.
   */
  it("signale une dégradation déclarée", () => {
    expect(evaluateAlertRules({ ...answer, evolution: "worse" })).toContain(
      "declared_worsening",
    );
  });

  it("signale une réaction rapportée", () => {
    expect(
      evaluateAlertRules({ ...answer, reaction: "Il a boité deux jours après." }),
    ).toContain("reported_reaction");
  });

  it("signale une demande de contact", () => {
    expect(evaluateAlertRules({ ...answer, wantsContact: true })).toContain(
      "contact_requested",
    );
  });

  it("cumule les motifs sans les confondre", () => {
    const reasons = evaluateAlertRules({
      evolution: "worse",
      reaction: "Beaucoup de fatigue.",
      wantsContact: true,
    });

    expect(reasons).toHaveLength(3);
    expect(new Set(reasons).size).toBe(3);
  });

  it("ignore un commentaire vide ou blanc", () => {
    expect(evaluateAlertRules({ ...answer, reaction: "   " })).toEqual([]);
  });

  /**
   * « Pareil » n'est pas une dégradation. Alerter dessus noierait les vraies
   * alertes, et le praticien cesserait de les lire.
   */
  it("ne signale pas une stabilité", () => {
    expect(evaluateAlertRules({ ...answer, evolution: "same" })).toEqual([]);
  });
});

describe("cycle de vie du suivi", () => {
  it("suit le chemin nominal", () => {
    expect(canTransitionFollowUp("scheduled", "sent")).toBe(true);
    expect(canTransitionFollowUp("sent", "answered")).toBe(true);
  });

  it("permet d'annuler un suivi non encore envoyé", () => {
    expect(canTransitionFollowUp("scheduled", "cancelled")).toBe(true);
  });

  /**
   * Une réponse de propriétaire est une donnée reçue. Rien ne doit pouvoir la
   * défaire, ni une annulation, ni un renvoi.
   */
  it("rend la réponse terminale", () => {
    expect(canTransitionFollowUp("answered", "sent")).toBe(false);
    expect(canTransitionFollowUp("answered", "cancelled")).toBe(false);
  });
});
```

- [ ] **Étape 2 : Lancer les tests et vérifier qu'ils échouent**

Commande : `bun --filter @biume/contracts test -- followup`

Attendu : ÉCHEC, module introuvable.

- [ ] **Étape 3 : Écrire les contrats**

Créer `packages/contracts/src/followup.ts` :

```ts
import { z } from "zod";

export const followUpMinDelayDays = 3;
export const followUpMaxDelayDays = 90;
export const followUpReactionMaxCharacters = 1000;

export const evolutionValues = ["better", "same", "worse"] as const;
export const evolutionSchema = z.enum(evolutionValues);
export type Evolution = z.infer<typeof evolutionSchema>;

export const followUpAnswerSchema = z
  .object({
    evolution: evolutionSchema,
    reaction: z.string().max(followUpReactionMaxCharacters),
    wantsContact: z.boolean(),
  })
  .strict();
export type FollowUpAnswer = z.infer<typeof followUpAnswerSchema>;

export const followUpQuestionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("scale"),
    id: z.literal("evolution"),
    label: z.string().min(1),
    options: z.array(z.object({ value: evolutionSchema, label: z.string().min(1) })).length(3),
  }),
  z.object({
    kind: z.literal("text"),
    id: z.literal("reaction"),
    label: z.string().min(1),
  }),
  z.object({
    kind: z.literal("boolean"),
    id: z.literal("wantsContact"),
    label: z.string().min(1),
  }),
]);

export const followUpQuestionnaireSchema = z
  .object({
    questions: z.array(followUpQuestionSchema).length(3),
  })
  .strict();
export type FollowUpQuestionnaire = z.infer<typeof followUpQuestionnaireSchema>;

/**
 * Standardisé mais modifiable. Le propriétaire n'est pas un professionnel : les
 * libellés disent ce qu'il observe, jamais ce que le praticien en déduira.
 */
export const defaultFollowUpQuestionnaire: FollowUpQuestionnaire = {
  questions: [
    {
      kind: "scale",
      id: "evolution",
      label: "Comment va votre animal depuis la séance ?",
      options: [
        { value: "better", label: "Mieux" },
        { value: "same", label: "Pareil" },
        { value: "worse", label: "Moins bien" },
      ],
    },
    {
      kind: "text",
      id: "reaction",
      label: "Avez-vous remarqué une réaction ou un changement particulier ?",
    },
    {
      kind: "boolean",
      id: "wantsContact",
      label: "Souhaitez-vous être recontacté ?",
    },
  ],
};

export const alertReasons = [
  "declared_worsening",
  "reported_reaction",
  "contact_requested",
] as const;
export const alertReasonSchema = z.enum(alertReasons);
export type AlertReason = z.infer<typeof alertReasonSchema>;

/**
 * Trois règles explicites, et elles seules. Le praticien doit pouvoir prédire
 * ce qui va le déranger : une alerte imprévisible finit ignorée, et une alerte
 * ignorée ne protège personne.
 *
 * « Pareil » n'est pas une dégradation : alerter dessus noierait les vraies
 * alertes.
 */
export function evaluateAlertRules(answer: FollowUpAnswer): AlertReason[] {
  const reasons: AlertReason[] = [];

  if (answer.evolution === "worse") reasons.push("declared_worsening");
  if (answer.reaction.trim().length > 0) reasons.push("reported_reaction");
  if (answer.wantsContact) reasons.push("contact_requested");

  return reasons;
}

export const followUpStatuses = [
  "scheduled",
  "sent",
  "answered",
  "cancelled",
] as const;
export const followUpStatusSchema = z.enum(followUpStatuses);
export type FollowUpStatus = z.infer<typeof followUpStatusSchema>;

/**
 * `answered` est terminal : une réponse de propriétaire est une donnée reçue,
 * et rien ne doit pouvoir la défaire.
 */
const allowedTransitions = {
  scheduled: ["sent", "cancelled"],
  sent: ["answered", "cancelled"],
  answered: [],
  cancelled: [],
} as const satisfies Record<FollowUpStatus, readonly FollowUpStatus[]>;

export function canTransitionFollowUp(
  from: FollowUpStatus,
  to: FollowUpStatus,
): boolean {
  return allowedTransitions[from].some((allowed) => allowed === to);
}

const isoDateTimeSchema = z.iso.datetime();

export const scheduleFollowUpRequestSchema = z
  .object({
    dueAt: isoDateTimeSchema,
    questionnaire: followUpQuestionnaireSchema,
  })
  .strict();

export const followUpSchema = z
  .object({
    id: z.string().min(1),
    reportId: z.string().min(1),
    patientName: z.string().min(1),
    ownerName: z.string().min(1),
    status: followUpStatusSchema,
    dueAt: isoDateTimeSchema,
    answeredAt: isoDateTimeSchema.nullable(),
    answer: followUpAnswerSchema.nullable(),
    alertReasons: z.array(alertReasonSchema),
    handledAt: isoDateTimeSchema.nullable(),
  })
  .strict();
export type FollowUp = z.infer<typeof followUpSchema>;

export const actionableFollowUpsResponseSchema = z
  .object({
    items: z.array(followUpSchema).max(50),
    nextCursor: z.string().min(1).nullable(),
  })
  .strict();
```

- [ ] **Étape 4 : Réexporter, lancer les tests, valider**

```bash
bun --filter @biume/contracts test -- followup
bun --filter @biume/contracts check-types
rtk git add packages/contracts/src/
rtk git commit -m "feat(contracts): decrire le questionnaire de suivi et ses alertes"
```

Attendu : SUCCÈS, 15 tests.

---

### Tâche 2 : Règles d'accès propriétaire

Toute la sécurité décidable est isolée ici, testable sans base ni réseau.

**Fichiers :**
- Créer : `apps/web/src/server/owner/owner-access.service.ts`
- Test : `apps/web/src/server/owner/owner-access.service.test.ts`

**Interfaces :**
- Consomme : `node:crypto`.
- Produit :
  - `const shareTokenBytes = 32`, `const otpDigits = 6`
  - `const otpTtlMs = 10 * 60 * 1000`, `const otpMaxAttempts = 5`
  - `const ownerSessionTtlMs = 30 * 24 * 60 * 60 * 1000`
  - `function generateShareToken(): string`
  - `function generateOtp(): string`
  - `function hashOtp(code: string, salt: string): string`
  - `function verifyOtp(input: { code: string; salt: string; hash: string }): boolean`
  - `function classifyChallenge(challenge, now): "valid" | "expired" | "too_many_attempts" | "consumed"`

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `apps/web/src/server/owner/owner-access.service.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import {
  classifyChallenge,
  generateOtp,
  generateShareToken,
  hashOtp,
  otpMaxAttempts,
  otpTtlMs,
  verifyOtp,
} from "./owner-access.service";

const now = new Date("2026-08-21T10:00:00.000Z");

describe("jeton de partage", () => {
  /**
   * Le lien est la seule barrière avant l'OTP. Un jeton court ou dérivé d'un
   * identifiant de rapport serait énumérable, et chaque lien mène à des données
   * de santé.
   */
  it("porte assez d'entropie pour ne pas être énumérable", () => {
    expect(generateShareToken().length).toBeGreaterThanOrEqual(43);
  });

  it("ne se répète jamais", () => {
    const tokens = new Set(Array.from({ length: 500 }, generateShareToken));

    expect(tokens.size).toBe(500);
  });

  it("reste utilisable dans une URL", () => {
    expect(generateShareToken()).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe("code à usage unique", () => {
  it("fait six chiffres", () => {
    expect(generateOtp()).toMatch(/^\d{6}$/);
  });

  it("couvre toute la plage, y compris les codes à zéros de tête", () => {
    const codes = Array.from({ length: 2000 }, generateOtp);

    expect(codes.every((code) => code.length === 6)).toBe(true);
    expect(new Set(codes).size).toBeGreaterThan(1500);
  });

  it("ne se vérifie que contre son propre sel", () => {
    const hash = hashOtp("123456", "sel-a");

    expect(verifyOtp({ code: "123456", salt: "sel-a", hash })).toBe(true);
    expect(verifyOtp({ code: "123456", salt: "sel-b", hash })).toBe(false);
    expect(verifyOtp({ code: "654321", salt: "sel-a", hash })).toBe(false);
  });

  /**
   * Le code n'est jamais stocké en clair : une fuite de base ne doit pas
   * donner accès aux comptes rendus.
   */
  it("ne laisse pas le code apparaître dans son empreinte", () => {
    expect(hashOtp("123456", "sel")).not.toContain("123456");
  });
});

describe("classification d'un défi", () => {
  const challenge = {
    expiresAt: new Date(now.getTime() + otpTtlMs),
    attempts: 0,
    consumedAt: null,
  };

  it("accepte un défi frais", () => {
    expect(classifyChallenge(challenge, now)).toBe("valid");
  });

  it("refuse un défi expiré", () => {
    expect(
      classifyChallenge({ ...challenge, expiresAt: new Date(now.getTime() - 1) }, now),
    ).toBe("expired");
  });

  it("refuse après trop de tentatives", () => {
    expect(classifyChallenge({ ...challenge, attempts: otpMaxAttempts }, now)).toBe(
      "too_many_attempts",
    );
  });

  it("refuse un défi déjà consommé", () => {
    expect(classifyChallenge({ ...challenge, consumedAt: now }, now)).toBe(
      "consumed",
    );
  });

  /**
   * L'ordre compte : un défi à la fois expiré et épuisé doit répondre la même
   * chose au propriétaire dans les deux cas, sans lui apprendre combien de
   * tentatives il reste.
   */
  it("ne révèle pas l'état interne par l'ordre des refus", () => {
    expect(
      classifyChallenge(
        { ...challenge, expiresAt: new Date(now.getTime() - 1), attempts: otpMaxAttempts },
        now,
      ),
    ).toBe("expired");
  });
});
```

- [ ] **Étape 2 : Lancer les tests et vérifier qu'ils échouent**

Commande : `bun --filter @biume/web test -- owner-access.service`

Attendu : ÉCHEC, module introuvable.

- [ ] **Étape 3 : Écrire les règles**

Créer `apps/web/src/server/owner/owner-access.service.ts` :

```ts
import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

/** 256 bits : le lien est la seule barrière avant le code. */
export const shareTokenBytes = 32;
export const otpDigits = 6;
export const otpTtlMs = 10 * 60 * 1000;
export const otpMaxAttempts = 5;
export const ownerSessionTtlMs = 30 * 24 * 60 * 60 * 1000;

export function generateShareToken(): string {
  return randomBytes(shareTokenBytes).toString("base64url");
}

/**
 * `randomInt` couvre toute la plage, zéros de tête compris. Tirer six chiffres
 * un par un ou tronquer un nombre biaiserait la distribution.
 */
export function generateOtp(): string {
  return String(randomInt(0, 10 ** otpDigits)).padStart(otpDigits, "0");
}

export function hashOtp(code: string, salt: string): string {
  return createHmac("sha256", salt).update(code).digest("hex");
}

/**
 * Comparaison à temps constant : une comparaison naïve laisserait mesurer le
 * nombre de caractères corrects.
 */
export function verifyOtp(input: {
  code: string;
  salt: string;
  hash: string;
}): boolean {
  const expected = Buffer.from(input.hash, "hex");
  const actual = Buffer.from(hashOtp(input.code, input.salt), "hex");

  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export type ChallengeState = {
  expiresAt: Date;
  attempts: number;
  consumedAt: Date | null;
};

/**
 * L'expiration est testée en premier, délibérément. Le propriétaire reçoit le
 * même refus qu'il ait épuisé ses tentatives ou dépassé le délai, ce qui ne lui
 * apprend rien sur l'état interne.
 */
export function classifyChallenge(
  challenge: ChallengeState,
  now: Date,
): "valid" | "expired" | "too_many_attempts" | "consumed" {
  if (challenge.consumedAt !== null) return "consumed";
  if (challenge.expiresAt.getTime() <= now.getTime()) return "expired";
  if (challenge.attempts >= otpMaxAttempts) return "too_many_attempts";
  return "valid";
}
```

Le test « ne révèle pas l'état interne par l'ordre des refus » attend `expired` avant `too_many_attempts` : vérifier que l'ordre des `if` le produit, et ajuster le test **ou** le code pour qu'ils s'accordent — mais ne jamais retirer le test.

- [ ] **Étape 4 : Lancer les tests et valider**

```bash
bun --filter @biume/web test -- owner-access.service
rtk git add apps/web/src/server/owner/
rtk git commit -m "feat(web): poser les regles d'acces proprietaire sans compte"
```

Attendu : SUCCÈS, 12 tests.

---

### Tâche 3 : Tables d'accès et de suivi

**Fichiers :**
- Créer : `packages/db/src/schema/ownerAccess.ts`
- Créer : `packages/db/src/schema/followup.ts`
- Modifier : `packages/db/src/schema/index.ts`

**Interfaces :**
- Consomme : `followUpStatuses`, `alertReasons` de `@biume/contracts/followup` ; `reportSharedVersion`, `advancedReport`, `clients`, `organization`.
- Produit : `reportShareLink`, `ownerAccessChallenge`, `ownerSession`, `followUp`, `followUpAlert`.

- [ ] **Étape 1 : Écrire les tables d'accès**

Créer `packages/db/src/schema/ownerAccess.ts` :

```ts
import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { reportSharedVersion } from "./advancedReport/reportSharedVersion";
import { clients } from "./clients";

/**
 * Le lien pointe vers une version figée du rapport, jamais vers le rapport
 * vivant : ce que le propriétaire a lu ne doit pas changer sous ses yeux quand
 * le praticien retouche son document.
 *
 * `token` est la clé primaire et porte 256 bits d'entropie. Il n'est jamais
 * dérivé d'un identifiant de rapport, de client ou d'animal.
 */
export const reportShareLink = pgTable(
  "report_share_link",
  {
    token: text("token").primaryKey(),
    sharedVersionId: text("shared_version_id")
      .notNull()
      .references(() => reportSharedVersion.id, { onDelete: "cascade" }),
    ownerId: text("owner_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    revokedAt: timestamp("revoked_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("report_share_link_owner_idx").on(table.ownerId)],
);

/**
 * Un défi par appareil et par lien. Le code est stocké haché avec un sel
 * propre : une fuite de base ne doit pas ouvrir les comptes rendus.
 */
export const ownerAccessChallenge = pgTable(
  "owner_access_challenge",
  {
    id: text("id").primaryKey(),
    token: text("token")
      .notNull()
      .references(() => reportShareLink.token, { onDelete: "cascade" }),
    deviceId: text("device_id").notNull(),
    codeHash: text("code_hash").notNull(),
    codeSalt: text("code_salt").notNull(),
    attempts: integer("attempts").notNull().default(0),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    consumedAt: timestamp("consumed_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("owner_access_challenge_token_idx").on(table.token, table.deviceId)],
);

/**
 * Une session ne donne accès qu'à un seul lien de partage, jamais au dossier du
 * propriétaire. Un propriétaire qui reçoit trois comptes rendus a trois
 * sessions distinctes, et en révoquer une ne touche pas les autres.
 */
export const ownerSession = pgTable(
  "owner_session",
  {
    id: text("id").primaryKey(),
    token: text("token")
      .notNull()
      .references(() => reportShareLink.token, { onDelete: "cascade" }),
    sessionSecret: text("session_secret").notNull().unique(),
    deviceId: text("device_id").notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    revokedAt: timestamp("revoked_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("owner_session_token_idx").on(table.token)],
);

export const reportShareLinkRelations = relations(reportShareLink, ({ one, many }) => ({
  sharedVersion: one(reportSharedVersion, {
    fields: [reportShareLink.sharedVersionId],
    references: [reportSharedVersion.id],
  }),
  owner: one(clients, {
    fields: [reportShareLink.ownerId],
    references: [clients.id],
  }),
  sessions: many(ownerSession),
}));

export type PersistedShareLink = typeof reportShareLink.$inferSelect;
export type PersistedOwnerSession = typeof ownerSession.$inferSelect;
```

- [ ] **Étape 2 : Écrire les tables de suivi**

Créer `packages/db/src/schema/followup.ts` :

```ts
import { alertReasons, followUpStatuses } from "@biume/contracts/followup";
import type { FollowUpAnswer, FollowUpQuestionnaire } from "@biume/contracts/followup";
import { relations } from "drizzle-orm";
import { index, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { advancedReport } from "./advancedReport/advancedReport";
import { organization } from "./organization";
import { reportShareLink } from "./ownerAccess";

export const followUpStatus = pgEnum("follow_up_status", followUpStatuses);
export const followUpAlertReason = pgEnum("follow_up_alert_reason", alertReasons);

/**
 * Un suivi par compte rendu partagé. Le questionnaire est figé au moment de la
 * programmation : modifier le modèle par défaut plus tard ne change pas ce
 * qu'un propriétaire a déjà reçu.
 */
export const followUp = pgTable(
  "follow_up",
  {
    id: text("id").primaryKey(),
    reportId: text("report_id")
      .notNull()
      .references(() => advancedReport.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    shareToken: text("share_token").references(() => reportShareLink.token, {
      onDelete: "set null",
    }),
    status: followUpStatus("status").notNull().default("scheduled"),
    questionnaire: jsonb("questionnaire").$type<FollowUpQuestionnaire>().notNull(),
    answer: jsonb("answer").$type<FollowUpAnswer>(),
    dueAt: timestamp("due_at", { mode: "date" }).notNull(),
    sentAt: timestamp("sent_at", { mode: "date" }),
    answeredAt: timestamp("answered_at", { mode: "date" }),
    /** Posé par le praticien quand il a traité l'alerte. */
    handledAt: timestamp("handled_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("follow_up_due_idx").on(table.status, table.dueAt),
    index("follow_up_org_idx").on(table.organizationId, table.status),
  ],
);

export const followUpAlert = pgTable(
  "follow_up_alert",
  {
    id: text("id").primaryKey(),
    followUpId: text("follow_up_id")
      .notNull()
      .references(() => followUp.id, { onDelete: "cascade" }),
    reason: followUpAlertReason("reason").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("follow_up_alert_followup_idx").on(table.followUpId)],
);

export const followUpRelations = relations(followUp, ({ one, many }) => ({
  report: one(advancedReport, {
    fields: [followUp.reportId],
    references: [advancedReport.id],
  }),
  alerts: many(followUpAlert),
}));

export type PersistedFollowUp = typeof followUp.$inferSelect;
```

- [ ] **Étape 3 : Exporter, migrer, valider**

Ajouter les exports dans `packages/db/src/schema/index.ts`, puis :

```bash
bun run db:generate
```

Inspecter le SQL : cinq tables et trois types enum créés, rien de supprimé ni modifié ailleurs.

```bash
bun run db:migrate
bun --filter @biume/db check-types
rtk git add packages/db/
rtk git commit -m "feat(db): stocker l'acces proprietaire et le suivi post-seance"
```

---

### Tâche 4 : Règles de programmation et d'alerte

**Fichiers :**
- Créer : `apps/web/src/server/followup/followup.service.ts`
- Test : `apps/web/src/server/followup/followup.service.test.ts`

**Interfaces :**
- Consomme : `evaluateAlertRules`, `followUpMinDelayDays`, `followUpMaxDelayDays`, `canTransitionFollowUp` de `@biume/contracts/followup`.
- Produit :
  - `function validateDueDate(dueAt: Date, now: Date): "ok" | "too_soon" | "too_far" | "past"`
  - `function isActionable(followUp): boolean`
  - `function summarizeAlert(reasons: AlertReason[]): string`

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `apps/web/src/server/followup/followup.service.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import {
  isActionable,
  summarizeAlert,
  validateDueDate,
} from "./followup.service";

const now = new Date("2026-08-21T10:00:00.000Z");
const inDays = (days: number) =>
  new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

describe("validation de l'échéance", () => {
  it("accepte une échéance raisonnable", () => {
    expect(validateDueDate(inDays(7), now)).toBe("ok");
  });

  it("refuse une échéance passée", () => {
    expect(validateDueDate(inDays(-1), now)).toBe("past");
  });

  /**
   * Un questionnaire envoyé le lendemain d'une séance ne mesure rien : le
   * corps n'a pas eu le temps de répondre au travail. Trois jours est le
   * plancher métier.
   */
  it("refuse une échéance trop proche", () => {
    expect(validateDueDate(inDays(1), now)).toBe("too_soon");
  });

  it("refuse une échéance trop lointaine", () => {
    expect(validateDueDate(inDays(200), now)).toBe("too_far");
  });

  it("accepte exactement les bornes", () => {
    expect(validateDueDate(inDays(3), now)).toBe("ok");
    expect(validateDueDate(inDays(90), now)).toBe("ok");
  });
});

describe("suivi actionnable", () => {
  const answered = {
    status: "answered" as const,
    alertReasons: ["contact_requested" as const],
    handledAt: null,
  };

  /**
   * Ce que le praticien doit voir : une réponse qui a déclenché une règle et
   * qu'il n'a pas encore traitée. Rien d'autre ne mérite de l'interrompre.
   */
  it("signale une alerte non traitée", () => {
    expect(isActionable(answered)).toBe(true);
  });

  it("ne signale plus une alerte traitée", () => {
    expect(isActionable({ ...answered, handledAt: now })).toBe(false);
  });

  it("ne signale pas une réponse sans motif d'alerte", () => {
    expect(isActionable({ ...answered, alertReasons: [] })).toBe(false);
  });

  it("ne signale pas un suivi encore en attente de réponse", () => {
    expect(isActionable({ ...answered, status: "sent" })).toBe(false);
  });
});

describe("résumé d'alerte", () => {
  it("dit ce qui s'est passé, en français, sans jargon", () => {
    expect(summarizeAlert(["declared_worsening"])).toBe(
      "Le propriétaire signale que son animal va moins bien.",
    );
    expect(summarizeAlert(["contact_requested"])).toBe(
      "Le propriétaire souhaite être recontacté.",
    );
    expect(summarizeAlert(["reported_reaction"])).toBe(
      "Le propriétaire a observé une réaction après la séance.",
    );
  });

  it("compose plusieurs motifs sans les empiler bêtement", () => {
    const summary = summarizeAlert(["declared_worsening", "contact_requested"]);

    expect(summary).toContain("moins bien");
    expect(summary).toContain("recontacté");
  });

  it("ne dit rien sans motif", () => {
    expect(summarizeAlert([])).toBe("");
  });
});
```

- [ ] **Étape 2 : Lancer les tests et vérifier qu'ils échouent**

Commande : `bun --filter @biume/web test -- followup.service`

Attendu : ÉCHEC, module introuvable.

- [ ] **Étape 3 : Écrire les règles**

Créer `apps/web/src/server/followup/followup.service.ts` :

```ts
import {
  followUpMaxDelayDays,
  followUpMinDelayDays,
  type AlertReason,
  type FollowUpStatus,
} from "@biume/contracts/followup";

const dayMs = 24 * 60 * 60 * 1000;

/**
 * Le plancher de trois jours est métier, pas technique : un questionnaire
 * envoyé le lendemain ne mesure rien, le corps n'a pas eu le temps de répondre
 * au travail de la séance.
 */
export function validateDueDate(
  dueAt: Date,
  now: Date,
): "ok" | "too_soon" | "too_far" | "past" {
  const delta = dueAt.getTime() - now.getTime();

  if (delta <= 0) return "past";
  if (delta < followUpMinDelayDays * dayMs) return "too_soon";
  if (delta > followUpMaxDelayDays * dayMs) return "too_far";
  return "ok";
}

/**
 * Ce qui mérite d'interrompre un praticien : une réponse arrivée, qui a
 * déclenché une règle explicite, et qu'il n'a pas encore traitée. Rien d'autre.
 */
export function isActionable(followUp: {
  status: FollowUpStatus;
  alertReasons: readonly AlertReason[];
  handledAt: Date | string | null;
}): boolean {
  return (
    followUp.status === "answered" &&
    followUp.alertReasons.length > 0 &&
    followUp.handledAt === null
  );
}

const alertSentences: Record<AlertReason, string> = {
  declared_worsening: "Le propriétaire signale que son animal va moins bien.",
  reported_reaction: "Le propriétaire a observé une réaction après la séance.",
  contact_requested: "Le propriétaire souhaite être recontacté.",
};

export function summarizeAlert(reasons: readonly AlertReason[]): string {
  return reasons.map((reason) => alertSentences[reason]).join(" ");
}
```

- [ ] **Étape 4 : Lancer les tests et valider**

```bash
bun --filter @biume/web test -- followup.service
rtk git add apps/web/src/server/followup/
rtk git commit -m "feat(web): decider ce qui merite d'interrompre le praticien"
```

Attendu : SUCCÈS, 12 tests.

---

### Tâche 5 : API publique de l'espace propriétaire

C'est la seule surface non authentifiée du produit, et elle mène à des données de santé. Chaque décision y est prise pour un attaquant, pas pour un utilisateur.

**Fichiers :**
- Créer : `apps/web/src/server/owner/owner-api.ts`
- Créer : `apps/web/src/server/owner/owner-api.ports.ts`
- Test : `apps/web/src/server/owner/owner-api.test.ts`
- Créer : `apps/web/src/routes/api/owner/$.ts`

**Interfaces :**
- Consomme : les règles de la tâche 2 ; les contrats de la tâche 1.
- Produit :
  - `function createOwnerApiHandler(ports: OwnerApiPorts, options?: { now?: () => Date }): (request: Request) => Promise<Response>`
  - Routes : `POST /api/owner/v1/{token}/challenge`, `POST /api/owner/v1/{token}/verify`, `GET /api/owner/v1/{token}/report`, `POST /api/owner/v1/{token}/answer`

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `apps/web/src/server/owner/owner-api.test.ts` :

```ts
import { describe, expect, it, vi } from "vitest";

import { createOwnerApiHandler, type OwnerApiPorts } from "./owner-api";

const token = "jeton-de-partage-opaque-suffisamment-long-pour-etre-realiste";

function createPorts(overrides: Partial<OwnerApiPorts> = {}): OwnerApiPorts {
  return {
    findShareLink: vi.fn(async () => ({
      token,
      ownerEmail: "camille@example.test",
      revokedAt: null,
    })),
    issueChallenge: vi.fn(async () => ({ sent: true })),
    verifyChallenge: vi.fn(async () => ({ sessionSecret: "secret-de-session" })),
    resolveSession: vi.fn(async () => ({ token })),
    loadSharedReport: vi.fn(async () => ({
      patientName: "Filou",
      createdAt: "2026-08-21T10:00:00.000Z",
      clinical: [],
      anatomical: [],
      recommendations: [],
    })),
    saveAnswer: vi.fn(async () => ({ recorded: true })),
    ...overrides,
  } as unknown as OwnerApiPorts;
}

function post(path: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(`https://biume.test/api/owner/v1${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function get(path: string, headers: Record<string, string> = {}) {
  return new Request(`https://biume.test/api/owner/v1${path}`, { headers });
}

describe("demande de code", () => {
  it("envoie un code pour un lien valide", async () => {
    const response = await createOwnerApiHandler(createPorts())(
      post(`/${token}/challenge`, { deviceId: "appareil-1" }),
    );

    expect(response.status).toBe(200);
  });

  /**
   * La réponse est identique pour un lien valide et pour un lien inexistant.
   * Distinguer les deux transformerait l'API en oracle qui confirme qu'un
   * compte rendu existe.
   */
  it("répond pareil pour un lien inexistant", async () => {
    const ports = createPorts({ findShareLink: vi.fn(async () => null) });
    const inexistant = await createOwnerApiHandler(ports)(
      post(`/${token}/challenge`, { deviceId: "appareil-1" }),
    );
    const valide = await createOwnerApiHandler(createPorts())(
      post(`/${token}/challenge`, { deviceId: "appareil-1" }),
    );

    expect(inexistant.status).toBe(valide.status);
    expect(await inexistant.text()).toBe(await valide.text());
  });

  it("répond pareil pour un lien révoqué", async () => {
    const ports = createPorts({
      findShareLink: vi.fn(async () => ({
        token,
        ownerEmail: "camille@example.test",
        revokedAt: new Date(),
      })),
    });
    const response = await createOwnerApiHandler(ports)(
      post(`/${token}/challenge`, { deviceId: "appareil-1" }),
    );

    expect(response.status).toBe(200);
  });

  it("ne renvoie jamais le code dans sa réponse", async () => {
    const response = await createOwnerApiHandler(createPorts())(
      post(`/${token}/challenge`, { deviceId: "appareil-1" }),
    );

    expect(await response.text()).not.toMatch(/\d{6}/);
  });

  it("ne révèle pas l'adresse à qui le code est envoyé", async () => {
    const response = await createOwnerApiHandler(createPorts())(
      post(`/${token}/challenge`, { deviceId: "appareil-1" }),
    );

    expect(await response.text()).not.toContain("camille@example.test");
  });
});

describe("vérification du code", () => {
  it("ouvre une session sur un code correct", async () => {
    const response = await createOwnerApiHandler(createPorts())(
      post(`/${token}/verify`, { deviceId: "appareil-1", code: "123456" }),
    );

    expect(response.status).toBe(200);
    expect((await response.json()).sessionSecret).toBeTruthy();
  });

  it("refuse un code incorrect sans dire combien il en reste", async () => {
    const ports = createPorts({ verifyChallenge: vi.fn(async () => null) });
    const response = await createOwnerApiHandler(ports)(
      post(`/${token}/verify`, { deviceId: "appareil-1", code: "000000" }),
    );

    expect(response.status).toBe(401);
    const body = await response.text();
    expect(body).not.toMatch(/tentative|restant|\d\s*\/\s*5/i);
  });

  it("rejette un code qui n'a pas la bonne forme", async () => {
    const response = await createOwnerApiHandler(createPorts())(
      post(`/${token}/verify`, { deviceId: "appareil-1", code: "abc" }),
    );

    expect(response.status).toBe(400);
  });
});

describe("lecture du compte rendu", () => {
  it("sert le rapport à une session valide", async () => {
    const response = await createOwnerApiHandler(createPorts())(
      get(`/${token}/report`, { authorization: "Bearer secret-de-session" }),
    );

    expect(response.status).toBe(200);
    expect((await response.json()).patientName).toBe("Filou");
  });

  it("refuse sans session", async () => {
    const response = await createOwnerApiHandler(createPorts())(
      get(`/${token}/report`),
    );

    expect(response.status).toBe(401);
  });

  /**
   * Une session ouverte sur un lien ne donne accès qu'à ce lien. Un
   * propriétaire qui a reçu trois comptes rendus a trois sessions.
   */
  it("refuse une session ouverte sur un autre lien", async () => {
    const ports = createPorts({
      resolveSession: vi.fn(async () => ({ token: "un-autre-jeton" })),
    });
    const response = await createOwnerApiHandler(ports)(
      get(`/${token}/report`, { authorization: "Bearer secret-de-session" }),
    );

    expect(response.status).toBe(401);
  });

  it("ne transporte aucune donnée du cabinet ni d'autre patient", async () => {
    const response = await createOwnerApiHandler(createPorts())(
      get(`/${token}/report`, { authorization: "Bearer secret-de-session" }),
    );
    const body = JSON.stringify(await response.json());

    expect(body).not.toContain("organizationId");
    expect(body).not.toContain("practitionerId");
    expect(body).not.toContain("reportId");
  });
});

describe("réponse au questionnaire", () => {
  it("enregistre une réponse valide", async () => {
    const response = await createOwnerApiHandler(createPorts())(
      post(
        `/${token}/answer`,
        { evolution: "worse", reaction: "Fatigue.", wantsContact: true },
        { authorization: "Bearer secret-de-session" },
      ),
    );

    expect(response.status).toBe(200);
  });

  it("refuse une réponse sans session", async () => {
    const response = await createOwnerApiHandler(createPorts())(
      post(`/${token}/answer`, {
        evolution: "better",
        reaction: "",
        wantsContact: false,
      }),
    );

    expect(response.status).toBe(401);
  });

  it("rejette une évolution hors échelle", async () => {
    const response = await createOwnerApiHandler(createPorts())(
      post(
        `/${token}/answer`,
        { evolution: "excellent", reaction: "", wantsContact: false },
        { authorization: "Bearer secret-de-session" },
      ),
    );

    expect(response.status).toBe(400);
  });
});
```

- [ ] **Étape 2 : Lancer les tests et vérifier qu'ils échouent**

Commande : `bun --filter @biume/web test -- owner-api`

Attendu : ÉCHEC, module introuvable.

- [ ] **Étape 3 : Écrire l'application Hono**

Créer `apps/web/src/server/owner/owner-api.ts`, sur le même motif que `mobile-api.ts` — `OpenAPIHono` avec `basePath("/api/owner/v1")` — avec ces invariants, chacun porté par un test ci-dessus :

- `POST /{token}/challenge` répond **toujours** `200` avec le même corps, que le lien existe, soit révoqué ou n'existe pas. Le code n'est envoyé que si le lien est réellement valide.
- Le corps de réponse ne contient ni le code, ni l'adresse de destination, ni aucune information sur l'existence du lien.
- `POST /{token}/verify` répond `401` sur échec, sans jamais dire combien de tentatives restent.
- `GET /{token}/report` et `POST /{token}/answer` exigent `Authorization: Bearer <sessionSecret>` et vérifient que la session résolue porte **exactement** le jeton de l'URL.
- La réponse du rapport est le `OwnerReportSnapshot` figé, sans identifiant interne.

Créer ensuite la route TanStack `apps/web/src/routes/api/owner/$.ts` sur le modèle exact de `apps/web/src/routes/api/mobile/v1/$.ts`.

- [ ] **Étape 4 : Lancer les tests et valider**

```bash
bun --filter @biume/web test -- owner-api
bun --filter @biume/web check-types
rtk git add apps/web/src/server/owner/ apps/web/src/routes/api/owner/
rtk git commit -m "feat(web): ouvrir l'espace proprietaire par lien et code a usage unique"
```

Attendu : SUCCÈS, 14 tests.

---

### Tâche 6 : Page propriétaire

**Fichiers :**
- Créer : `apps/web/src/routes/r.$token.tsx`
- Test : `apps/web/src/routes/r.$token.test.tsx`

**Interfaces :**
- Consomme : l'API de la tâche 5.
- Produit : une page en trois états — saisie du code, lecture du compte rendu, questionnaire.

Le propriétaire n'est pas un professionnel et lit sur son téléphone, souvent d'une main. Une action visible par écran, aucun terme clinique non expliqué, et le `sessionSecret` rangé dans `localStorage` sous une clé propre au jeton.

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `apps/web/src/routes/r.$token.test.tsx` avec au minimum :

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OwnerReportView, OwnerCodeForm } from "./r.$token";

describe("saisie du code", () => {
  it("dit au propriétaire ce qu'il doit faire", () => {
    render(<OwnerCodeForm onSubmit={() => {}} pending={false} error={null} />);

    expect(screen.getByText(/code/i)).toBeTruthy();
  });

  it("n'affiche jamais le nombre de tentatives restantes", () => {
    render(
      <OwnerCodeForm onSubmit={() => {}} pending={false} error="code_invalide" />,
    );

    expect(screen.queryByText(/tentative/i)).toBeNull();
  });
});

describe("lecture du compte rendu", () => {
  const snapshot = {
    patientName: "Filou",
    createdAt: "2026-08-21T10:00:00.000Z",
    clinical: ["Tension dans le bas du dos, côté droit."],
    anatomical: [],
    recommendations: ["Promenades courtes pendant une semaine."],
  };

  it("nomme l'animal et date la séance", () => {
    render(<OwnerReportView snapshot={snapshot} />);

    expect(screen.getByText(/Filou/)).toBeTruthy();
  });

  it("ne montre aucune section vide", () => {
    render(<OwnerReportView snapshot={snapshot} />);

    expect(screen.queryByText(/anatomi/i)).toBeNull();
  });
});
```

- [ ] **Étape 2 : Lancer les tests, écrire la page, revalider**

Commande : `bun --filter @biume/web test -- r.\$token`

Écrire la page en exportant `OwnerCodeForm` et `OwnerReportView` séparément du composant de route, afin qu'ils soient testables sans routeur. Utiliser les jetons de `product.css`, jamais de couleur codée en dur.

- [ ] **Étape 3 : Vérifier dans un vrai navigateur**

`bun run dev:web`, ouvrir `/r/<un jeton réel>` sur un viewport mobile (390 × 844) :

- le code arrive par courriel et l'écran ne le montre jamais ;
- le compte rendu est lisible sans zoom ;
- le questionnaire tient en un écran, une main.

- [ ] **Étape 4 : Valider**

```bash
rtk git add apps/web/src/routes/
rtk git commit -m "feat(web): page de lecture et de reponse pour le proprietaire"
```

---

### Tâche 7 : Courriels et envoi à l'échéance

**Fichiers :**
- Créer : `packages/transactional/emails/OwnerAccessCodeEmail.tsx`
- Créer : `packages/transactional/emails/FollowUpQuestionnaireEmail.tsx`
- Modifier : `packages/transactional/emails/index.ts`
- Créer : `apps/web/src/trigger/send-followup.trigger.ts`
- Test : `apps/web/src/trigger/send-followup.trigger.test.ts`

**Interfaces :**
- Consomme : `EmailLayout` et `EmailComponents` existants ; `isActionable` de la tâche 4.
- Produit :
  - `OwnerAccessCodeEmail`, `FollowUpQuestionnaireEmail`
  - `const sendFollowUpTaskId = "followup-send"`
  - `async function runFollowUpBatch(deps): Promise<{ sent: number; failed: number }>`

- [ ] **Étape 1 : Écrire les courriels**

Reprendre exactement la structure de `ReportReminderEmail.tsx` — même `EmailLayout`, mêmes composants. Le courriel de code ne contient **que** le code et sa durée de validité : ni nom d'animal, ni contenu de compte rendu, ni lien cliquable menant directement au rapport.

- [ ] **Étape 2 : Écrire les tests d'orchestration qui échouent**

Créer `apps/web/src/trigger/send-followup.trigger.test.ts` :

```ts
import { describe, expect, it, vi } from "vitest";

import { runFollowUpBatch } from "./send-followup.trigger";

const now = new Date("2026-08-21T10:00:00.000Z");

function createDeps(overrides: Record<string, unknown> = {}) {
  return {
    claimDue: vi.fn(async () => [
      { id: "followup-1", shareToken: "jeton-1", ownerEmail: "a@example.test" },
    ]),
    sendEmail: vi.fn(async () => {}),
    markSent: vi.fn(async () => {}),
    markFailed: vi.fn(async () => {}),
    now: () => now,
    ...overrides,
  } as never;
}

describe("envoi des suivis à échéance", () => {
  it("envoie et marque envoyé", async () => {
    const deps = createDeps();

    expect(await runFollowUpBatch(deps)).toEqual({ sent: 1, failed: 0 });
    expect(deps.markSent).toHaveBeenCalledWith("followup-1", now);
  });

  /**
   * La réclamation est atomique côté base. Sans elle, deux exécutions
   * concurrentes enverraient deux courriels au même propriétaire.
   */
  it("n'envoie rien quand rien n'est réclamé", async () => {
    const deps = createDeps({ claimDue: vi.fn(async () => []) });

    expect(await runFollowUpBatch(deps)).toEqual({ sent: 0, failed: 0 });
    expect(deps.sendEmail).not.toHaveBeenCalled();
  });

  it("n'envoie pas à un propriétaire sans adresse", async () => {
    const deps = createDeps({
      claimDue: vi.fn(async () => [
        { id: "followup-1", shareToken: "jeton-1", ownerEmail: null },
      ]),
    });

    await runFollowUpBatch(deps);

    expect(deps.sendEmail).not.toHaveBeenCalled();
    expect(deps.markFailed).toHaveBeenCalledWith("followup-1", "no_owner_email");
  });

  it("isole l'échec d'un envoi des autres", async () => {
    const deps = createDeps({
      claimDue: vi.fn(async () => [
        { id: "followup-1", shareToken: "jeton-1", ownerEmail: "a@example.test" },
        { id: "followup-2", shareToken: "jeton-2", ownerEmail: "b@example.test" },
      ]),
      sendEmail: vi
        .fn()
        .mockRejectedValueOnce(new Error("smtp 550 mailbox unavailable"))
        .mockResolvedValueOnce(undefined),
    });

    expect(await runFollowUpBatch(deps)).toEqual({ sent: 1, failed: 1 });
  });

  it("ne persiste pas le message d'erreur du fournisseur", async () => {
    const deps = createDeps({
      sendEmail: vi.fn(async () => {
        throw new Error("smtp 550 mailbox unavailable for a@example.test");
      }),
    });

    await runFollowUpBatch(deps);
    const [, code] = deps.markFailed.mock.calls[0];

    expect(code).not.toContain("@");
    expect(code).not.toContain("550");
  });
});
```

- [ ] **Étape 3 : Écrire l'orchestration**

Créer `apps/web/src/trigger/send-followup.trigger.ts` sur le motif exact de `capture-purge.trigger.ts` : une fonction pure `runFollowUpBatch` testable sans Trigger.dev, puis un `schedules.task` qui l'appelle. `claimDue` fait une mise à jour conditionnelle `status = 'scheduled' AND due_at <= now` avec `RETURNING`, ce qui rend la réclamation atomique.

- [ ] **Étape 4 : Lancer les tests et valider**

```bash
bun --filter @biume/web test -- send-followup
bun --filter @biume/web check-types
rtk git add apps/web/src/trigger/ packages/transactional/
rtk git commit -m "feat(web): envoyer le questionnaire de suivi a l'echeance"
```

Attendu : SUCCÈS, 5 tests.

---

### Tâche 8 : Endpoints mobiles de programmation et de suivis actionnables

**Fichiers :**
- Modifier : `apps/web/src/server/mobile/mobile-api.routes.ts`
- Modifier : `apps/web/src/server/mobile/mobile-api.ts`
- Modifier : `apps/web/src/server/mobile/mobile-api.ports.ts`
- Test : `apps/web/src/server/mobile/mobile-api.followup.test.ts` (créer)

**Interfaces :**
- Consomme : `scheduleFollowUpRequestSchema`, `followUpSchema`, `actionableFollowUpsResponseSchema` de la tâche 1 ; `validateDueDate` et `isActionable` de la tâche 4.
- Produit, ajouts à `MobileApiPorts` :
  - `scheduleFollowUp(actor, reportId, request): Promise<FollowUp>`
  - `listActionableFollowUps(actor, query): Promise<ActionableFollowUpsResponse>`
  - `markFollowUpHandled(actor, followUpId): Promise<FollowUp>`
- Produit, routes : `POST /reports/{reportId}/followup`, `GET /followups/actionable`, `POST /followups/{followUpId}/handled`.

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `apps/web/src/server/mobile/mobile-api.followup.test.ts`, en suivant exactement le motif des fichiers de test mobiles précédents, et en couvrant au minimum :

```ts
describe("programmation du suivi", () => {
  it("programme un suivi à l'échéance choisie");
  it("refuse une échéance passée en 400");
  it("refuse une échéance à moins de trois jours en 400");
  it("accepte un questionnaire modifié par le praticien");
  it("rejette un questionnaire qui n'a pas trois questions");
  it("refuse de programmer sur un rapport d'une autre organisation en 404");
});

describe("suivis actionnables", () => {
  it("ne retourne que des réponses arrivées, alertées et non traitées");
  it("ne retourne jamais un suivi d'une autre organisation");
  it("borne la page à 50");
  it("marque un suivi traité et le fait disparaître de la liste");
});
```

Écrire les corps de test complets sur le modèle de `mobile-api.records.test.ts` : `createPorts` avec `vi.fn`, requêtes `Request` portant `authorization: Bearer jeton`, assertions sur le statut et sur le corps validé par son schéma.

- [ ] **Étape 2 : Lancer les tests, décrire les routes, brancher les ports**

Même démarche qu'aux plans précédents. Le port `scheduleFollowUp` appelle `validateDueDate` et lève `CaptureServiceError("validation", false)` sur tout retour différent de `"ok"`. `listActionableFollowUps` filtre en SQL sur `status = 'answered' AND handled_at IS NULL` **et** exige au moins une ligne dans `follow_up_alert` — jamais en mémoire après lecture non bornée.

- [ ] **Étape 3 : Lancer la suite, régénérer le contrat, valider**

```bash
bun --filter @biume/web test
bun --filter @biume/web emit-openapi
bun --filter @biume/web test -- openapi-drift
rtk git add apps/web/ 
rtk git commit -m "feat(web): programmer un suivi et lister ce qui demande une action"
```

---

### Tâche 9 : Vérification de bout en bout du parcours propriétaire

- [ ] **Étape 1 : Jouer le parcours complet**

Finaliser un rapport, le partager, programmer un suivi à trois jours. Ouvrir le lien depuis un navigateur privé, demander le code, le récupérer dans le courriel, le saisir, lire le compte rendu, répondre au questionnaire en déclarant une dégradation.

- [ ] **Étape 2 : Vérifier ce que le praticien voit**

`GET /followups/actionable` doit retourner ce suivi avec le motif `declared_worsening`. Le marquer traité et vérifier qu'il disparaît.

- [ ] **Étape 3 : Vérifier ce qu'un attaquant obtient**

Ces quatre vérifications sont obligatoires. **Chacune qui échoue est un arrêt du plan.**

```bash
# Un jeton inventé doit répondre exactement comme un jeton valide.
rtk curl -s -X POST https://localhost:3000/api/owner/v1/jeton-invente/challenge \
  -H 'content-type: application/json' -d '{"deviceId":"x"}'

# Le rapport sans session doit être refusé.
rtk curl -s -i http://localhost:3000/api/owner/v1/<jeton réel>/report

# Une session ouverte sur un lien ne doit pas ouvrir un autre lien.
rtk curl -s -i http://localhost:3000/api/owner/v1/<autre jeton>/report \
  -H 'authorization: Bearer <session du premier>'

# Six codes faux de suite doivent cesser de fonctionner, sans jamais dire
# combien il en restait.
```

- [ ] **Étape 4 : Vérifier la persistance du figement**

Modifier le rapport après partage, recharger la page propriétaire. Le contenu lu **ne doit pas** avoir changé.

- [ ] **Étape 5 : Consigner et valider**

Consigner le résultat des quatre vérifications d'attaque dans le document de spécification, en fin de section 7.5.

```bash
rtk git add docs/superpowers/specs/
rtk git commit -m "docs: consigner la verification du parcours proprietaire"
```

---

## Critères d'acceptation du plan

- Un propriétaire ouvre un lien, reçoit un code par courriel, lit le compte rendu et répond au questionnaire, sans jamais créer de compte.
- Un jeton inventé et un jeton valide produisent la même réponse à la demande de code.
- Un code incorrect ne dit jamais combien de tentatives restent, et le défi s'épuise.
- Une session n'ouvre qu'un seul lien de partage, jamais le dossier du propriétaire.
- Le contenu lu par le propriétaire ne change pas quand le praticien modifie le rapport après partage.
- Les alertes proviennent des trois règles explicites, et d'elles seules ; aucune analyse de texte n'en produit à elle seule.
- Un suivi apparaît dans les suivis actionnables uniquement s'il a une réponse, un motif d'alerte et aucun traitement ; il en disparaît une fois traité.
- Aucun courriel, aucune réponse d'API et aucune ligne en base ne contient de message de fournisseur ni d'adresse de destination inutile.
- Une échéance à moins de trois jours est refusée.
