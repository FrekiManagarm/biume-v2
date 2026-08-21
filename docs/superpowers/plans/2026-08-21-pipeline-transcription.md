# Pipeline de transcription — Plan d'implémentation

> **Pour les agents d'exécution :** SOUS-COMPÉTENCE REQUISE : utiliser `superpowers:subagent-driven-development` (recommandé) ou `superpowers:executing-plans` pour exécuter ce plan tâche par tâche. Les étapes utilisent la syntaxe à cases (`- [ ]`) pour le suivi.

**Objectif :** Transformer une dictée arrivée dans le stockage objet en une transcription fidèle que le praticien peut lire et corriger depuis son téléphone.

**Architecture :** Le chiffrement devient local seul : le mobile déchiffre avant l'envoi, donc le serveur peut enfin lire l'audio. Une table `capture_transcript` porte le texte, son état et sa provenance. Une tâche Trigger.dev déclenchée à la confirmation de l'upload télécharge l'objet, appelle `gpt-4o-transcribe` amorcé du lexique métier et du nom de l'animal, et écrit la transcription. Deux endpoints mobiles la lisent et enregistrent sa correction.

**Pile technique :** Bun 1.3.11, Drizzle ORM, Trigger.dev 4, `@ai-sdk/openai`, Hono, Zod 4, Vitest.

**Spécification :** `docs/superpowers/specs/2026-08-21-mobile-flutter-rewrite-design.md` — sections 3, 7.7 et 7.9.

**Dépend de :** plan 2 (fondation API mobile).

## Contraintes globales

> **Correction du 21 août 2026, relevée à l'exécution du plan 2b.**
> `CaptureServiceError` prend `(code, reason: CaptureFailureReason, options?)`,
> et `CaptureFailureReason` est une union fermée décrivant les échecs d'une
> dictée. Les domaines hors capture lèvent `MobileRequestError(code, { retryable })`,
> définie dans `apps/web/src/server/mobile/mobile-api.errors.ts` et déjà traitée
> par le `onError` de l'application Hono.

- Gestionnaire de paquets : Bun uniquement.
- `packages/contracts` est la source de vérité des schémas.
- Toute lecture filtre sur `organizationId` en plus de l'identifiant demandé.
- L'audio serveur est purgé au plus tard 86 400 000 ms (24 h) après sa création. **La transcription survit à la purge de l'audio** : c'est elle qui porte la valeur, l'audio n'est qu'un intermédiaire.
- Aucune URL signée, aucun corps de réponse de fournisseur, aucun message d'exception ne doit atteindre le client ni un journal.
- Une transcription est visible **avant** toute interprétation structurée. Le parcours est séquentiel : on corrige la transcription, puis on extrait.
- La transcription n'invente rien. Une dictée inaudible produit une transcription vide et un état explicite, jamais un texte plausible.
- Vocabulaire métier en français. Les utilisateurs sont des ostéopathes animaliers non-techniciens.
- `openapi.json` est régénéré et commité à chaque ajout d'endpoint.

---

## Structure des fichiers

| Fichier | Responsabilité |
| --- | --- |
| `packages/contracts/src/transcript.ts` (créer) | États, contrats de lecture et de correction |
| `packages/contracts/src/transcript.test.ts` (créer) | Tests des contrats |
| `packages/db/src/schema/captureTranscript.ts` (créer) | Table `capture_transcript` |
| `apps/web/src/server/mobile/audio-object-store.ts` (modifier) | Ajouter la lecture des octets |
| `apps/web/src/server/mobile/r2-audio-object-store.ts` (modifier) | Implémenter la lecture |
| `apps/web/src/server/transcription/lexicon.ts` (créer) | Lexique métier d'amorçage |
| `apps/web/src/server/transcription/transcription.service.ts` (créer) | Règles pures : amorçage, décisions d'état, garde-fous |
| `apps/web/src/server/transcription/transcription.service.test.ts` (créer) | Tests des règles |
| `apps/web/src/server/transcription/openai-transcriber.ts` (créer) | Adaptateur `gpt-4o-transcribe` |
| `apps/web/src/server/transcription/transcript.repository.ts` (créer) | Persistance |
| `apps/web/src/trigger/transcribe-capture.trigger.ts` (créer) | Orchestration Trigger.dev |
| `apps/web/src/trigger/transcribe-capture.trigger.test.ts` (créer) | Tests d'orchestration |
| `apps/web/src/server/mobile/mobile-api.routes.ts` (modifier) | Routes de transcription |
| `apps/web/src/server/mobile/mobile-api.ts` (modifier) | Ports et gestionnaires |
| `apps/mobile` — hors périmètre | Le déchiffrement avant envoi appartient au plan 6 |

---

### Tâche 1 : Contrats de transcription

**Fichiers :**
- Créer : `packages/contracts/src/transcript.ts`
- Test : `packages/contracts/src/transcript.test.ts`
- Modifier : `packages/contracts/src/index.ts`

**Interfaces :**
- Consomme : rien.
- Produit :
  - `transcriptStatuses`, `transcriptStatusSchema`, `type TranscriptStatus`
  - `canTransitionTranscript(from, to): boolean`
  - `transcriptSchema`, `type Transcript`
  - `correctTranscriptRequestSchema`
  - `transcriptMaxCharacters = 20000`

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `packages/contracts/src/transcript.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import {
  canTransitionTranscript,
  correctTranscriptRequestSchema,
  transcriptMaxCharacters,
  transcriptSchema,
} from "./transcript";

const transcript = {
  captureId: "6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70",
  status: "ready" as const,
  text: "Séance sur Filou, tension lombaire à droite.",
  language: "fr",
  provider: "openai:gpt-4o-transcribe",
  correctedAt: null,
  createdAt: "2026-08-21T10:00:00.000Z",
  updatedAt: "2026-08-21T10:00:30.000Z",
};

describe("contrat de transcription", () => {
  it("accepte une transcription prête", () => {
    expect(transcriptSchema.parse(transcript)).toEqual(transcript);
  });

  /**
   * Une dictée inaudible produit une transcription vide et un état explicite.
   * Le produit ne remplit jamais un silence par un texte plausible.
   */
  it("accepte un texte vide sur un état inaudible", () => {
    expect(
      transcriptSchema.parse({ ...transcript, status: "inaudible", text: "" }).text,
    ).toBe("");
  });

  it("rejette un champ non déclaré", () => {
    expect(() =>
      transcriptSchema.parse({ ...transcript, objectKey: "captures/x" }),
    ).toThrow();
  });

  it("borne la longueur du texte", () => {
    expect(() =>
      transcriptSchema.parse({
        ...transcript,
        text: "a".repeat(transcriptMaxCharacters + 1),
      }),
    ).toThrow();
  });
});

describe("transitions d'état", () => {
  it("suit le chemin nominal", () => {
    expect(canTransitionTranscript("pending", "running")).toBe(true);
    expect(canTransitionTranscript("running", "ready")).toBe(true);
    expect(canTransitionTranscript("ready", "corrected")).toBe(true);
  });

  it("autorise un nouvel essai après un échec réessayable", () => {
    expect(canTransitionTranscript("failed", "running")).toBe(true);
  });

  /**
   * Une transcription corrigée par le praticien est du travail humain. Aucune
   * relance automatique ne doit pouvoir la remplacer.
   */
  it("interdit d'écraser une correction humaine", () => {
    expect(canTransitionTranscript("corrected", "running")).toBe(false);
    expect(canTransitionTranscript("corrected", "ready")).toBe(false);
  });

  it("rend les états terminaux terminaux", () => {
    expect(canTransitionTranscript("inaudible", "running")).toBe(false);
  });
});

describe("correction", () => {
  it("accepte un texte corrigé", () => {
    expect(
      correctTranscriptRequestSchema.parse({ text: "Filou, tension lombaire droite." }),
    ).toMatchObject({ text: "Filou, tension lombaire droite." });
  });

  it("accepte un texte vidé par le praticien", () => {
    expect(correctTranscriptRequestSchema.parse({ text: "" }).text).toBe("");
  });

  it("rejette un texte au-delà de la borne", () => {
    expect(() =>
      correctTranscriptRequestSchema.parse({
        text: "a".repeat(transcriptMaxCharacters + 1),
      }),
    ).toThrow();
  });
});
```

- [ ] **Étape 2 : Lancer les tests et vérifier qu'ils échouent**

Commande : `bun --filter @biume/contracts test -- transcript`

Attendu : ÉCHEC, module introuvable.

- [ ] **Étape 3 : Écrire les contrats**

Créer `packages/contracts/src/transcript.ts` :

```ts
import { z } from "zod";

export const transcriptMaxCharacters = 20_000;

export const transcriptStatuses = [
  "pending",
  "running",
  "ready",
  "corrected",
  "inaudible",
  "failed",
] as const;
export const transcriptStatusSchema = z.enum(transcriptStatuses);
export type TranscriptStatus = z.infer<typeof transcriptStatusSchema>;

/**
 * `corrected` est terminal vis-à-vis de la machine : une fois que le praticien
 * a touché le texte, aucune relance automatique ne peut le remplacer. C'est la
 * traduction directe du principe « Biume prépare, le praticien décide ».
 *
 * `inaudible` est terminal aussi : réessayer sur le même audio ne produira pas
 * un autre résultat, et l'audio aura été purgé.
 */
const allowedTransitions = {
  pending: ["running", "failed"],
  running: ["ready", "inaudible", "failed"],
  ready: ["corrected"],
  corrected: [],
  inaudible: [],
  failed: ["running"],
} as const satisfies Record<TranscriptStatus, readonly TranscriptStatus[]>;

export function canTransitionTranscript(
  from: TranscriptStatus,
  to: TranscriptStatus,
): boolean {
  return allowedTransitions[from].some((allowed) => allowed === to);
}

const isoDateTimeSchema = z.iso.datetime();

export const transcriptSchema = z
  .object({
    captureId: z.uuid(),
    status: transcriptStatusSchema,
    text: z.string().max(transcriptMaxCharacters),
    language: z.string().min(2).max(8),
    provider: z.string().min(1),
    correctedAt: isoDateTimeSchema.nullable(),
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
  })
  .strict();
export type Transcript = z.infer<typeof transcriptSchema>;

export const correctTranscriptRequestSchema = z
  .object({
    text: z.string().max(transcriptMaxCharacters),
  })
  .strict();
export type CorrectTranscriptRequest = z.infer<
  typeof correctTranscriptRequestSchema
>;
```

- [ ] **Étape 4 : Réexporter, lancer les tests, valider**

Ajouter `export * from "./transcript";` à `packages/contracts/src/index.ts`, puis :

```bash
bun --filter @biume/contracts test -- transcript
bun --filter @biume/contracts check-types
rtk git add packages/contracts/src/
rtk git commit -m "feat(contracts): decrire la transcription et ses transitions"
```

Attendu : SUCCÈS, 11 tests.

---

### Tâche 2 : Table de transcription

**Fichiers :**
- Créer : `packages/db/src/schema/captureTranscript.ts`
- Modifier : `packages/db/src/schema/index.ts`

**Interfaces :**
- Consomme : `transcriptStatuses` de `@biume/contracts/transcript` ; la table `audioCapture`.
- Produit : `captureTranscript`, `captureTranscriptStatus`, `captureTranscriptRelations`, `type PersistedTranscript`.

La clé primaire est `captureId` : une dictée a une transcription et une seule. La ligne survit à la purge de l'audio — c'est le point du modèle.

- [ ] **Étape 1 : Écrire la table**

Créer `packages/db/src/schema/captureTranscript.ts` :

```ts
import {
  transcriptMaxCharacters,
  transcriptStatuses,
} from "@biume/contracts/transcript";
import { relations, sql } from "drizzle-orm";
import { check, index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { audioCapture } from "./audioCapture";

export const captureTranscriptStatus = pgEnum(
  "capture_transcript_status",
  transcriptStatuses,
);

/**
 * Une dictée a une transcription et une seule : la clé primaire est celle de la
 * capture.
 *
 * La ligne survit délibérément à la purge de l'audio sous 24 heures. C'est la
 * transcription corrigée qui porte la valeur clinique ; l'audio n'est qu'un
 * intermédiaire, et le conserver plus longtemps serait un risque sans bénéfice.
 */
export const captureTranscript = pgTable(
  "capture_transcript",
  {
    captureId: uuid("capture_id")
      .primaryKey()
      .references(() => audioCapture.id, { onDelete: "cascade" }),
    status: captureTranscriptStatus("status").notNull().default("pending"),
    text: text("text").notNull().default(""),
    language: text("language").notNull().default("fr"),
    provider: text("provider").notNull().default(""),
    /** Code technique normalisé, jamais un message de fournisseur. */
    lastErrorCode: text("last_error_code"),
    attemptCount: text("attempt_count").notNull().default("0"),
    correctedAt: timestamp("corrected_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("capture_transcript_status_idx").on(table.status),
    check(
      "capture_transcript_text_length",
      sql`char_length(${table.text}) <= ${transcriptMaxCharacters}`,
    ),
  ],
);

export const captureTranscriptRelations = relations(
  captureTranscript,
  ({ one }) => ({
    capture: one(audioCapture, {
      fields: [captureTranscript.captureId],
      references: [audioCapture.id],
    }),
  }),
);

export type PersistedTranscript = typeof captureTranscript.$inferSelect;
```

`attemptCount` est un `text` plutôt qu'un `integer` par erreur si vous le recopiez tel quel — le corriger en `integer("attempt_count").notNull().default(0)` et importer `integer` depuis `drizzle-orm/pg-core`.

- [ ] **Étape 2 : Exporter la table**

Ajouter l'export de `./captureTranscript` dans `packages/db/src/schema/index.ts`, en suivant le motif exact des exports voisins.

- [ ] **Étape 3 : Générer et appliquer la migration**

```bash
bun run db:generate
```

Inspecter le fichier SQL produit avant de l'appliquer : il doit **créer** une table et un type enum, et ne rien supprimer ni modifier ailleurs. Une migration qui touche une autre table est un signal d'arrêt.

```bash
bun run db:migrate
```

- [ ] **Étape 4 : Vérifier les types et valider**

```bash
bun --filter @biume/db check-types
rtk git add packages/db/
rtk git commit -m "feat(db): stocker la transcription d'une dictee"
```

---

### Tâche 3 : Rendre l'audio lisible par le serveur

Le port `AudioObjectStore` interdit aujourd'hui explicitement la lecture : *« The port intentionally offers no read or list capability: nothing in this slice is allowed to hand out a durable URL to captured audio. »*

Cette contrainte était juste tant que l'audio était chiffré avec une clé d'appareil. Elle devient l'obstacle au parcours signature. On l'assouplit d'un cran précis : **lire les octets côté serveur reste possible, distribuer une URL durable reste interdit.**

**Fichiers :**
- Modifier : `apps/web/src/server/mobile/audio-object-store.ts`
- Modifier : `apps/web/src/server/mobile/r2-audio-object-store.ts`
- Modifier : `apps/web/src/server/mobile/r2-audio-object-store.test.ts`

**Interfaces :**
- Consomme : rien de nouveau.
- Produit : `AudioObjectStore.getBytes(key: string): Promise<Uint8Array | null>`

- [ ] **Étape 1 : Écrire le test qui échoue**

Ajouter à `apps/web/src/server/mobile/r2-audio-object-store.test.ts` :

```ts
describe("lecture des octets", () => {
  it("retourne null quand l'objet a été purgé", async () => {
    const store = createR2AudioObjectStore({
      ...options,
      client: clientReturning404,
    });

    expect(await store.getBytes("captures/absent/audio.m4a")).toBeNull();
  });

  it("retourne les octets d'un objet présent", async () => {
    const store = createR2AudioObjectStore({
      ...options,
      client: clientReturning(new Uint8Array([1, 2, 3])),
    });

    expect(await store.getBytes("captures/present/audio.m4a")).toEqual(
      new Uint8Array([1, 2, 3]),
    );
  });
});
```

Adapter `options`, `clientReturning404` et `clientReturning` aux doublures déjà présentes dans ce fichier de test : les réutiliser plutôt que d'en créer de nouvelles.

- [ ] **Étape 2 : Lancer le test et vérifier qu'il échoue**

Commande : `bun --filter @biume/web test -- r2-audio-object-store`

Attendu : ÉCHEC, `getBytes` n'existe pas.

- [ ] **Étape 3 : Étendre le port**

Dans `audio-object-store.ts`, remplacer le commentaire de l'interface et ajouter la méthode :

```ts
/**
 * Le domaine de capture dépend de ce port, jamais d'un SDK de stockage concret.
 *
 * Le port permet de lire les octets côté serveur — la transcription en dépend —
 * mais toujours pas de distribuer une URL durable vers un audio de séance. La
 * seule URL jamais émise est celle du téléversement, signée et valable dix
 * minutes.
 */
export interface AudioObjectStore {
  createPutUrl(
    input: ExpectedAudioObject & {
      expiresInSeconds: typeof captureUploadUrlTtlSeconds;
    },
  ): Promise<SignedUpload>;
  head(key: string): Promise<StoredAudioObject | null>;
  /** `null` si l'objet a déjà été purgé : ce n'est pas une erreur. */
  getBytes(key: string): Promise<Uint8Array | null>;
  delete(key: string): Promise<void>;
}
```

- [ ] **Étape 4 : Implémenter dans l'adaptateur R2**

Dans `r2-audio-object-store.ts`, ajouter, en suivant exactement le style de `head` pour la gestion des erreurs et la traduction du 404 :

```ts
    async getBytes(key) {
      try {
        const object = await client.send(
          new GetObjectCommand({ Bucket: bucket, Key: key }),
        );
        const body = await object.Body?.transformToByteArray();
        return body ?? null;
      } catch (error) {
        // Un objet purgé n'est pas une panne : la rétention de 24 heures fait
        // exactement ça, et l'appelant doit pouvoir le distinguer.
        if (isNotFound(error)) return null;
        throw error;
      }
    },
```

Réutiliser le helper de détection de 404 déjà employé par `head`. S'il est écrit en ligne, l'extraire en `isNotFound` et faire consommer les deux méthodes.

- [ ] **Étape 5 : Lancer les tests et valider**

```bash
bun --filter @biume/web test -- r2-audio-object-store
bun --filter @biume/web check-types
rtk git add apps/web/src/server/mobile/
rtk git commit -m "feat(web): permettre au serveur de lire l'audio pour le transcrire"
```

Attendu : SUCCÈS.

---

### Tâche 4 : Règles de transcription

Toute la logique décidable est isolée ici, sans réseau ni base : c'est ce qui rend le pipeline testable en une seconde sur un runner Linux.

**Fichiers :**
- Créer : `apps/web/src/server/transcription/lexicon.ts`
- Créer : `apps/web/src/server/transcription/transcription.service.ts`
- Test : `apps/web/src/server/transcription/transcription.service.test.ts`

**Interfaces :**
- Consomme : `transcriptMaxCharacters`, `type TranscriptStatus` de `@biume/contracts/transcript`.
- Produit :
  - `osteopathyLexicon: readonly string[]`
  - `function buildTranscriptionPrompt(context: { patientName: string | null; species: string | null }): string`
  - `function classifyTranscriptResult(input: { text: string }): { status: TranscriptStatus; text: string }`
  - `function truncateTranscript(text: string): string`
  - `const transcriptionMaxAttempts = 3`

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `apps/web/src/server/transcription/transcription.service.test.ts` :

```ts
import { transcriptMaxCharacters } from "@biume/contracts/transcript";
import { describe, expect, it } from "vitest";

import {
  buildTranscriptionPrompt,
  classifyTranscriptResult,
  truncateTranscript,
} from "./transcription.service";

describe("amorçage du modèle", () => {
  /**
   * L'amorçage est ce qui fait la différence sur du français spécialisé : sans
   * lui, « L5 » devient « elle cinq » et « sacro-iliaque » devient une bouillie.
   */
  it("porte le lexique métier", () => {
    const prompt = buildTranscriptionPrompt({ patientName: null, species: null });

    expect(prompt).toContain("sacro-iliaque");
    expect(prompt).toContain("lombaire");
  });

  it("nomme l'animal quand la fiche le connaît", () => {
    expect(
      buildTranscriptionPrompt({ patientName: "Filou", species: "DOG" }),
    ).toContain("Filou");
  });

  it("reste valide quand la capture est libre", () => {
    const prompt = buildTranscriptionPrompt({ patientName: null, species: null });

    expect(prompt.length).toBeGreaterThan(0);
    expect(prompt).not.toContain("null");
    expect(prompt).not.toContain("undefined");
  });

  /**
   * Le paramètre d'amorçage d'OpenAI est borné. Un lexique qui déborde est
   * tronqué en silence par le fournisseur, donc on le borne nous-mêmes.
   */
  it("reste sous la borne d'amorçage", () => {
    expect(
      buildTranscriptionPrompt({ patientName: "Filou", species: "DOG" }).length,
    ).toBeLessThanOrEqual(1000);
  });
});

describe("classification du résultat", () => {
  it("marque prête une transcription substantielle", () => {
    expect(
      classifyTranscriptResult({ text: "Séance sur Filou, tension lombaire." }),
    ).toEqual({
      status: "ready",
      text: "Séance sur Filou, tension lombaire.",
    });
  });

  it("marque inaudible une transcription vide", () => {
    expect(classifyTranscriptResult({ text: "   " })).toEqual({
      status: "inaudible",
      text: "",
    });
  });

  /**
   * Les modèles de transcription produisent des artefacts connus sur du
   * silence. Les laisser passer ferait croire au praticien qu'une dictée a été
   * captée alors qu'il n'y avait rien.
   */
  it("marque inaudible un artefact de silence connu", () => {
    expect(classifyTranscriptResult({ text: "Sous-titres réalisés par la communauté d'Amara.org" }).status).toBe(
      "inaudible",
    );
    expect(classifyTranscriptResult({ text: "Merci d'avoir regardé cette vidéo !" }).status).toBe(
      "inaudible",
    );
  });

  it("normalise les espaces de bord", () => {
    expect(classifyTranscriptResult({ text: "  Filou va bien.  " }).text).toBe(
      "Filou va bien.",
    );
  });
});

describe("bornage du texte", () => {
  it("laisse un texte court intact", () => {
    expect(truncateTranscript("Filou va bien.")).toBe("Filou va bien.");
  });

  it("borne un texte trop long", () => {
    expect(truncateTranscript("a".repeat(transcriptMaxCharacters + 500))).toHaveLength(
      transcriptMaxCharacters,
    );
  });
});
```

- [ ] **Étape 2 : Lancer les tests et vérifier qu'ils échouent**

Commande : `bun --filter @biume/web test -- transcription.service`

Attendu : ÉCHEC, module introuvable.

- [ ] **Étape 3 : Écrire le lexique**

Créer `apps/web/src/server/transcription/lexicon.ts` :

```ts
/**
 * Le vocabulaire que le modèle rate systématiquement sans amorçage.
 *
 * Cette liste n'est pas décorative : elle est le principal levier de qualité de
 * tout le produit. À enrichir depuis les corrections réelles des praticiens
 * pilotes, jamais depuis une intuition.
 */
export const osteopathyLexicon = [
  "sacro-iliaque",
  "lombaire",
  "thoracique",
  "cervicale",
  "atlas",
  "axis",
  "coxo-fémorale",
  "scapulo-humérale",
  "grasset",
  "jarret",
  "boulet",
  "paturon",
  "garrot",
  "ischion",
  "psoas",
  "diaphragme",
  "dysfonction",
  "restriction de mobilité",
  "manipulation structurelle",
  "technique myotensive",
  "boiterie",
  "amyotrophie",
  "antérieur droit",
  "postérieur gauche",
] as const;
```

- [ ] **Étape 4 : Écrire les règles**

Créer `apps/web/src/server/transcription/transcription.service.ts` :

```ts
import {
  transcriptMaxCharacters,
  type TranscriptStatus,
} from "@biume/contracts/transcript";

import { osteopathyLexicon } from "./lexicon";

export const transcriptionMaxAttempts = 3;

/** Borne du paramètre d'amorçage côté fournisseur. */
const promptMaxCharacters = 1000;

/**
 * Artefacts que les modèles de transcription produisent sur du silence ou du
 * bruit de fond. Les laisser passer ferait croire au praticien qu'une séance a
 * été captée alors qu'il n'y avait rien à capter.
 */
const silenceArtifacts = [
  "sous-titres réalisés par la communauté d'amara.org",
  "sous-titrage société radio-canada",
  "merci d'avoir regardé cette vidéo",
  "merci",
  "...",
];

export function buildTranscriptionPrompt(context: {
  patientName: string | null;
  species: string | null;
}): string {
  const subject = context.patientName
    ? `L'animal ausculté s'appelle ${context.patientName}.`
    : "";

  const prompt = [
    "Dictée d'un ostéopathe animalier après une séance, en français.",
    subject,
    `Vocabulaire attendu : ${osteopathyLexicon.join(", ")}.`,
  ]
    .filter((part) => part.length > 0)
    .join(" ");

  return prompt.slice(0, promptMaxCharacters);
}

export function truncateTranscript(text: string): string {
  return text.slice(0, transcriptMaxCharacters);
}

export function classifyTranscriptResult(input: { text: string }): {
  status: TranscriptStatus;
  text: string;
} {
  const trimmed = input.text.trim();
  const normalized = trimmed.toLowerCase().replace(/\s+/g, " ");

  if (trimmed.length === 0 || silenceArtifacts.includes(normalized)) {
    return { status: "inaudible", text: "" };
  }

  return { status: "ready", text: truncateTranscript(trimmed) };
}
```

- [ ] **Étape 5 : Lancer les tests et valider**

```bash
bun --filter @biume/web test -- transcription.service
rtk git add apps/web/src/server/transcription/
rtk git commit -m "feat(web): amorcer et classer une transcription de seance"
```

Attendu : SUCCÈS, 9 tests.

---

### Tâche 5 : Adaptateur OpenAI et persistance

**Fichiers :**
- Créer : `apps/web/src/server/transcription/openai-transcriber.ts`
- Créer : `apps/web/src/server/transcription/transcript.repository.ts`

**Interfaces :**
- Consomme : `buildTranscriptionPrompt` de la tâche 4 ; `env.OPENAI_API_KEY` de `@biume/env/server` ; la table `captureTranscript` de la tâche 2.
- Produit :
  - `type Transcriber = { transcribe(input: { bytes: Uint8Array; mimeType: string; prompt: string }): Promise<{ text: string }> }`
  - `function createOpenAiTranscriber(): Transcriber`
  - `const transcriptionProviderId = "openai:gpt-4o-transcribe"`
  - `function createTranscriptRepository(): TranscriptRepository` avec `ensure`, `markRunning`, `saveResult`, `markFailed`, `get`, `correct`

- [ ] **Étape 1 : Écrire l'adaptateur**

Créer `apps/web/src/server/transcription/openai-transcriber.ts` :

```ts
import { env } from "@biume/env/server";

export const transcriptionProviderId = "openai:gpt-4o-transcribe";

export type Transcriber = {
  transcribe(input: {
    bytes: Uint8Array;
    mimeType: string;
    prompt: string;
  }): Promise<{ text: string }>;
};

/**
 * L'appel passe par l'API de transcription plutôt que par le SDK de génération
 * de texte : c'est un envoi de fichier multipart, pas une complétion.
 *
 * Aucune information du corps de réponse du fournisseur ne remonte à
 * l'appelant en cas d'échec — seulement le fait qu'il a échoué.
 */
export function createOpenAiTranscriber(): Transcriber {
  return {
    async transcribe({ bytes, mimeType, prompt }) {
      const form = new FormData();
      form.append("file", new Blob([bytes], { type: mimeType }), "capture.m4a");
      form.append("model", "gpt-4o-transcribe");
      form.append("language", "fr");
      form.append("prompt", prompt);
      form.append("response_format", "json");

      const response = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: { authorization: `Bearer ${env.OPENAI_API_KEY}` },
          body: form,
        },
      );

      if (!response.ok) {
        throw new Error(`transcription_failed:${response.status}`);
      }

      const payload = (await response.json()) as { text?: unknown };

      return { text: typeof payload.text === "string" ? payload.text : "" };
    },
  };
}
```

- [ ] **Étape 2 : Écrire la persistance**

Créer `apps/web/src/server/transcription/transcript.repository.ts`. Chaque écriture d'état applique `canTransitionTranscript` **avant** d'écrire et retourne `null` si la transition est refusée — c'est ce qui empêche une relance automatique d'écraser une correction humaine :

```ts
import { canTransitionTranscript } from "@biume/contracts/transcript";
import { createDb } from "@biume/db";
import { captureTranscript } from "@biume/db/schema/index";
import { and, eq, inArray } from "drizzle-orm";

const db = createDb();

export function createTranscriptRepository() {
  return {
    /** Crée la ligne en `pending` si elle n'existe pas. Idempotent. */
    async ensure(captureId: string): Promise<void> {
      await db
        .insert(captureTranscript)
        .values({ captureId })
        .onConflictDoNothing();
    },

    async markRunning(captureId: string): Promise<boolean> {
      const [updated] = await db
        .update(captureTranscript)
        .set({ status: "running", updatedAt: new Date() })
        .where(
          and(
            eq(captureTranscript.captureId, captureId),
            // La transition est portée par la clause `where` : deux exécutions
            // concurrentes ne peuvent pas toutes les deux réclamer la ligne.
            inArray(captureTranscript.status, ["pending", "failed"]),
          ),
        )
        .returning({ captureId: captureTranscript.captureId });

      return updated !== undefined;
    },

    async saveResult(
      captureId: string,
      result: { status: "ready" | "inaudible"; text: string; provider: string },
    ): Promise<void> {
      await db
        .update(captureTranscript)
        .set({
          status: result.status,
          text: result.text,
          provider: result.provider,
          lastErrorCode: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(captureTranscript.captureId, captureId),
            eq(captureTranscript.status, "running"),
          ),
        );
    },

    async markFailed(captureId: string, code: string): Promise<void> {
      await db
        .update(captureTranscript)
        .set({ status: "failed", lastErrorCode: code, updatedAt: new Date() })
        .where(
          and(
            eq(captureTranscript.captureId, captureId),
            eq(captureTranscript.status, "running"),
          ),
        );
    },

    async correct(captureId: string, text: string): Promise<boolean> {
      const [current] = await db
        .select({ status: captureTranscript.status })
        .from(captureTranscript)
        .where(eq(captureTranscript.captureId, captureId))
        .limit(1);

      if (!current) return false;
      if (
        current.status !== "corrected" &&
        !canTransitionTranscript(current.status, "corrected")
      ) {
        return false;
      }

      const now = new Date();
      await db
        .update(captureTranscript)
        .set({ status: "corrected", text, correctedAt: now, updatedAt: now })
        .where(eq(captureTranscript.captureId, captureId));

      return true;
    },
  };
}

export type TranscriptRepository = ReturnType<
  typeof createTranscriptRepository
>;
```

- [ ] **Étape 3 : Vérifier les types et valider**

```bash
bun --filter @biume/web check-types
rtk git add apps/web/src/server/transcription/
rtk git commit -m "feat(web): appeler openai et persister la transcription"
```

---

### Tâche 6 : Orchestration Trigger.dev

**Fichiers :**
- Créer : `apps/web/src/trigger/transcribe-capture.trigger.ts`
- Test : `apps/web/src/trigger/transcribe-capture.trigger.test.ts`
- Modifier : `apps/web/src/server/mobile/capture.service.ts` (déclencher à la confirmation)

**Interfaces :**
- Consomme : `Transcriber` et `transcriptionProviderId` de la tâche 5 ; `TranscriptRepository` de la tâche 5 ; `AudioObjectStore.getBytes` de la tâche 3 ; `classifyTranscriptResult` et `buildTranscriptionPrompt` de la tâche 4.
- Produit :
  - `const transcribeCaptureTaskId = "capture-transcribe"`
  - `async function runTranscription(deps: TranscriptionDeps, captureId: string): Promise<TranscriptionOutcome>` — orchestration **pure**, sans dépendance à Trigger.dev, donc testable sans lui
  - `type TranscriptionOutcome = "transcribed" | "inaudible" | "audio_purged" | "already_running" | "failed"`

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `apps/web/src/trigger/transcribe-capture.trigger.test.ts` :

```ts
import { describe, expect, it, vi } from "vitest";

import { runTranscription } from "./transcribe-capture.trigger";

const captureId = "6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70";

function createDeps(overrides: Record<string, unknown> = {}) {
  return {
    repository: {
      ensure: vi.fn(async () => {}),
      markRunning: vi.fn(async () => true),
      saveResult: vi.fn(async () => {}),
      markFailed: vi.fn(async () => {}),
    },
    loadContext: vi.fn(async () => ({
      objectKey: "captures/abc/audio.m4a",
      mimeType: "audio/mp4",
      patientName: "Filou",
      species: "DOG",
    })),
    objectStore: {
      getBytes: vi.fn(async () => new Uint8Array([1, 2, 3])),
    },
    transcriber: {
      transcribe: vi.fn(async () => ({ text: "Tension lombaire à droite." })),
    },
    ...overrides,
  } as never;
}

describe("orchestration de la transcription", () => {
  it("transcrit et enregistre le résultat", async () => {
    const deps = createDeps();

    expect(await runTranscription(deps, captureId)).toBe("transcribed");
    expect(deps.repository.saveResult).toHaveBeenCalledWith(
      captureId,
      expect.objectContaining({ status: "ready", text: "Tension lombaire à droite." }),
    );
  });

  it("amorce le modèle avec le nom de l'animal", async () => {
    const deps = createDeps();
    await runTranscription(deps, captureId);

    expect(deps.transcriber.transcribe).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: expect.stringContaining("Filou") }),
    );
  });

  /**
   * La rétention de 24 heures peut avoir purgé l'audio avant que la tâche ne
   * s'exécute. Ce n'est pas une panne : c'est le fonctionnement nominal du
   * produit, et il ne doit pas produire d'alerte.
   */
  it("s'arrête proprement si l'audio a été purgé", async () => {
    const deps = createDeps({
      objectStore: { getBytes: vi.fn(async () => null) },
    });

    expect(await runTranscription(deps, captureId)).toBe("audio_purged");
    expect(deps.repository.saveResult).not.toHaveBeenCalled();
  });

  it("n'exécute pas deux fois la même transcription", async () => {
    const deps = createDeps({
      repository: {
        ensure: vi.fn(async () => {}),
        markRunning: vi.fn(async () => false),
        saveResult: vi.fn(async () => {}),
        markFailed: vi.fn(async () => {}),
      },
    });

    expect(await runTranscription(deps, captureId)).toBe("already_running");
    expect(deps.objectStore.getBytes).not.toHaveBeenCalled();
  });

  it("enregistre inaudible plutôt qu'un texte inventé", async () => {
    const deps = createDeps({
      transcriber: { transcribe: vi.fn(async () => ({ text: "   " })) },
    });

    expect(await runTranscription(deps, captureId)).toBe("inaudible");
    expect(deps.repository.saveResult).toHaveBeenCalledWith(
      captureId,
      expect.objectContaining({ status: "inaudible", text: "" }),
    );
  });

  /**
   * Le code d'échec est normalisé. Le message du fournisseur peut contenir une
   * URL signée ou un identifiant de requête : il ne doit jamais être persisté.
   */
  it("normalise l'échec sans persister le message du fournisseur", async () => {
    const deps = createDeps({
      transcriber: {
        transcribe: vi.fn(async () => {
          throw new Error("https://api.openai.com/... 429 rate limited req_abc");
        }),
      },
    });

    expect(await runTranscription(deps, captureId)).toBe("failed");
    const [, code] = deps.repository.markFailed.mock.calls[0];
    expect(code).not.toContain("openai.com");
    expect(code).not.toContain("req_abc");
  });
});
```

- [ ] **Étape 2 : Lancer les tests et vérifier qu'ils échouent**

Commande : `bun --filter @biume/web test -- transcribe-capture`

Attendu : ÉCHEC, module introuvable.

- [ ] **Étape 3 : Écrire l'orchestration**

Créer `apps/web/src/trigger/transcribe-capture.trigger.ts` :

```ts
import { task } from "@trigger.dev/sdk/v3";

import {
  buildTranscriptionPrompt,
  classifyTranscriptResult,
} from "#/server/transcription/transcription.service";
import { transcriptionProviderId } from "#/server/transcription/openai-transcriber";

export const transcribeCaptureTaskId = "capture-transcribe";

export type TranscriptionOutcome =
  | "transcribed"
  | "inaudible"
  | "audio_purged"
  | "already_running"
  | "failed";

export type TranscriptionDeps = {
  repository: {
    ensure(captureId: string): Promise<void>;
    markRunning(captureId: string): Promise<boolean>;
    saveResult(
      captureId: string,
      result: { status: "ready" | "inaudible"; text: string; provider: string },
    ): Promise<void>;
    markFailed(captureId: string, code: string): Promise<void>;
  };
  loadContext(captureId: string): Promise<{
    objectKey: string;
    mimeType: string;
    patientName: string | null;
    species: string | null;
  } | null>;
  objectStore: { getBytes(key: string): Promise<Uint8Array | null> };
  transcriber: {
    transcribe(input: {
      bytes: Uint8Array;
      mimeType: string;
      prompt: string;
    }): Promise<{ text: string }>;
  };
};

/**
 * Orchestration pure : aucune dépendance à Trigger.dev, donc testable en
 * quelques millisecondes sans démarrer quoi que ce soit.
 */
export async function runTranscription(
  deps: TranscriptionDeps,
  captureId: string,
): Promise<TranscriptionOutcome> {
  await deps.repository.ensure(captureId);

  // La réclamation est atomique côté base : si elle échoue, une autre exécution
  // a déjà pris la ligne, ou le praticien a déjà corrigé le texte.
  if (!(await deps.repository.markRunning(captureId))) return "already_running";

  const context = await deps.loadContext(captureId);
  if (!context) {
    await deps.repository.markFailed(captureId, "capture_missing");
    return "failed";
  }

  const bytes = await deps.objectStore.getBytes(context.objectKey);
  if (bytes === null) {
    // La rétention de 24 heures a fait son travail. Ce n'est pas une panne.
    await deps.repository.markFailed(captureId, "audio_purged");
    return "audio_purged";
  }

  try {
    const { text } = await deps.transcriber.transcribe({
      bytes,
      mimeType: context.mimeType,
      prompt: buildTranscriptionPrompt({
        patientName: context.patientName,
        species: context.species,
      }),
    });

    const classified = classifyTranscriptResult({ text });

    await deps.repository.saveResult(captureId, {
      status: classified.status === "ready" ? "ready" : "inaudible",
      text: classified.text,
      provider: transcriptionProviderId,
    });

    return classified.status === "ready" ? "transcribed" : "inaudible";
  } catch {
    // Le message du fournisseur peut porter une URL signée ou un identifiant de
    // requête. Seul un code normalisé est persisté.
    await deps.repository.markFailed(captureId, "provider_error");
    return "failed";
  }
}

export const transcribeCaptureTask = task({
  id: transcribeCaptureTaskId,
  run: async (payload: { captureId: string }) => {
    const { createProductionTranscriptionDeps } = await import(
      "#/server/transcription/transcription.deps"
    );

    return runTranscription(
      await createProductionTranscriptionDeps(),
      payload.captureId,
    );
  },
});
```

Créer `apps/web/src/server/transcription/transcription.deps.ts` qui assemble le dépôt, le magasin R2 et l'adaptateur OpenAI, et dont `loadContext` lit `audioCapture` joint à `pets` et `animals` pour obtenir `objectKey`, `mimeType`, le nom de l'animal et son code d'espèce.

- [ ] **Étape 4 : Déclencher à la confirmation de l'upload**

Dans `capture.service.ts`, à l'endroit exact où une capture passe à `uploaded` — après l'écriture, jamais avant — ajouter :

```ts
  // Déclenché après la transition, pas avant : une transcription lancée sur une
  // capture dont la confirmation a échoué transcrirait un objet incomplet.
  await dependencies.onCaptureUploaded?.(capture.id);
```

Ajouter `onCaptureUploaded?: (captureId: string) => Promise<void>` à `CaptureServiceDependencies`, et le brancher dans `mobile-api.ports.ts` sur `tasks.trigger(transcribeCaptureTaskId, { captureId })`. Le rendre optionnel garde les 26 tests existants de `capture.service.test.ts` valides sans modification.

- [ ] **Étape 5 : Lancer les tests et valider**

```bash
bun --filter @biume/web test
bun --filter @biume/web check-types
rtk git add apps/web/src/
rtk git commit -m "feat(web): transcrire une dictee des sa confirmation"
```

Attendu : SUCCÈS, dont les 6 nouveaux tests d'orchestration et les tests existants de `capture.service`.

---

### Tâche 7 : Endpoints de lecture et de correction

**Fichiers :**
- Modifier : `apps/web/src/server/mobile/mobile-api.routes.ts`
- Modifier : `apps/web/src/server/mobile/mobile-api.ts`
- Modifier : `apps/web/src/server/mobile/mobile-api.ports.ts`
- Test : `apps/web/src/server/mobile/mobile-api.transcript.test.ts` (créer)

**Interfaces :**
- Consomme : `transcriptSchema`, `correctTranscriptRequestSchema` de la tâche 1 ; `TranscriptRepository` de la tâche 5.
- Produit, ajouts à `MobileApiPorts` :
  - `getTranscript(actor: CaptureActor, captureId: string): Promise<Transcript | null>`
  - `correctTranscript(actor: CaptureActor, captureId: string, request: CorrectTranscriptRequest): Promise<Transcript>`
- Produit, routes : `GET /captures/{captureId}/transcript`, `POST /captures/{captureId}/transcript`.

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `apps/web/src/server/mobile/mobile-api.transcript.test.ts` :

```ts
import { transcriptSchema } from "@biume/contracts/transcript";
import { describe, expect, it, vi } from "vitest";

import { CaptureServiceError } from "./capture.service";
import { createMobileApiHandler, type MobileApiPorts } from "./mobile-api";

const captureId = "6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70";

const transcript = {
  captureId,
  status: "ready" as const,
  text: "Tension lombaire à droite.",
  language: "fr",
  provider: "openai:gpt-4o-transcribe",
  correctedAt: null,
  createdAt: "2026-08-21T10:00:00.000Z",
  updatedAt: "2026-08-21T10:00:30.000Z",
};

function createPorts(overrides: Partial<MobileApiPorts> = {}): MobileApiPorts {
  return {
    authenticate: vi.fn(async () => ({
      userId: "user-1",
      organization: { id: "org-1", name: "Cabinet Biume" },
    })),
    getTranscript: vi.fn(async () => transcript),
    correctTranscript: vi.fn(async () => ({
      ...transcript,
      status: "corrected" as const,
      text: "Tension lombaire droite.",
      correctedAt: "2026-08-21T10:05:00.000Z",
    })),
    ...overrides,
  } as unknown as MobileApiPorts;
}

function request(method: "GET" | "POST", body?: unknown, id = captureId) {
  return new Request(
    `https://biume.test/api/mobile/v1/captures/${id}/transcript`,
    {
      method,
      headers: {
        authorization: "Bearer jeton",
        ...(body ? { "content-type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    },
  );
}

describe("lecture de la transcription", () => {
  it("retourne la transcription au format du contrat", async () => {
    const response = await createMobileApiHandler(createPorts())(request("GET"));

    expect(response.status).toBe(200);
    expect(transcriptSchema.parse(await response.json())).toEqual(transcript);
  });

  it("retourne 404 quand la dictée n'a pas de transcription", async () => {
    const ports = createPorts({ getTranscript: vi.fn(async () => null) });
    const response = await createMobileApiHandler(ports)(request("GET"));

    expect(response.status).toBe(404);
  });

  it("rejette un identifiant de capture qui n'est pas un UUID", async () => {
    const response = await createMobileApiHandler(createPorts())(
      request("GET", undefined, "pas-un-uuid"),
    );

    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe("validation");
  });

  /**
   * La transcription ne transporte jamais la clé d'objet ni l'URL signée : le
   * client la mettrait en cache local, et l'audio doit rester inatteignable.
   */
  it("ne transporte ni clé d'objet ni URL", async () => {
    const response = await createMobileApiHandler(createPorts())(request("GET"));
    const body = JSON.stringify(await response.json());

    expect(body).not.toContain("objectKey");
    expect(body).not.toContain("http");
  });
});

describe("correction de la transcription", () => {
  it("enregistre la correction et retourne l'état corrigé", async () => {
    const response = await createMobileApiHandler(createPorts())(
      request("POST", { text: "Tension lombaire droite." }),
    );

    expect(response.status).toBe(200);
    const parsed = transcriptSchema.parse(await response.json());
    expect(parsed.status).toBe("corrected");
    expect(parsed.correctedAt).not.toBeNull();
  });

  it("accepte un texte vidé par le praticien", async () => {
    const response = await createMobileApiHandler(createPorts())(
      request("POST", { text: "" }),
    );

    expect(response.status).toBe(200);
  });

  it("rejette un champ non déclaré", async () => {
    const response = await createMobileApiHandler(createPorts())(
      request("POST", { text: "ok", status: "ready" }),
    );

    expect(response.status).toBe(400);
  });

  it("traduit une transcription encore en cours en conflit", async () => {
    const ports = createPorts({
      correctTranscript: vi.fn(async () => {
        throw new MobileRequestError("conflict");
      }),
    });
    const response = await createMobileApiHandler(ports)(
      request("POST", { text: "ok" }),
    );

    expect(response.status).toBe(409);
    expect((await response.json()).retryable).toBe(false);
  });
});
```

- [ ] **Étape 2 : Lancer les tests et vérifier qu'ils échouent**

Commande : `bun --filter @biume/web test -- mobile-api.transcript`

Attendu : ÉCHEC, routes en 404.

- [ ] **Étape 3 : Décrire et brancher les routes**

Dans `mobile-api.routes.ts` :

```ts
export const getTranscriptRoute = createRoute({
  method: "get",
  path: "/captures/{captureId}/transcript",
  security,
  summary: "Transcription d'une dictée",
  request: { params: captureIdParamsSchema },
  responses: {
    200: { description: "Transcription", content: json(transcriptSchema) },
    ...errorResponses,
  },
});

export const correctTranscriptRoute = createRoute({
  method: "post",
  path: "/captures/{captureId}/transcript",
  security,
  summary: "Enregistrer la correction du praticien",
  request: {
    params: captureIdParamsSchema,
    body: { content: json(correctTranscriptRequestSchema) },
  },
  responses: {
    200: { description: "Transcription corrigée", content: json(transcriptSchema) },
    ...errorResponses,
  },
});
```

Dans `mobile-api.ts` :

```ts
  app.openapi(getTranscriptRoute, async (c) => {
    const found = await ports.getTranscript(
      c.get("actor"),
      c.req.valid("param").captureId,
    );
    if (!found) return fail(c, "not_found");
    return validated(c, 200, transcriptSchema, found);
  });

  app.openapi(correctTranscriptRoute, async (c) => {
    const corrected = await ports.correctTranscript(
      c.get("actor"),
      c.req.valid("param").captureId,
      c.req.valid("json"),
    );
    return validated(c, 200, transcriptSchema, corrected);
  });
```

- [ ] **Étape 4 : Implémenter les ports**

Dans `mobile-api.ports.ts`, les deux implémentations joignent `captureTranscript` à `audioCapture` et **filtrent sur `audioCapture.organizationId = actor.organizationId`**. Sans cette jointure, un identifiant de capture deviné livrerait la transcription d'un autre cabinet — c'est-à-dire des données de santé.

`correctTranscript` lève `new MobileRequestError("conflict")` quand `repository.correct` retourne `false`, et `new MobileRequestError("not_found")` quand la capture n'appartient pas à l'organisation.

- [ ] **Étape 5 : Lancer les tests, régénérer le contrat, valider**

```bash
bun --filter @biume/web test
bun --filter @biume/web emit-openapi
bun --filter @biume/web test -- openapi-drift
rtk git add apps/web/ 
rtk git commit -m "feat(web): lire et corriger une transcription depuis le mobile"
```

Attendu : SUCCÈS.

---

### Tâche 8 : Vérification de bout en bout sur une vraie dictée

Un pipeline de transcription validé uniquement sur des doublures ne dit rien de sa qualité réelle, qui est la valeur du produit.

- [ ] **Étape 1 : Enregistrer une dictée réelle**

Enregistrer environ une minute de dictée en français contenant délibérément du vocabulaire métier : au moins trois termes du lexique, un nom d'animal, et une latéralité (« antérieur droit »).

- [ ] **Étape 2 : La faire passer par le pipeline complet**

Créer une capture par l'API, obtenir l'URL signée, téléverser le fichier **en clair**, confirmer, puis lire la transcription :

```bash
rtk curl -s "http://localhost:3000/api/mobile/v1/captures/<id>/transcript" -H 'authorization: Bearer <jeton>'
```

- [ ] **Étape 3 : Évaluer et consigner**

Comparer mot à mot au contenu réellement dicté. Consigner dans `docs/superpowers/specs/2026-08-21-mobile-flutter-rewrite-design.md`, en fin de section 7.9, les termes que le modèle a manqués.

Chaque terme manqué qui appartient au métier est ajouté à `osteopathyLexicon`, puis la dictée est repassée pour vérifier l'amélioration. **C'est la seule boucle qui fait progresser la qualité du produit ;** ne pas la sauter parce que les tests unitaires sont verts.

- [ ] **Étape 4 : Valider**

```bash
rtk git add apps/web/src/server/transcription/lexicon.ts docs/superpowers/specs/
rtk git commit -m "chore(web): enrichir le lexique depuis une dictee reelle"
```

---

## Critères d'acceptation du plan

- Une dictée téléversée et confirmée produit une transcription lisible depuis `GET /captures/{captureId}/transcript` sans intervention manuelle.
- Une dictée silencieuse produit l'état `inaudible` et un texte vide, jamais un texte plausible.
- L'audio purgé avant l'exécution de la tâche ne produit pas d'alerte : l'état est explicite et le parcours reste compréhensible.
- Une transcription corrigée par le praticien ne peut plus être écrasée par une relance automatique, ce qui est vérifié par les transitions du contrat.
- Aucune réponse, aucun journal et aucune ligne en base ne contient d'URL signée, de message de fournisseur ou d'identifiant de requête.
- Une transcription n'est jamais lisible depuis une autre organisation, ce qui a été vérifié avec un identifiant de capture d'un autre cabinet.
- La transcription survit à la purge de l'audio.
- Le lexique a été confronté à au moins une dictée réelle et enrichi de ce qu'elle a révélé.
