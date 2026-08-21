# Endpoints métier de l'API mobile — Plan d'implémentation

> **Pour les agents d'exécution :** SOUS-COMPÉTENCE REQUISE : utiliser `superpowers:subagent-driven-development` (recommandé) ou `superpowers:executing-plans` pour exécuter ce plan tâche par tâche. Les étapes utilisent la syntaxe à cases (`- [ ]`) pour le suivi.

**Objectif :** Exposer sur `/api/mobile/v1` les fiches propriétaire et animal, l'historique récent d'un animal, la création d'un propriétaire et de son animal, et le déplacement d'un rendez-vous — tout ce que le domaine web sait déjà faire et que le mobile doit consommer.

**Architecture :** Chaque endpoint suit le motif posé par le plan 2 : un contrat Zod dans `packages/contracts`, une description `createRoute`, un port dans `MobileApiPorts`, une implémentation dans `mobile-api.ports.ts`. Les requêtes SQL réutilisent les mêmes tables que les fonctions serveur du web, mais sans passer par elles : une `createServerFn` résout son organisation depuis les cookies TanStack, ce que le mobile n'a pas. La frontière de locataire est portée par `CaptureActor`, jamais par le client.

**Pile technique :** Bun 1.3.11, Hono 4.13, `@hono/zod-openapi` 1.6, Drizzle ORM, Zod 4, Vitest.

**Spécification :** `docs/superpowers/specs/2026-08-21-mobile-flutter-rewrite-design.md`

**Dépend de :** plan 2 (fondation API mobile) et plan 1 (prédicat de chevauchement).

## Contraintes globales

- Gestionnaire de paquets : Bun uniquement.
- `packages/contracts` est la source de vérité des schémas. Aucun schéma redéfini dans `apps/web`.
- Tout ce qui décide de l'appartenance à une organisation est résolu depuis la session. Un `organizationId` ou un `practitionerId` envoyé par le client est une charge **rejetée**, jamais un champ ignoré.
- Toute lecture filtre sur `organizationId` **en plus** de l'identifiant demandé.
- Les messages d'erreur sont génériques et en français. Rien issu d'une exception ou d'une base ne sort.
- Toute réponse est validée contre son contrat avant de quitter le processus.
- Toute liste est paginée et bornée côté serveur. Aucune lecture non bornée.
- `openapi.json` est régénéré et commité à chaque ajout d'endpoint, sans quoi la CI échoue.
- Le mobile **valide, il n'édite pas** : aucun endpoint de ce plan n'écrit dans le contenu d'un rapport.
- Vocabulaire métier en français dans les messages. Les utilisateurs sont des ostéopathes animaliers non-techniciens.

---

## Structure des fichiers

| Fichier | Responsabilité |
| --- | --- |
| `packages/contracts/src/mobile-records.ts` (créer) | Contrats des fiches, de l'historique et des mutations mobiles |
| `packages/contracts/src/mobile-records.test.ts` (créer) | Tests des contrats |
| `packages/contracts/src/index.ts` (modifier) | Réexporter le nouveau module |
| `apps/web/src/server/mobile/mobile-api.routes.ts` (modifier) | Descriptions des nouvelles routes |
| `apps/web/src/server/mobile/mobile-api.ts` (modifier) | Ports et gestionnaires |
| `apps/web/src/server/mobile/records.repository.ts` (créer) | Requêtes Drizzle des fiches et de l'historique |
| `apps/web/src/server/mobile/records.repository.test.ts` (créer) | Tests de construction de requêtes |
| `apps/web/src/server/mobile/mobile-api.records.test.ts` (créer) | Tests des gestionnaires contre des ports simulés |
| `apps/web/src/server/mobile/mobile-api.ports.ts` (modifier) | Implémentations de production |
| `apps/web/openapi.json` (régénéré) | Contrat public |

---

### Tâche 1 : Contrats des fiches et de l'historique

**Fichiers :**
- Créer : `packages/contracts/src/mobile-records.ts`
- Test : `packages/contracts/src/mobile-records.test.ts`
- Modifier : `packages/contracts/src/index.ts`

**Interfaces :**
- Consomme : `patientSpeciesSchema` de `./capture` ; `reportSectionStatesSchema`, `reportStatusSchema` de `./report`.
- Produit :
  - `mobileOwnerSchema`, `mobileOwnersResponseSchema`
  - `mobilePatientSchema`, `mobilePatientsResponseSchema`
  - `mobilePatientHistoryEntrySchema`, `mobilePatientHistoryResponseSchema`
  - `createMobileOwnerRequestSchema`, `createMobilePatientRequestSchema`
  - `moveAppointmentRequestSchema`, `moveAppointmentConflictSchema`, `moveAppointmentResponseSchema`
  - `mobileRecordsPageSize = 50`

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `packages/contracts/src/mobile-records.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import {
  createMobileOwnerRequestSchema,
  createMobilePatientRequestSchema,
  mobileOwnerSchema,
  mobilePatientHistoryResponseSchema,
  mobilePatientSchema,
  mobileRecordsPageSize,
  moveAppointmentRequestSchema,
} from "./mobile-records";

describe("fiche propriétaire", () => {
  const owner = {
    id: "client-1",
    name: "Camille Roux",
    email: "camille@example.test",
    phone: "0600000000",
    city: "Rennes",
    patientCount: 2,
  };

  it("accepte une fiche complète", () => {
    expect(mobileOwnerSchema.parse(owner)).toEqual(owner);
  });

  it("accepte un propriétaire sans coordonnées", () => {
    expect(
      mobileOwnerSchema.parse({ ...owner, email: null, phone: null, city: null }),
    ).toMatchObject({ email: null, phone: null });
  });

  /**
   * Un champ non déclaré est une charge rejetée. Le mobile ne doit jamais
   * pouvoir influencer l'appartenance à une organisation.
   */
  it("rejette un champ non déclaré", () => {
    expect(() =>
      mobileOwnerSchema.parse({ ...owner, organizationId: "org-1" }),
    ).toThrow();
  });
});

describe("fiche animal", () => {
  const patient = {
    id: "pet-1",
    ownerId: "client-1",
    ownerName: "Camille Roux",
    name: "Filou",
    species: "DOG",
    breed: "Border collie",
    birthDate: "2020-04-11T00:00:00.000Z",
    lastAppointmentAt: null,
  };

  it("accepte une fiche complète", () => {
    expect(mobilePatientSchema.parse(patient)).toEqual(patient);
  });

  it("accepte une espèce hors atlas anatomique", () => {
    expect(mobilePatientSchema.parse({ ...patient, species: "COW" }).species).toBe(
      "COW",
    );
  });

  it("rejette une espèce inconnue", () => {
    expect(() =>
      mobilePatientSchema.parse({ ...patient, species: "DRAGON" }),
    ).toThrow();
  });
});

describe("historique d'un animal", () => {
  it("borne la page", () => {
    const entries = Array.from({ length: mobileRecordsPageSize + 1 }, () => ({
      appointmentId: "appointment-1",
      beginAt: "2026-08-01T09:00:00.000Z",
      reportId: null,
      reportStatus: null,
      consultationReason: "",
    }));

    expect(() =>
      mobilePatientHistoryResponseSchema.parse({ items: entries, nextCursor: null }),
    ).toThrow();
  });
});

describe("création d'un propriétaire", () => {
  it("exige un nom non vide", () => {
    expect(() => createMobileOwnerRequestSchema.parse({ name: "  " })).toThrow();
  });

  it("accepte un nom seul", () => {
    expect(createMobileOwnerRequestSchema.parse({ name: "Camille Roux" })).toEqual({
      name: "Camille Roux",
    });
  });

  /**
   * Sur le terrain, le praticien connaît le nom de l'animal et son espèce.
   * Exiger la race, le poids ou la date de naissance bloquerait la création
   * au moment précis où elle doit être immédiate.
   */
  it("n'exige que le nom, l'espèce et le propriétaire pour un animal", () => {
    expect(
      createMobilePatientRequestSchema.parse({
        ownerId: "client-1",
        name: "Filou",
        species: "DOG",
      }),
    ).toMatchObject({ name: "Filou", species: "DOG" });
  });
});

describe("déplacement d'un rendez-vous", () => {
  it("rejette une fin antérieure au début", () => {
    expect(() =>
      moveAppointmentRequestSchema.parse({
        beginAt: "2026-08-21T11:00:00.000Z",
        endAt: "2026-08-21T10:00:00.000Z",
      }),
    ).toThrow();
  });

  it("rejette un créneau de durée nulle", () => {
    expect(() =>
      moveAppointmentRequestSchema.parse({
        beginAt: "2026-08-21T10:00:00.000Z",
        endAt: "2026-08-21T10:00:00.000Z",
      }),
    ).toThrow();
  });

  it("accepte un créneau valide", () => {
    expect(
      moveAppointmentRequestSchema.parse({
        beginAt: "2026-08-21T10:00:00.000Z",
        endAt: "2026-08-21T11:00:00.000Z",
      }),
    ).toMatchObject({ beginAt: "2026-08-21T10:00:00.000Z" });
  });
});
```

- [ ] **Étape 2 : Lancer les tests et vérifier qu'ils échouent**

Commande : `bun --filter @biume/contracts test -- mobile-records`

Attendu : ÉCHEC, module `./mobile-records` introuvable.

- [ ] **Étape 3 : Écrire les contrats**

Créer `packages/contracts/src/mobile-records.ts` :

```ts
import { z } from "zod";

import { patientSpeciesSchema } from "./capture";
import { reportStatusSchema } from "./report";

const isoDateTimeSchema = z.iso.datetime();

export const mobileRecordsPageSize = 50;

/**
 * Ce que l'écran de terrain a besoin de lire pour nommer et joindre un
 * propriétaire. L'adresse complète, les notes et l'historique de facturation
 * restent sur le serveur : le mobile ne les affiche jamais.
 */
export const mobileOwnerSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    city: z.string().nullable(),
    patientCount: z.number().int().nonnegative(),
  })
  .strict();
export type MobileOwner = z.infer<typeof mobileOwnerSchema>;

export const mobileOwnersResponseSchema = z
  .object({
    items: z.array(mobileOwnerSchema).max(mobileRecordsPageSize),
    nextCursor: z.string().min(1).nullable(),
  })
  .strict();
export type MobileOwnersResponse = z.infer<typeof mobileOwnersResponseSchema>;

export const mobilePatientSchema = z
  .object({
    id: z.string().min(1),
    ownerId: z.string().min(1),
    ownerName: z.string().min(1),
    name: z.string().min(1),
    species: patientSpeciesSchema,
    breed: z.string().nullable(),
    birthDate: isoDateTimeSchema.nullable(),
    lastAppointmentAt: isoDateTimeSchema.nullable(),
  })
  .strict();
export type MobilePatient = z.infer<typeof mobilePatientSchema>;

export const mobilePatientsResponseSchema = z
  .object({
    items: z.array(mobilePatientSchema).max(mobileRecordsPageSize),
    nextCursor: z.string().min(1).nullable(),
  })
  .strict();
export type MobilePatientsResponse = z.infer<
  typeof mobilePatientsResponseSchema
>;

/**
 * L'historique dit ce qui s'est passé et où en est le compte rendu, sans jamais
 * transporter le contenu clinique : le mobile ne l'affiche pas, et le faire
 * transiter l'exposerait au cache local.
 */
export const mobilePatientHistoryEntrySchema = z
  .object({
    appointmentId: z.string().min(1),
    beginAt: isoDateTimeSchema,
    reportId: z.string().min(1).nullable(),
    reportStatus: reportStatusSchema.nullable(),
    consultationReason: z.string(),
  })
  .strict();
export type MobilePatientHistoryEntry = z.infer<
  typeof mobilePatientHistoryEntrySchema
>;

export const mobilePatientHistoryResponseSchema = z
  .object({
    items: z.array(mobilePatientHistoryEntrySchema).max(mobileRecordsPageSize),
    nextCursor: z.string().min(1).nullable(),
  })
  .strict();
export type MobilePatientHistoryResponse = z.infer<
  typeof mobilePatientHistoryResponseSchema
>;

export const createMobileOwnerRequestSchema = z
  .object({
    name: z.string().trim().min(1),
    email: z.string().trim().min(1).optional(),
    phone: z.string().trim().min(1).optional(),
    city: z.string().trim().min(1).optional(),
  })
  .strict();
export type CreateMobileOwnerRequest = z.infer<
  typeof createMobileOwnerRequestSchema
>;

/**
 * Création minimale assumée. Le praticien en clientèle connaît le nom et
 * l'espèce ; tout le reste se complète plus tard, sur le web ou sur la fiche.
 */
export const createMobilePatientRequestSchema = z
  .object({
    ownerId: z.string().min(1),
    name: z.string().trim().min(1),
    species: patientSpeciesSchema,
    breed: z.string().trim().min(1).optional(),
    birthDate: isoDateTimeSchema.optional(),
  })
  .strict();
export type CreateMobilePatientRequest = z.infer<
  typeof createMobilePatientRequestSchema
>;

export const moveAppointmentRequestSchema = z
  .object({
    beginAt: isoDateTimeSchema,
    endAt: isoDateTimeSchema,
  })
  .strict()
  .refine(
    (slot) => new Date(slot.endAt).getTime() > new Date(slot.beginAt).getTime(),
    { message: "La fin doit être postérieure au début." },
  );
export type MoveAppointmentRequest = z.infer<
  typeof moveAppointmentRequestSchema
>;

export const moveAppointmentConflictSchema = z
  .object({
    appointmentId: z.string().min(1),
    beginAt: isoDateTimeSchema,
    patientName: z.string().nullable(),
  })
  .strict();

/**
 * Le déplacement aboutit même en cas de chevauchement. Le serveur informe, le
 * praticien décide — la même règle que sur le web.
 */
export const moveAppointmentResponseSchema = z
  .object({
    appointmentId: z.string().min(1),
    beginAt: isoDateTimeSchema,
    endAt: isoDateTimeSchema,
    conflicts: z.array(moveAppointmentConflictSchema),
  })
  .strict();
export type MoveAppointmentResponse = z.infer<
  typeof moveAppointmentResponseSchema
>;
```

- [ ] **Étape 4 : Réexporter le module**

Dans `packages/contracts/src/index.ts`, ajouter :

```ts
export * from "./mobile-records";
```

- [ ] **Étape 5 : Lancer les tests et vérifier qu'ils passent**

Commandes :

```bash
bun --filter @biume/contracts test -- mobile-records
bun --filter @biume/contracts check-types
```

Attendu : SUCCÈS, 11 tests.

- [ ] **Étape 6 : Valider**

```bash
rtk git add packages/contracts/src/
rtk git commit -m "feat(contracts): decrire les fiches et mutations mobiles"
```

---

### Tâche 2 : Requêtes de lecture des fiches

Les fonctions serveur du web ne sont pas réutilisables ici : `getAllClients` et consorts résolvent leur organisation depuis les cookies TanStack, que le mobile n'a pas. On écrit les requêtes contre les mêmes tables, avec l'organisation portée par l'acteur.

**Fichiers :**
- Créer : `apps/web/src/server/mobile/records.repository.ts`
- Test : `apps/web/src/server/mobile/records.repository.test.ts`

**Interfaces :**
- Consomme : `type CaptureActor` de `./capture.service` ; les tables `clients`, `pets`, `animals`, `appointments`, `advancedReport` de `@biume/db/schema/index` ; `decodeCursor` et `encodeCursor`, déjà présents dans `mobile-api.ports.ts` — les **déplacer** dans ce module et les y réexporter, puisque deux modules en ont désormais besoin.
- Produit :
  - `function buildOwnersQuery(actor: CaptureActor, query: { limit: number; cursor: string | null; search: string | null }): { where: SQL; limit: number }`
  - `function toMobileOwner(row: OwnerRow): MobileOwner`
  - `function toMobilePatient(row: PatientRow): MobilePatient`
  - `function toHistoryEntry(row: HistoryRow): MobilePatientHistoryEntry`
  - `function resolveSpecies(code: string | null): PatientSpecies`

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `apps/web/src/server/mobile/records.repository.test.ts` :

```ts
import { describe, expect, it } from "vitest";

import {
  resolveSpecies,
  toHistoryEntry,
  toMobileOwner,
  toMobilePatient,
} from "./records.repository";

describe("resolveSpecies", () => {
  it("reconnaît les codes du catalogue", () => {
    expect(resolveSpecies("DOG")).toBe("DOG");
    expect(resolveSpecies("HORSE")).toBe("HORSE");
    expect(resolveSpecies("COW")).toBe("COW");
  });

  /**
   * Une fiche animale peut être ancienne, importée, ou porter un code retiré du
   * catalogue. Faire échouer la lecture de tout l'agenda pour ça serait une
   * panne de terrain pour une donnée cosmétique.
   */
  it("retombe sur OTHER pour un code inconnu ou absent", () => {
    expect(resolveSpecies(null)).toBe("OTHER");
    expect(resolveSpecies("")).toBe("OTHER");
    expect(resolveSpecies("DRAGON")).toBe("OTHER");
  });

  it("normalise la casse", () => {
    expect(resolveSpecies("dog")).toBe("DOG");
  });
});

describe("toMobileOwner", () => {
  it("normalise les champs absents en null", () => {
    expect(
      toMobileOwner({
        id: "client-1",
        name: "Camille Roux",
        email: null,
        phone: "",
        city: undefined,
        patientCount: 0,
      }),
    ).toEqual({
      id: "client-1",
      name: "Camille Roux",
      email: null,
      phone: null,
      city: null,
      patientCount: 0,
    });
  });
});

describe("toMobilePatient", () => {
  it("sérialise les dates en ISO et tolère l'absence", () => {
    expect(
      toMobilePatient({
        id: "pet-1",
        ownerId: "client-1",
        ownerName: "Camille Roux",
        name: "Filou",
        speciesCode: "DOG",
        breed: null,
        birthDate: new Date("2020-04-11T00:00:00.000Z"),
        lastAppointmentAt: null,
      }),
    ).toEqual({
      id: "pet-1",
      ownerId: "client-1",
      ownerName: "Camille Roux",
      name: "Filou",
      species: "DOG",
      breed: null,
      birthDate: "2020-04-11T00:00:00.000Z",
      lastAppointmentAt: null,
    });
  });
});

describe("toHistoryEntry", () => {
  it("expose l'état du compte rendu sans son contenu", () => {
    const entry = toHistoryEntry({
      appointmentId: "appointment-1",
      beginAt: new Date("2026-08-01T09:00:00.000Z"),
      reportId: "report-1",
      reportStatus: "finalized",
      consultationReason: "Boiterie postérieure",
    });

    expect(entry).toEqual({
      appointmentId: "appointment-1",
      beginAt: "2026-08-01T09:00:00.000Z",
      reportId: "report-1",
      reportStatus: "finalized",
      consultationReason: "Boiterie postérieure",
    });
    expect(Object.keys(entry)).not.toContain("notes");
  });

  it("accepte un rendez-vous sans compte rendu", () => {
    expect(
      toHistoryEntry({
        appointmentId: "appointment-2",
        beginAt: new Date("2026-08-02T09:00:00.000Z"),
        reportId: null,
        reportStatus: null,
        consultationReason: null,
      }),
    ).toMatchObject({ reportId: null, reportStatus: null, consultationReason: "" });
  });
});
```

- [ ] **Étape 2 : Lancer les tests et vérifier qu'ils échouent**

Commande : `bun --filter @biume/web test -- records.repository`

Attendu : ÉCHEC, module introuvable.

- [ ] **Étape 3 : Écrire les convertisseurs**

Créer `apps/web/src/server/mobile/records.repository.ts` :

```ts
import {
  patientSpeciesCodes,
  type PatientSpecies,
} from "@biume/contracts/capture";
import type {
  MobileOwner,
  MobilePatient,
  MobilePatientHistoryEntry,
} from "@biume/contracts/mobile-records";
import type { ReportStatus } from "@biume/contracts/report";

const knownSpecies = new Set<string>(patientSpeciesCodes);

/**
 * Le catalogue d'espèces évolue et des fiches importées portent des codes qui
 * n'y figurent plus. Une espèce inconnue devient `OTHER` plutôt que de faire
 * échouer la lecture : c'est un libellé, pas une donnée clinique.
 */
export function resolveSpecies(code: string | null | undefined): PatientSpecies {
  if (!code) return "OTHER";
  const normalized = code.trim().toUpperCase();
  return knownSpecies.has(normalized) ? (normalized as PatientSpecies) : "OTHER";
}

function orNull(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function isoOrNull(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

export type OwnerRow = {
  id: string;
  name: string;
  email: string | null | undefined;
  phone: string | null | undefined;
  city: string | null | undefined;
  patientCount: number;
};

export function toMobileOwner(row: OwnerRow): MobileOwner {
  return {
    id: row.id,
    name: row.name,
    email: orNull(row.email),
    phone: orNull(row.phone),
    city: orNull(row.city),
    patientCount: row.patientCount,
  };
}

export type PatientRow = {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  speciesCode: string | null;
  breed: string | null;
  birthDate: Date | null;
  lastAppointmentAt: Date | null;
};

export function toMobilePatient(row: PatientRow): MobilePatient {
  return {
    id: row.id,
    ownerId: row.ownerId,
    ownerName: row.ownerName,
    name: row.name,
    species: resolveSpecies(row.speciesCode),
    breed: orNull(row.breed),
    birthDate: isoOrNull(row.birthDate),
    lastAppointmentAt: isoOrNull(row.lastAppointmentAt),
  };
}

export type HistoryRow = {
  appointmentId: string;
  beginAt: Date;
  reportId: string | null;
  reportStatus: ReportStatus | null;
  consultationReason: string | null;
};

export function toHistoryEntry(row: HistoryRow): MobilePatientHistoryEntry {
  return {
    appointmentId: row.appointmentId,
    beginAt: row.beginAt.toISOString(),
    reportId: row.reportId,
    reportStatus: row.reportStatus,
    consultationReason: row.consultationReason ?? "",
  };
}
```

Si `ReportStatus` n'est pas exporté par `@biume/contracts/report`, l'ajouter :

```ts
export type ReportStatus = z.infer<typeof reportStatusSchema>;
```

- [ ] **Étape 4 : Lancer les tests et vérifier qu'ils passent**

Commande : `bun --filter @biume/web test -- records.repository`

Attendu : SUCCÈS, 7 tests.

- [ ] **Étape 5 : Valider**

```bash
rtk git add apps/web/src/server/mobile/records.repository.ts apps/web/src/server/mobile/records.repository.test.ts packages/contracts/src/report.ts
rtk git commit -m "feat(web): convertir les fiches vers les contrats mobiles"
```

---

### Tâche 3 : Endpoints de lecture des fiches et de l'historique

**Fichiers :**
- Modifier : `apps/web/src/server/mobile/mobile-api.routes.ts`
- Modifier : `apps/web/src/server/mobile/mobile-api.ts`
- Test : `apps/web/src/server/mobile/mobile-api.records.test.ts` (créer)

**Interfaces :**
- Consomme : les contrats de la tâche 1 ; `fail`, `validated`, le type `Variables` et l'application de la tâche 4 du plan 2.
- Produit, ajouts à `MobileApiPorts` :
  - `listOwners(actor: CaptureActor, query: { limit: number; cursor: string | null; search: string | null }): Promise<MobileOwnersResponse>`
  - `listPatients(actor: CaptureActor, query: { limit: number; cursor: string | null; ownerId: string | null; search: string | null }): Promise<MobilePatientsResponse>`
  - `getPatientHistory(actor: CaptureActor, patientId: string, query: { limit: number; cursor: string | null }): Promise<MobilePatientHistoryResponse>`
- Produit, routes : `GET /owners`, `GET /patients`, `GET /patients/{patientId}/history`.

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `apps/web/src/server/mobile/mobile-api.records.test.ts` :

```ts
import {
  mobileOwnersResponseSchema,
  mobilePatientHistoryResponseSchema,
  mobilePatientsResponseSchema,
} from "@biume/contracts/mobile-records";
import { describe, expect, it, vi } from "vitest";

import { createMobileApiHandler, type MobileApiPorts } from "./mobile-api";

const owner = {
  id: "client-1",
  name: "Camille Roux",
  email: null,
  phone: null,
  city: null,
  patientCount: 1,
};

const patient = {
  id: "pet-1",
  ownerId: "client-1",
  ownerName: "Camille Roux",
  name: "Filou",
  species: "DOG" as const,
  breed: null,
  birthDate: null,
  lastAppointmentAt: null,
};

function createPorts(overrides: Partial<MobileApiPorts> = {}): MobileApiPorts {
  return {
    authenticate: vi.fn(async () => ({
      userId: "user-1",
      organization: { id: "org-1", name: "Cabinet Biume" },
    })),
    listOwners: vi.fn(async () => ({ items: [owner], nextCursor: null })),
    listPatients: vi.fn(async () => ({ items: [patient], nextCursor: null })),
    getPatientHistory: vi.fn(async () => ({ items: [], nextCursor: null })),
    listAppointments: vi.fn(async () => ({ items: [], nextCursor: null })),
    listCaptures: vi.fn(async () => ({ items: [], nextCursor: null })),
    createCapture: vi.fn(),
    createUploadSession: vi.fn(),
    completeCapture: vi.fn(),
    cancelCapture: vi.fn(),
    createOwner: vi.fn(),
    createPatient: vi.fn(),
    moveAppointment: vi.fn(),
    ...overrides,
  } as unknown as MobileApiPorts;
}

function get(path: string) {
  return new Request(`https://biume.test/api/mobile/v1${path}`, {
    headers: { authorization: "Bearer jeton" },
  });
}

describe("lecture des fiches", () => {
  it("retourne les propriétaires au format du contrat", async () => {
    const response = await createMobileApiHandler(createPorts())(get("/owners"));

    expect(response.status).toBe(200);
    expect(mobileOwnersResponseSchema.parse(await response.json()).items).toHaveLength(1);
  });

  it("retourne les animaux au format du contrat", async () => {
    const response = await createMobileApiHandler(createPorts())(get("/patients"));

    expect(response.status).toBe(200);
    expect(mobilePatientsResponseSchema.parse(await response.json()).items).toHaveLength(1);
  });

  it("transmet le filtre par propriétaire au port", async () => {
    const ports = createPorts();
    await createMobileApiHandler(ports)(get("/patients?ownerId=client-1"));

    expect(ports.listPatients).toHaveBeenCalledWith(
      { practitionerId: "user-1", organizationId: "org-1" },
      expect.objectContaining({ ownerId: "client-1" }),
    );
  });

  /**
   * Une limite non bornée transformerait un cabinet chargé en lecture massive.
   * Elle est ramenée à la borne, jamais refusée : un client qui demande trop
   * reçoit simplement la page bornée.
   */
  it("borne la taille de page demandée", async () => {
    const ports = createPorts();
    await createMobileApiHandler(ports)(get("/owners?limit=5000"));

    expect(ports.listOwners).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ limit: 50 }),
    );
  });

  it("retourne l'historique d'un animal", async () => {
    const response = await createMobileApiHandler(createPorts())(
      get("/patients/pet-1/history"),
    );

    expect(response.status).toBe(200);
    expect(mobilePatientHistoryResponseSchema.parse(await response.json())).toBeTruthy();
  });

  it("refuse une session sans organisation active", async () => {
    const ports = createPorts({
      authenticate: vi.fn(async () => ({ userId: "user-1", organization: null })),
    });
    const response = await createMobileApiHandler(ports)(get("/owners"));

    expect(response.status).toBe(409);
    expect((await response.json()).code).toBe("active_organization_required");
  });

  it("refuse une requête sans session", async () => {
    const ports = createPorts({ authenticate: vi.fn(async () => null) });
    const response = await createMobileApiHandler(ports)(get("/owners"));

    expect(response.status).toBe(401);
  });
});
```

- [ ] **Étape 2 : Lancer les tests et vérifier qu'ils échouent**

Commande : `bun --filter @biume/web test -- mobile-api.records`

Attendu : ÉCHEC, les routes renvoient 404.

- [ ] **Étape 3 : Décrire les routes**

Dans `mobile-api.routes.ts`, ajouter les imports depuis `@biume/contracts/mobile-records` puis :

```ts
export const recordsQuerySchema = z
  .object({
    limit: z.coerce.number().int().positive().optional(),
    cursor: z.string().min(1).optional(),
    search: z.string().trim().min(1).optional(),
  })
  .strict();

export const patientsQuerySchema = recordsQuerySchema.extend({
  ownerId: z.string().min(1).optional(),
});

export const patientIdParamsSchema = z.object({
  patientId: z.string().min(1).openapi({ param: { name: "patientId", in: "path" } }),
});

export const ownersRoute = createRoute({
  method: "get",
  path: "/owners",
  security,
  summary: "Propriétaires du cabinet",
  request: { query: recordsQuerySchema },
  responses: {
    200: { description: "Page de propriétaires", content: json(mobileOwnersResponseSchema) },
    ...errorResponses,
  },
});

export const patientsRoute = createRoute({
  method: "get",
  path: "/patients",
  security,
  summary: "Animaux suivis par le cabinet",
  request: { query: patientsQuerySchema },
  responses: {
    200: { description: "Page d'animaux", content: json(mobilePatientsResponseSchema) },
    ...errorResponses,
  },
});

export const patientHistoryRoute = createRoute({
  method: "get",
  path: "/patients/{patientId}/history",
  security,
  summary: "Séances récentes d'un animal et état de leur compte rendu",
  request: { params: patientIdParamsSchema, query: recordsQuerySchema },
  responses: {
    200: {
      description: "Historique",
      content: json(mobilePatientHistoryResponseSchema),
    },
    ...errorResponses,
  },
});
```

- [ ] **Étape 4 : Ajouter les ports et les gestionnaires**

Dans `mobile-api.ts`, étendre `MobileApiPorts` avec les trois signatures listées en « Interfaces », puis ajouter après le gestionnaire `appointmentsRoute` :

```ts
  const boundLimit = (limit: number | undefined) =>
    Math.min(limit ?? mobileAgendaDefaultLimit, mobileRecordsPageSize);

  app.openapi(ownersRoute, async (c) => {
    const { limit, cursor, search } = c.req.valid("query");
    const page = await ports.listOwners(c.get("actor"), {
      limit: boundLimit(limit),
      cursor: cursor ?? null,
      search: search ?? null,
    });
    return validated(c, 200, mobileOwnersResponseSchema, page);
  });

  app.openapi(patientsRoute, async (c) => {
    const { limit, cursor, search, ownerId } = c.req.valid("query");
    const page = await ports.listPatients(c.get("actor"), {
      limit: boundLimit(limit),
      cursor: cursor ?? null,
      search: search ?? null,
      ownerId: ownerId ?? null,
    });
    return validated(c, 200, mobilePatientsResponseSchema, page);
  });

  app.openapi(patientHistoryRoute, async (c) => {
    const { limit, cursor } = c.req.valid("query");
    const page = await ports.getPatientHistory(
      c.get("actor"),
      c.req.valid("param").patientId,
      { limit: boundLimit(limit), cursor: cursor ?? null },
    );
    return validated(c, 200, mobilePatientHistoryResponseSchema, page);
  });
```

Importer `mobileRecordsPageSize` et les schémas de réponse depuis `@biume/contracts/mobile-records`.

- [ ] **Étape 5 : Lancer les tests et vérifier qu'ils passent**

Commande : `bun --filter @biume/web test -- mobile-api`

Attendu : SUCCÈS. Les 26 tests d'origine, les 3 tests OpenAPI et les 7 nouveaux passent.

- [ ] **Étape 6 : Régénérer le contrat**

Commandes :

```bash
bun --filter @biume/web emit-openapi
bun --filter @biume/web test -- openapi-drift
```

Attendu : SUCCÈS. Le fichier régénéré décrit neuf chemins.

- [ ] **Étape 7 : Valider**

```bash
rtk git add apps/web/src/server/mobile/ apps/web/openapi.json
rtk git commit -m "feat(web): exposer les fiches et l'historique sur l'api mobile"
```

---

### Tâche 4 : Création d'un propriétaire et d'un animal

**Fichiers :**
- Modifier : `apps/web/src/server/mobile/mobile-api.routes.ts`
- Modifier : `apps/web/src/server/mobile/mobile-api.ts`
- Modifier : `apps/web/src/server/mobile/mobile-api.records.test.ts`

**Interfaces :**
- Consomme : `createMobileOwnerRequestSchema`, `createMobilePatientRequestSchema`, `mobileOwnerSchema`, `mobilePatientSchema` de la tâche 1.
- Produit, ajouts à `MobileApiPorts` :
  - `createOwner(actor: CaptureActor, request: CreateMobileOwnerRequest): Promise<MobileOwner>`
  - `createPatient(actor: CaptureActor, request: CreateMobilePatientRequest): Promise<MobilePatient>`
- Produit, routes : `POST /owners`, `POST /patients`.

Ces deux endpoints exigent le réseau, et c'est assumé : le cache local est en lecture seule et aucune écriture n'est mise en file. Sans connexion, l'application propose de dicter d'abord et de rattacher ensuite.

- [ ] **Étape 1 : Écrire les tests qui échouent**

Ajouter à `mobile-api.records.test.ts` :

```tsx
function post(path: string, body: unknown) {
  return new Request(`https://biume.test/api/mobile/v1${path}`, {
    method: "POST",
    headers: {
      authorization: "Bearer jeton",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("création de fiches", () => {
  it("crée un propriétaire à partir du seul nom", async () => {
    const ports = createPorts({ createOwner: vi.fn(async () => owner) });
    const response = await createMobileApiHandler(ports)(
      post("/owners", { name: "Camille Roux" }),
    );

    expect(response.status).toBe(201);
    expect(ports.createOwner).toHaveBeenCalledWith(
      { practitionerId: "user-1", organizationId: "org-1" },
      { name: "Camille Roux" },
    );
  });

  it("rejette un propriétaire sans nom", async () => {
    const response = await createMobileApiHandler(createPorts())(
      post("/owners", { name: "   " }),
    );

    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe("validation");
  });

  /**
   * Le client ne décide jamais du locataire. Un `organizationId` transmis est
   * une charge rejetée, jamais un champ silencieusement ignoré.
   */
  it("rejette une charge qui tente de choisir son organisation", async () => {
    const response = await createMobileApiHandler(createPorts())(
      post("/owners", { name: "Camille Roux", organizationId: "org-2" }),
    );

    expect(response.status).toBe(400);
  });

  it("crée un animal avec le minimum de terrain", async () => {
    const ports = createPorts({ createPatient: vi.fn(async () => patient) });
    const response = await createMobileApiHandler(ports)(
      post("/patients", { ownerId: "client-1", name: "Filou", species: "DOG" }),
    );

    expect(response.status).toBe(201);
  });

  it("rejette un animal dont l'espèce est inconnue", async () => {
    const response = await createMobileApiHandler(createPorts())(
      post("/patients", { ownerId: "client-1", name: "Filou", species: "DRAGON" }),
    );

    expect(response.status).toBe(400);
  });
});
```

- [ ] **Étape 2 : Lancer les tests et vérifier qu'ils échouent**

Commande : `bun --filter @biume/web test -- mobile-api.records`

Attendu : ÉCHEC, les routes POST renvoient 404.

- [ ] **Étape 3 : Décrire et brancher les routes**

Dans `mobile-api.routes.ts` :

```ts
export const createOwnerRoute = createRoute({
  method: "post",
  path: "/owners",
  security,
  summary: "Créer un propriétaire depuis le terrain",
  request: { body: { content: json(createMobileOwnerRequestSchema) } },
  responses: {
    201: { description: "Propriétaire créé", content: json(mobileOwnerSchema) },
    ...errorResponses,
  },
});

export const createPatientRoute = createRoute({
  method: "post",
  path: "/patients",
  security,
  summary: "Créer un animal rattaché à un propriétaire",
  request: { body: { content: json(createMobilePatientRequestSchema) } },
  responses: {
    201: { description: "Animal créé", content: json(mobilePatientSchema) },
    ...errorResponses,
  },
});
```

Dans `mobile-api.ts` :

```ts
  app.openapi(createOwnerRoute, async (c) => {
    const created = await ports.createOwner(c.get("actor"), c.req.valid("json"));
    return validated(c, 201, mobileOwnerSchema, created);
  });

  app.openapi(createPatientRoute, async (c) => {
    const created = await ports.createPatient(c.get("actor"), c.req.valid("json"));
    return validated(c, 201, mobilePatientSchema, created);
  });
```

- [ ] **Étape 4 : Lancer les tests et vérifier qu'ils passent**

Commande : `bun --filter @biume/web test -- mobile-api`

Attendu : SUCCÈS.

- [ ] **Étape 5 : Régénérer le contrat et valider**

```bash
bun --filter @biume/web emit-openapi
bun --filter @biume/web test -- openapi-drift
rtk git add apps/web/src/server/mobile/ apps/web/openapi.json
rtk git commit -m "feat(web): creer un proprietaire et un animal depuis le mobile"
```

---

### Tâche 5 : Déplacement d'un rendez-vous avec conflits

Le déplacement est le deuxième geste de terrain le plus fréquent. Il réutilise le prédicat pur du plan 1, ce qui garantit que le web et le mobile signalent exactement les mêmes chevauchements.

**Fichiers :**
- Modifier : `apps/web/src/server/mobile/mobile-api.routes.ts`
- Modifier : `apps/web/src/server/mobile/mobile-api.ts`
- Test : `apps/web/src/server/mobile/mobile-api.move.test.ts` (créer)

**Interfaces :**
- Consomme : `moveAppointmentRequestSchema`, `moveAppointmentResponseSchema` de la tâche 1 ; `findAppointmentConflicts` de `#/lib/dashboard/appointment-conflicts` (plan 1).
- Produit, ajout à `MobileApiPorts` :
  - `moveAppointment(actor: CaptureActor, appointmentId: string, slot: MoveAppointmentRequest): Promise<MoveAppointmentResponse>`
- Produit, route : `POST /appointments/{appointmentId}/move`.

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `apps/web/src/server/mobile/mobile-api.move.test.ts` :

```ts
import { moveAppointmentResponseSchema } from "@biume/contracts/mobile-records";
import { describe, expect, it, vi } from "vitest";

import { CaptureServiceError } from "./capture.service";
import { createMobileApiHandler, type MobileApiPorts } from "./mobile-api";

const moved = {
  appointmentId: "appointment-1",
  beginAt: "2026-08-21T14:00:00.000Z",
  endAt: "2026-08-21T15:00:00.000Z",
  conflicts: [],
};

function createPorts(overrides: Partial<MobileApiPorts> = {}): MobileApiPorts {
  return {
    authenticate: vi.fn(async () => ({
      userId: "user-1",
      organization: { id: "org-1", name: "Cabinet Biume" },
    })),
    moveAppointment: vi.fn(async () => moved),
    ...overrides,
  } as unknown as MobileApiPorts;
}

function move(body: unknown, appointmentId = "appointment-1") {
  return new Request(
    `https://biume.test/api/mobile/v1/appointments/${appointmentId}/move`,
    {
      method: "POST",
      headers: {
        authorization: "Bearer jeton",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
}

const slot = {
  beginAt: "2026-08-21T14:00:00.000Z",
  endAt: "2026-08-21T15:00:00.000Z",
};

describe("déplacement d'un rendez-vous", () => {
  it("déplace et retourne le créneau appliqué", async () => {
    const response = await createMobileApiHandler(createPorts())(move(slot));

    expect(response.status).toBe(200);
    expect(moveAppointmentResponseSchema.parse(await response.json())).toEqual(moved);
  });

  /**
   * Le chevauchement informe, il ne bloque pas. Un praticien qui superpose deux
   * séances au même endroit sait ce qu'il fait ; l'empêcher serait une décision
   * prise à sa place.
   */
  it("aboutit malgré un chevauchement et le signale", async () => {
    const ports = createPorts({
      moveAppointment: vi.fn(async () => ({
        ...moved,
        conflicts: [
          {
            appointmentId: "appointment-2",
            beginAt: "2026-08-21T14:30:00.000Z",
            patientName: "Filou",
          },
        ],
      })),
    });
    const response = await createMobileApiHandler(ports)(move(slot));

    expect(response.status).toBe(200);
    expect((await response.json()).conflicts).toHaveLength(1);
  });

  it("rejette une fin antérieure au début", async () => {
    const response = await createMobileApiHandler(createPorts())(
      move({ beginAt: slot.endAt, endAt: slot.beginAt }),
    );

    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe("validation");
  });

  it("traduit un rendez-vous introuvable en 404", async () => {
    const ports = createPorts({
      moveAppointment: vi.fn(async () => {
        throw new CaptureServiceError("not_found", false);
      }),
    });
    const response = await createMobileApiHandler(ports)(move(slot));

    expect(response.status).toBe(404);
  });

  it("ne laisse fuir aucun détail technique sur erreur interne", async () => {
    const ports = createPorts({
      moveAppointment: vi.fn(async () => {
        throw new Error('relation "appointments" does not exist');
      }),
    });
    const response = await createMobileApiHandler(ports)(move(slot));

    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("relation");
  });
});
```

Vérifier la signature réelle de `CaptureServiceError` dans `capture.service.ts` avant d'écrire ce test, et l'ajuster si son constructeur diffère.

- [ ] **Étape 2 : Lancer les tests et vérifier qu'ils échouent**

Commande : `bun --filter @biume/web test -- mobile-api.move`

Attendu : ÉCHEC, la route renvoie 404.

- [ ] **Étape 3 : Décrire et brancher la route**

Dans `mobile-api.routes.ts` :

```ts
export const appointmentIdParamsSchema = z.object({
  appointmentId: z
    .string()
    .min(1)
    .openapi({ param: { name: "appointmentId", in: "path" } }),
});

export const moveAppointmentRoute = createRoute({
  method: "post",
  path: "/appointments/{appointmentId}/move",
  security,
  summary: "Déplacer une séance, en signalant les chevauchements",
  request: {
    params: appointmentIdParamsSchema,
    body: { content: json(moveAppointmentRequestSchema) },
  },
  responses: {
    200: {
      description: "Séance déplacée",
      content: json(moveAppointmentResponseSchema),
    },
    ...errorResponses,
  },
});
```

Dans `mobile-api.ts` :

```ts
  app.openapi(moveAppointmentRoute, async (c) => {
    const result = await ports.moveAppointment(
      c.get("actor"),
      c.req.valid("param").appointmentId,
      c.req.valid("json"),
    );
    return validated(c, 200, moveAppointmentResponseSchema, result);
  });
```

- [ ] **Étape 4 : Lancer les tests et vérifier qu'ils passent**

Commande : `bun --filter @biume/web test -- mobile-api`

Attendu : SUCCÈS.

- [ ] **Étape 5 : Régénérer le contrat et valider**

```bash
bun --filter @biume/web emit-openapi
bun --filter @biume/web test -- openapi-drift
rtk git add apps/web/src/server/mobile/ apps/web/openapi.json
rtk git commit -m "feat(web): deplacer une seance depuis le mobile"
```

---

### Tâche 6 : Implémentations de production

Jusqu'ici les gestionnaires ont été validés contre des ports simulés. Cette tâche les branche sur la base.

**Fichiers :**
- Modifier : `apps/web/src/server/mobile/mobile-api.ports.ts`
- Modifier : `apps/web/src/server/mobile/records.repository.ts`

**Interfaces :**
- Consomme : les convertisseurs de la tâche 2 ; `findAppointmentConflicts` du plan 1 ; les tables `clients`, `pets`, `animals`, `appointments`, `advancedReport`.
- Produit : `createProductionMobileApiPorts()` implémente les six nouveaux ports.

- [ ] **Étape 1 : Implémenter les lectures**

Dans `mobile-api.ports.ts`, ajouter les six implémentations. Chacune suit le même squelette, dont l'invariant est non négociable :

```ts
    async listOwners(actor, query) {
      const cursor = query.cursor ? decodeCursor(query.cursor) : null;

      const rows = await db
        .select({
          id: clients.id,
          name: clients.name,
          email: clients.email,
          phone: clients.phone,
          city: clients.city,
          patientCount: sql<number>`count(${pets.id})::int`,
        })
        .from(clients)
        .leftJoin(pets, eq(pets.ownerId, clients.id))
        .where(
          and(
            // La frontière de locataire est portée par l'acteur, jamais par la
            // requête du client.
            eq(clients.organizationId, actor.organizationId),
            query.search ? ilike(clients.name, `%${query.search}%`) : undefined,
            cursor ? gt(clients.id, cursor.id) : undefined,
          ),
        )
        .groupBy(clients.id)
        .orderBy(clients.id)
        // Une ligne de plus que demandé : sa présence dit qu'il reste une page,
        // sans second appel de comptage.
        .limit(query.limit + 1);

      const page = rows.slice(0, query.limit);

      return {
        items: page.map(toMobileOwner),
        nextCursor:
          rows.length > query.limit && page.length > 0
            ? encodeCursor({ id: page[page.length - 1].id })
            : null,
      };
    },
```

Appliquer le même motif à `listPatients` (avec la jointure sur `animals` pour le code d'espèce et sur `clients` pour le nom du propriétaire) et à `getPatientHistory` (jointure `appointments` × `advancedReport`, tri décroissant sur `beginAt`, filtré sur `pets.organizationId`).

- [ ] **Étape 2 : Implémenter les créations**

```ts
    async createOwner(actor, request) {
      const [created] = await db
        .insert(clients)
        .values({
          name: request.name,
          email: request.email ?? null,
          phone: request.phone ?? null,
          city: request.city ?? null,
          organizationId: actor.organizationId,
        })
        .returning({
          id: clients.id,
          name: clients.name,
          email: clients.email,
          phone: clients.phone,
          city: clients.city,
        });

      return toMobileOwner({ ...created, patientCount: 0 });
    },
```

Pour `createPatient`, vérifier **avant l'insertion** que le propriétaire appartient bien à l'organisation de l'acteur, et lever `new CaptureServiceError("not_found", false)` sinon. Sans cette vérification, un identifiant de propriétaire deviné rattacherait un animal au dossier d'un autre cabinet.

- [ ] **Étape 3 : Implémenter le déplacement**

```ts
    async moveAppointment(actor, appointmentId, slot) {
      const beginAt = new Date(slot.beginAt);
      const endAt = new Date(slot.endAt);

      const [target] = await db
        .select({ id: appointments.id })
        .from(appointments)
        .where(
          and(
            eq(appointments.id, appointmentId),
            eq(appointments.organizationId, actor.organizationId),
          ),
        )
        .limit(1);

      if (!target) throw new CaptureServiceError("not_found", false);

      // La fenêtre de lecture est bornée à la journée concernée : détecter un
      // chevauchement ne justifie jamais de charger tout l'agenda.
      const dayStart = new Date(beginAt);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(beginAt);
      dayEnd.setHours(23, 59, 59, 999);

      const candidates = await db
        .select({
          id: appointments.id,
          beginAt: appointments.beginAt,
          endAt: appointments.endAt,
          status: appointments.status,
          patientName: pets.name,
        })
        .from(appointments)
        .leftJoin(pets, eq(appointments.patientId, pets.id))
        .where(
          and(
            eq(appointments.organizationId, actor.organizationId),
            gte(appointments.beginAt, dayStart),
            lte(appointments.beginAt, dayEnd),
          ),
        );

      await db
        .update(appointments)
        .set({ beginAt, endAt, updatedAt: new Date() })
        .where(
          and(
            eq(appointments.id, appointmentId),
            eq(appointments.organizationId, actor.organizationId),
          ),
        );

      const conflicts = findAppointmentConflicts({
        beginAt,
        endAt,
        excludeAppointmentId: appointmentId,
        candidates,
      });

      return {
        appointmentId,
        beginAt: beginAt.toISOString(),
        endAt: endAt.toISOString(),
        conflicts: conflicts.map((conflict) => ({
          appointmentId: conflict.id,
          beginAt: new Date(conflict.beginAt).toISOString(),
          patientName: conflict.patientName,
        })),
      };
    },
```

- [ ] **Étape 4 : Vérifier les types et la suite complète**

Commandes :

```bash
bun --filter @biume/web check-types
bun --filter @biume/web test
```

Attendu : SUCCÈS pour les deux.

- [ ] **Étape 5 : Vérifier en conditions réelles**

Serveur démarré, avec un jeton porteur valide :

```bash
rtk curl -s "http://localhost:3000/api/mobile/v1/owners?limit=2" -H 'authorization: Bearer <jeton>'
rtk curl -s "http://localhost:3000/api/mobile/v1/patients?ownerId=<un id réel>" -H 'authorization: Bearer <jeton>'
```

Attendu : des données du cabinet du jeton, et **uniquement** de ce cabinet. Vérifier explicitement avec un identifiant de propriétaire appartenant à une autre organisation qu'aucune donnée ne remonte.

- [ ] **Étape 6 : Valider**

```bash
rtk git add apps/web/src/server/mobile/
rtk git commit -m "feat(web): brancher les endpoints metier mobiles sur la base"
```

---

## Critères d'acceptation du plan

- `openapi.json` décrit onze chemins et l'intégration continue échoue s'il dérive.
- Aucune lecture ne remonte de donnée appartenant à une autre organisation, ce qui a été vérifié avec un identifiant d'un autre cabinet.
- Une charge portant un `organizationId` est rejetée en 400, jamais silencieusement ignorée.
- Toute liste est bornée à 50 éléments quelle que soit la limite demandée.
- Un déplacement aboutit même en cas de chevauchement, et retourne les séances concernées.
- Le web et le mobile signalent exactement les mêmes chevauchements, puisqu'ils partagent `findAppointmentConflicts`.
- Aucune réponse ne contient de message dérivé d'une exception ou d'une base.
