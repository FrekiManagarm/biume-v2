# Mobile lot A — Parcours signature — Plan d'implémentation

> **Pour les agents d'exécution :** SOUS-COMPÉTENCE REQUISE : utiliser `superpowers:subagent-driven-development` (recommandé) ou `superpowers:executing-plans` pour exécuter ce plan tâche par tâche. Les étapes utilisent la syntaxe à cases (`- [ ]`) pour le suivi.

**Objectif :** Qu'un praticien puisse, depuis son téléphone, aller de la dictée au compte rendu envoyé au propriétaire et au suivi programmé, sans passer par le web, et qu'il voie à l'ouverture de l'application tout ce qui attend un geste de sa part.

**Architecture :** Côté serveur, cinq endpoints Hono nouveaux (rattacher, extraire, à traiter, finaliser, e-mail propriétaire) et deux corrections (programmation du suivi, régénération), tous validés par les contrats Zod de `packages/contracts` et figés dans `apps/web/openapi.json`. Côté Flutter, les features `transcript` et `report` existantes sont branchées sur des dépôts HTTP réels, deux features nouvelles (`records` pour le sélecteur d'animal, `todo` pour « À traiter ») et un accueil unique remplacent l'écran d'agenda. La logique reste dans des cubits testés sur doublures ; les écrans sont minces.

**Pile technique :** Bun, Hono + `@hono/zod-openapi`, Drizzle, Trigger.dev, Resend, Vitest ; Flutter, `flutter_bloc`, `get_it`, `go_router`, `drift`, `dio`, `bloc_test`, `mocktail`.

**Spécification :** `docs/superpowers/specs/2026-09-03-mobile-v1-completion-design.md` (sections 5.2 à 5.6, 6, 7). Design parent : `docs/superpowers/specs/2026-08-21-mobile-flutter-rewrite-design.md`.

## Contraintes globales

- Gestionnaire de paquets : **Bun uniquement**. Toute commande est préfixée `rtk`.
- `packages/contracts` est la source de vérité des schémas. `apps/web/openapi.json` est régénéré avec `rtk bun --filter @biume/web emit-openapi` et commité **avant** la première ligne de Dart qui consomme un endpoint. Le test `openapi-drift.test.ts` doit passer.
- Toute lecture serveur filtre sur `organizationId` en plus de l'identifiant demandé. Pour un rapport, le locataire est la colonne `advancedReport.createdBy`.
- Les erreurs serveur hors capture lèvent `MobileRequestError(code, { retryable })` (`apps/web/src/server/mobile/mobile-api.errors.ts`). Codes autorisés : `validation`, `unauthorized`, `active_organization_required`, `forbidden`, `method_not_allowed`, `not_found`, `conflict`, `rate_limited`, `server_error`, `storage_unavailable`, `object_incomplete`, `expired`, `network`, `unknown`.
- Aucune URL signée, aucun jeton de partage, aucun corps de réponse de fournisseur, aucun message d'exception n'atteint le client ni un journal.
- Le mobile **valide, il n'édite pas**. La seule saisie de texte libre est la correction de transcription. L'e-mail du propriétaire est un champ de fiche, pas une édition de rapport.
- Interface en **français**, vocabulaire métier, jamais un état machine à l'écran. Les libellés « À traiter » sont des constantes uniques (`todoLabels`).
- Cache hors ligne en **lecture seule**. Les seules écritures locales sont la file de dictées et l'animal choisi pour une dictée en file.
- Aucun écran ne bloque en attendant le serveur.
- Identifiant de parcours de télémétrie = identifiant de capture, porté de la dictée au suivi.
- Flutter : `rtk flutter analyze` sans avertissement, `rtk flutter test` vert, `flutter_lints` par défaut. Codegen drift : `rtk dart run build_runner build --delete-conflicting-outputs`.
- Commits en français, préfixés `feat(mobile):`, `feat(web):`, `fix(web):`, `chore(contracts):`.

---

## Structure des fichiers

```
packages/contracts/src/
  capture.ts                       (modifier) attachCaptureRequestSchema, extractCaptureResponseSchema
  proposal.ts                      (modifier) reportProposalsResponseSchema étendu ; finalizeReportRequest/ResponseSchema
  mobile-records.ts                (modifier) updateOwnerEmailRequestSchema
  mobile-todo.ts                   (créer)   todoItemKinds, todoItemSchema, todoResponseSchema
  mobile-todo.test.ts              (créer)

apps/web/src/server/mobile/
  mobile-api.routes.ts             (modifier) 5 routes nouvelles, ownerIdParamsSchema
  mobile-api.ts                    (modifier) 5 ports, 5 handlers
  mobile-api.ports.ts              (modifier) implémentations, corrections suivi et régénération
  capture.service.ts               (modifier) exporter toCaptureResponse
  todo.service.ts                  (créer)   classifyTodo pur
  todo.service.test.ts             (créer)
  report-email.ts                  (créer)   envoi Resend du compte rendu
  mobile-api.attach.test.ts        (créer)
  mobile-api.finalize.test.ts      (créer)
  mobile-api.todo.test.ts          (créer)
  mobile-api.followup.test.ts      (modifier)
apps/web/src/server/report/
  report-shared-version.ports.ts   (créer)   ports Drizzle déplacés depuis reports.function.ts
  finalize-report.service.ts       (créer)   finalizeReport pur
  finalize-report.service.test.ts  (créer)
apps/web/src/functions/reports.function.ts (modifier) importe les ports déplacés
apps/web/openapi.json              (régénérer)

apps/mobile/lib/
  core/ids/uuid.dart                             (créer)   uuidV4
  core/lifecycle/foreground_refresh.dart         (créer)   observateur de reprise au premier plan
  core/database/app_database.dart                (modifier) LocalCaptures.patientId, extractionRequestedAt, schéma v2
  features/capture/domain/capture_store.dart     (modifier) attachPatient, patientId
  features/capture/domain/sync_decision.dart     (modifier) SyncCandidate.patientId
  features/capture/domain/upload_client.dart     (modifier) CaptureApi.attach
  features/capture/domain/sync_engine.dart       (modifier) rattachement après déclaration
  features/capture/data/drift_capture_store.dart (modifier)
  features/capture/data/http_capture_api.dart    (modifier)
  features/capture/presentation/recording_page.dart (modifier) uuidV4, patientId
  features/records/domain/patient.dart           (créer)
  features/records/domain/patient_repository.dart (créer)
  features/records/data/patient_repository_impl.dart (créer)
  features/records/presentation/patient_picker_cubit.dart (créer)
  features/records/presentation/patient_picker_screen.dart (créer)
  features/transcript/domain/transcript_repository.dart (modifier) attach, extract
  features/transcript/data/http_transcript_repository.dart (créer)
  features/transcript/presentation/transcript_cubit.dart (modifier) validate
  features/transcript/presentation/transcript_page.dart (créer)
  features/transcript/presentation/transcript_screen.dart (créer)
  features/report/domain/proposal.dart           (modifier) ReportStatus, ReportOwner, ReportProposals étendu
  features/report/domain/report_repository.dart  (modifier) finalize, updateOwnerEmail
  features/report/data/http_report_repository.dart (créer)
  features/report/presentation/report_cubit.dart (modifier) attente d'extraction, finalize, e-mail
  features/report/presentation/report_screen.dart (modifier) finalisation, garde-fou e-mail, lecture seule
  features/followup/domain/follow_up_repository.dart (créer)
  features/followup/data/http_follow_up_repository.dart (créer)
  features/followup/presentation/follow_up_schedule_cubit.dart (créer)
  features/followup/presentation/follow_up_schedule_screen.dart (créer)
  features/todo/domain/todo_item.dart            (créer)   TodoKind, todoLabels, TodoItem
  features/todo/domain/todo_api.dart             (créer)
  features/todo/data/http_todo_api.dart          (créer)
  features/todo/presentation/todo_cubit.dart     (créer)
  features/todo/presentation/todo_section.dart   (créer)
  features/home/presentation/home_screen.dart    (créer)   accueil unique
  features/agenda/presentation/agenda_screen.dart (modifier) AgendaBody extrait
  core/telemetry/telemetry.dart                  (modifier) propriétés autorisées
  core/telemetry/journey_events.dart             (créer)   noms d'événements du parcours
  config/app_router.dart                         (modifier) routes
  injection_container.dart                       (modifier) dépôts nouveaux
  main.dart                                      (modifier) rafraîchissement au premier plan
apps/mobile/test/                                 miroirs
docs/mobile/manual-test-matrix.md                (modifier)
```

---

## Partie 1 — Contrats et serveur

### Tâche 1 : Contrats des cinq endpoints

**Fichiers :**
- Modifier : `packages/contracts/src/capture.ts`
- Modifier : `packages/contracts/src/proposal.ts`
- Modifier : `packages/contracts/src/mobile-records.ts`
- Créer : `packages/contracts/src/mobile-todo.ts`
- Test : `packages/contracts/src/mobile-todo.test.ts`, `packages/contracts/src/proposal.test.ts` (ajout)

**Interfaces :**
- Produit : `attachCaptureRequestSchema`, `extractCaptureResponseSchema`, `finalizeReportRequestSchema`, `finalizeReportResponseSchema`, `updateOwnerEmailRequestSchema`, `todoItemKinds`, `todoItemSchema`, `todoResponseSchema`, et `reportProposalsResponseSchema` étendu de `status`, `patientName`, `owner`.
- Les tâches 2 à 8 importent ces noms tels quels.

- [ ] **Étape 1 : Écrire les tests qui échouent**

`packages/contracts/src/mobile-todo.test.ts` :

```ts
import { describe, expect, it } from "vitest";
import { todoItemSchema, todoResponseSchema } from "./mobile-todo";

describe("contrat « à traiter »", () => {
  it("accepte un élément à rattacher sans rapport", () => {
    const parsed = todoItemSchema.parse({
      kind: "to_attach",
      captureId: "2f1e5c2e-4b7d-4a55-9d4a-1c0a8f5b9e11",
      reportId: null,
      appointmentId: null,
      patientName: null,
      updatedAt: "2026-09-03T10:00:00.000Z",
    });
    expect(parsed.kind).toBe("to_attach");
  });

  it("refuse un genre inconnu", () => {
    expect(() =>
      todoItemSchema.parse({
        kind: "proposed",
        captureId: "2f1e5c2e-4b7d-4a55-9d4a-1c0a8f5b9e11",
        reportId: null,
        appointmentId: null,
        patientName: null,
        updatedAt: "2026-09-03T10:00:00.000Z",
      }),
    ).toThrow();
  });

  it("borne la liste à cent éléments", () => {
    expect(todoResponseSchema.shape.items._zod.def.checks?.length ?? 1).toBeGreaterThan(0);
  });
});
```

Ajout dans `packages/contracts/src/proposal.test.ts` :

```ts
import { finalizeReportResponseSchema, reportProposalsResponseSchema } from "./proposal";

describe("réponse des propositions", () => {
  it("porte l'animal, le propriétaire et l'état du rapport", () => {
    const parsed = reportProposalsResponseSchema.parse({
      reportId: "report-1",
      status: "draft",
      patientName: "Filou",
      owner: { id: "owner-1", name: "Camille Roux", email: null },
      captureId: null,
      transcript: "",
      items: [],
      sections: {},
    });
    expect(parsed.owner.email).toBeNull();
  });

  it("refuse un état de rapport inconnu à la finalisation", () => {
    expect(() =>
      finalizeReportResponseSchema.parse({ reportId: "r", status: "shared", sentToOwner: true }),
    ).toThrow();
  });
});
```

- [ ] **Étape 2 : Lancer les tests, vérifier l'échec**

```bash
cd packages/contracts && rtk bun run test -- src/mobile-todo.test.ts src/proposal.test.ts
```
Attendu : échec, `./mobile-todo` introuvable et `finalizeReportResponseSchema` non exporté.

- [ ] **Étape 3 : Écrire les contrats**

Dans `packages/contracts/src/capture.ts`, après `completeCaptureRequestSchema` :

```ts
/**
 * Rattache une capture libre à un animal. Le serveur crée le brouillon de
 * rapport : le mobile ne choisit jamais un identifiant de rapport lui-même.
 */
export const attachCaptureRequestSchema = z
  .object({ patientId: z.string().min(1) })
  .strict();
export type AttachCaptureRequest = z.infer<typeof attachCaptureRequestSchema>;

/** Réponse de « Valider la transcription » : l'extraction est lancée. */
export const extractCaptureResponseSchema = z
  .object({ captureId: z.uuid(), reportId: z.string().min(1) })
  .strict();
export type ExtractCaptureResponse = z.infer<typeof extractCaptureResponseSchema>;
```

Dans `packages/contracts/src/proposal.ts`, importer `reportStatusSchema` depuis `./report` et remplacer `reportProposalsResponseSchema` :

```ts
export const reportOwnerSchema = z
  .object({
    id: z.string().min(1),
    name: z.string(),
    email: z.string().nullable(),
  })
  .strict();
export type ReportOwner = z.infer<typeof reportOwnerSchema>;

export const reportProposalsResponseSchema = z
  .object({
    reportId: z.string().min(1),
    status: reportStatusSchema,
    patientName: z.string(),
    owner: reportOwnerSchema,
    /** Identifiant de parcours de la télémétrie : la capture d'origine. */
    captureId: z.uuid().nullable(),
    transcript: z.string(),
    items: z.array(proposalSchema).max(reportProposalsPageSize),
    sections: z.record(reportSectionIdSchema, reportSectionStateSchema),
  })
  .strict();

/** Un seul geste : finaliser, figer, lier, envoyer. */
export const finalizeReportRequestSchema = z
  .object({ sendToOwner: z.boolean() })
  .strict();
export type FinalizeReportRequest = z.infer<typeof finalizeReportRequestSchema>;

export const finalizeReportResponseSchema = z
  .object({
    reportId: z.string().min(1),
    status: reportStatusSchema,
    sentToOwner: z.boolean(),
  })
  .strict();
export type FinalizeReportResponse = z.infer<typeof finalizeReportResponseSchema>;
```

Dans `packages/contracts/src/mobile-records.ts`, après `createMobileOwnerRequestSchema` :

```ts
/** Sert le garde-fou de finalisation : ne modifie que l'e-mail. */
export const updateOwnerEmailRequestSchema = z
  .object({ email: z.email() })
  .strict();
export type UpdateOwnerEmailRequest = z.infer<typeof updateOwnerEmailRequestSchema>;
```

Créer `packages/contracts/src/mobile-todo.ts` :

```ts
import { z } from "zod";

/**
 * Ce qui attend un geste du praticien. Chaque genre correspond à un libellé
 * unique côté mobile ; un genre nouveau exige un libellé nouveau, jamais
 * l'inverse.
 */
export const todoItemKinds = [
  "to_attach",
  "transcribing",
  "transcript_to_review",
  "inaudible",
  "transcription_failed",
  "report_to_validate",
  "ready_to_send",
] as const;
export const todoItemKindSchema = z.enum(todoItemKinds);
export type TodoItemKind = z.infer<typeof todoItemKindSchema>;

export const todoItemSchema = z
  .object({
    kind: todoItemKindSchema,
    captureId: z.uuid(),
    reportId: z.string().min(1).nullable(),
    appointmentId: z.string().min(1).nullable(),
    patientName: z.string().nullable(),
    updatedAt: z.iso.datetime(),
  })
  .strict();
export type TodoItem = z.infer<typeof todoItemSchema>;

export const todoPageSize = 100;
export const todoResponseSchema = z
  .object({ items: z.array(todoItemSchema).max(todoPageSize) })
  .strict();
export type TodoResponse = z.infer<typeof todoResponseSchema>;
```

Vérifier `packages/contracts/package.json` : la carte `exports` sert `"./*"` vers `./src/*.ts`. Si oui, rien à ajouter ; sinon ajouter `"./mobile-todo"`.

- [ ] **Étape 4 : Lancer les tests, vérifier le succès**

```bash
cd packages/contracts && rtk bun run test
```
Attendu : vert. Les tests existants de `proposal.test.ts` qui construisent une réponse de propositions doivent être complétés des trois champs nouveaux (`status: "draft"`, `patientName`, `owner`).

- [ ] **Étape 5 : Commit**

```bash
rtk git add packages/contracts/
rtk git commit -m "chore(contracts): rattacher, extraire, finaliser, e-mail propriétaire et liste à traiter"
```

---

### Tâche 2 : Rattacher une capture libre à un animal

**Fichiers :**
- Modifier : `apps/web/src/server/mobile/capture.service.ts:136` (exporter `toCaptureResponse`)
- Modifier : `apps/web/src/server/mobile/mobile-api.routes.ts`
- Modifier : `apps/web/src/server/mobile/mobile-api.ts`
- Modifier : `apps/web/src/server/mobile/mobile-api.ports.ts`
- Test : `apps/web/src/server/mobile/mobile-api.attach.test.ts`

**Interfaces :**
- Consomme : `attachCaptureRequestSchema`, `captureResponseSchema` (tâche 1) ; `captureIdParamsSchema` (`mobile-api.routes.ts:70`).
- Produit : port `attachCapture(actor: CaptureActor, captureId: string, request: AttachCaptureRequest): Promise<CaptureResponse>` ; route `POST /captures/{captureId}/attach`.

- [ ] **Étape 1 : Écrire le test qui échoue**

`apps/web/src/server/mobile/mobile-api.attach.test.ts` :

```ts
import { captureResponseSchema } from "@biume/contracts/capture";
import { describe, expect, it, vi } from "vitest";

import { createMobileApiHandler, type MobileApiPorts } from "./mobile-api";
import { MobileRequestError } from "./mobile-api.errors";

const captureId = "2f1e5c2e-4b7d-4a55-9d4a-1c0a8f5b9e11";

const capture = {
  id: captureId,
  organizationId: "org-1",
  practitionerId: "user-1",
  appointmentId: null,
  patientId: "pet-1",
  reportId: "report-1",
  durationMs: 12_000,
  mimeType: "audio/mp4" as const,
  byteSize: 4_096,
  sha256: "a".repeat(64),
  status: "uploaded" as const,
  attemptCount: 1,
  lastErrorCode: null,
  createdAt: "2026-09-03T09:00:00.000Z",
  uploadedAt: "2026-09-03T09:01:00.000Z",
  expiresAt: "2026-09-04T09:00:00.000Z",
  purgedAt: null,
};

function createPorts(overrides: Partial<MobileApiPorts> = {}): MobileApiPorts {
  return {
    authenticate: vi.fn(async () => ({
      userId: "user-1",
      organization: { id: "org-1", name: "Cabinet Biume" },
    })),
    attachCapture: vi.fn(async () => capture),
    ...overrides,
  } as unknown as MobileApiPorts;
}

function post(path: string, body: unknown) {
  return new Request(`https://biume.test/api/mobile/v1${path}`, {
    method: "POST",
    headers: { authorization: "Bearer jeton", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("rattachement d'une capture libre", () => {
  it("renvoie la capture avec son animal et son rapport", async () => {
    const ports = createPorts();
    const response = await createMobileApiHandler(ports)(
      post(`/captures/${captureId}/attach`, { patientId: "pet-1" }),
    );

    expect(response.status).toBe(200);
    const body = captureResponseSchema.parse(await response.json());
    expect(body.reportId).toBe("report-1");
    expect(ports.attachCapture).toHaveBeenCalledWith(
      { practitionerId: "user-1", organizationId: "org-1" },
      captureId,
      { patientId: "pet-1" },
    );
  });

  it("refuse un corps sans animal", async () => {
    const response = await createMobileApiHandler(createPorts())(
      post(`/captures/${captureId}/attach`, {}),
    );
    expect(response.status).toBe(400);
  });

  it("traduit un rattachement contradictoire en conflit", async () => {
    const response = await createMobileApiHandler(
      createPorts({
        attachCapture: vi.fn(async () => {
          throw new MobileRequestError("conflict");
        }),
      }),
    )(post(`/captures/${captureId}/attach`, { patientId: "pet-2" }));
    expect(response.status).toBe(409);
  });
});
```

- [ ] **Étape 2 : Lancer, vérifier l'échec**

```bash
cd apps/web && rtk bun run test -- src/server/mobile/mobile-api.attach.test.ts
```
Attendu : 404 au lieu de 200 (route inexistante).

- [ ] **Étape 3 : Route, port et implémentation**

`capture.service.ts:136` : remplacer `function toCaptureResponse` par `export function toCaptureResponse`.

`mobile-api.routes.ts`, après `cancelCaptureRoute` :

```ts
export const attachCaptureRoute = createRoute({
  method: "post",
  path: "/captures/{captureId}/attach",
  security,
  summary: "Rattacher une capture libre à un animal et créer son brouillon",
  request: {
    params: captureIdParamsSchema,
    body: { content: json(attachCaptureRequestSchema) },
  },
  responses: {
    200: { description: "Capture rattachée", content: json(captureResponseSchema) },
    ...errorResponses,
  },
});
```

`mobile-api.ts` : ajouter au type `MobileApiPorts` :

```ts
  attachCapture(
    actor: CaptureActor,
    captureId: string,
    request: AttachCaptureRequest,
  ): Promise<CaptureResponse>;
```

et le handler, après celui de `cancelCaptureRoute` :

```ts
  app.openapi(attachCaptureRoute, async (c) => {
    const attached = await ports.attachCapture(
      c.get("actor"),
      c.req.valid("param").captureId,
      c.req.valid("json"),
    );
    return validated(c, 200, captureResponseSchema, attached);
  });
```

`mobile-api.ports.ts`, dans l'objet renvoyé par `createProductionMobileApiPorts`, après `cancelCapture` :

```ts
    async attachCapture(actor, captureId, request) {
      const scope = { id: captureId, organizationId: actor.organizationId };
      const capture = await repository.findCapture(scope);
      if (!capture) throw new MobileRequestError("not_found");

      // Idempotent sur le même animal ; contradictoire sur un autre. Une
      // extraction déjà faite s'appuie sur ce rapport : on ne le déplace pas.
      if (capture.reportId) {
        if (capture.patientId === request.patientId) {
          return toCaptureResponse(capture);
        }
        throw new MobileRequestError("conflict");
      }

      const [patient] = await db
        .select({ id: pets.id })
        .from(pets)
        .where(
          and(
            eq(pets.id, request.patientId),
            eq(pets.organizationId, actor.organizationId),
          ),
        )
        .limit(1);
      if (!patient) throw new MobileRequestError("not_found");

      const now = new Date();
      const reportId = crypto.randomUUID();
      const title = `Séance du ${new Intl.DateTimeFormat("fr-FR", {
        dateStyle: "long",
        timeZone: "Europe/Paris",
      }).format(capture.createdAt)}`;

      await db.insert(advancedReport).values({
        id: reportId,
        title,
        consultationReason: "",
        patientId: patient.id,
        appointmentId: null,
        notes: "",
        status: "draft",
        createdBy: actor.organizationId,
        createdAt: now,
      });
      await db
        .insert(reportSectionState)
        .values(
          buildReportSectionStateRows(reportId, createInitialReportSectionStates()),
        );

      // Le prédicat `isNull(reportId)` fait office de verrou : deux
      // rattachements concurrents ne produisent qu'un rapport vivant.
      const [claimed] = await db
        .update(audioCapture)
        .set({ patientId: patient.id, reportId, updatedAt: now })
        .where(
          and(
            eq(audioCapture.id, captureId),
            eq(audioCapture.organizationId, actor.organizationId),
            isNull(audioCapture.reportId),
          ),
        )
        .returning({ id: audioCapture.id });

      if (!claimed) {
        await db.delete(advancedReport).where(eq(advancedReport.id, reportId));
        const current = await repository.findCapture(scope);
        if (!current) throw new MobileRequestError("not_found");
        if (current.patientId !== request.patientId) {
          throw new MobileRequestError("conflict");
        }
        return toCaptureResponse(current);
      }

      const refreshed = await repository.findCapture(scope);
      if (!refreshed) throw new MobileRequestError("not_found");
      return toCaptureResponse(refreshed);
    },
```

Imports à ajouter en tête de `mobile-api.ports.ts` : `reportSectionState` dans la liste `@biume/db/schema/index` ; `toCaptureResponse` depuis `./capture.service` ; `createInitialReportSectionStates` depuis `@biume/contracts/report` ; `buildReportSectionStateRows` depuis `#/functions/report-domain`. Dans `mobile-api.ts`, importer `attachCaptureRequestSchema`-type `AttachCaptureRequest` depuis `@biume/contracts/capture` et `attachCaptureRoute` depuis `./mobile-api.routes`.

Compléter les fabriques de ports factices des tests existants qui listent tous les ports (`mobile-api.test.ts` et `mobile-api.openapi.test.ts` s'ils énumèrent) : `attachCapture: vi.fn()`.

- [ ] **Étape 4 : Lancer, vérifier le succès**

```bash
cd apps/web && rtk bun run test -- src/server/mobile/ && rtk bun run check-types
```
Attendu : vert, sauf `openapi-drift.test.ts` (régénéré en tâche 9).

- [ ] **Étape 5 : Commit**

```bash
rtk git add apps/web/src/server/mobile/
rtk git commit -m "feat(web): rattacher une capture libre à un animal et créer son brouillon"
```

---

### Tâche 3 : Valider la transcription lance l'extraction

**Fichiers :**
- Modifier : `apps/web/src/server/mobile/mobile-api.routes.ts`
- Modifier : `apps/web/src/server/mobile/mobile-api.ts`
- Modifier : `apps/web/src/server/mobile/mobile-api.ports.ts` (port `extractCapture`, correction de `regenerateProposals`)
- Test : `apps/web/src/server/mobile/mobile-api.transcript.test.ts` (ajout)

**Interfaces :**
- Consomme : `extractCaptureResponseSchema` (tâche 1) ; `readTranscript` (helper privé existant de `mobile-api.ports.ts`).
- Produit : port `extractCapture(actor, captureId): Promise<ExtractCaptureResponse>` ; route `POST /captures/{captureId}/extract`.

- [ ] **Étape 1 : Écrire les tests qui échouent**

Ajout dans `mobile-api.transcript.test.ts` (réutiliser `createPorts`/`post` du fichier ; y ajouter `extractCapture: vi.fn(async () => ({ captureId, reportId: "report-1" }))` dans la fabrique) :

```ts
describe("validation de la transcription", () => {
  it("lance l'extraction et renvoie le rapport visé", async () => {
    const ports = createPorts();
    const response = await createMobileApiHandler(ports)(
      post(`/captures/${captureId}/extract`, {}),
    );
    expect(response.status).toBe(200);
    expect(extractCaptureResponseSchema.parse(await response.json()).reportId).toBe("report-1");
  });

  it("refuse une capture sans rapport", async () => {
    const response = await createMobileApiHandler(
      createPorts({
        extractCapture: vi.fn(async () => {
          throw new MobileRequestError("conflict");
        }),
      }),
    )(post(`/captures/${captureId}/extract`, {}));
    expect(response.status).toBe(409);
  });
});
```

- [ ] **Étape 2 : Lancer, vérifier l'échec**

```bash
cd apps/web && rtk bun run test -- src/server/mobile/mobile-api.transcript.test.ts
```
Attendu : 404.

- [ ] **Étape 3 : Route, port, implémentation, et correction de la régénération**

`mobile-api.routes.ts`, après `correctTranscriptRoute` :

```ts
export const extractCaptureRoute = createRoute({
  method: "post",
  path: "/captures/{captureId}/extract",
  security,
  summary: "Valider la transcription et lancer l'extraction du compte rendu",
  request: { params: captureIdParamsSchema },
  responses: {
    200: { description: "Extraction lancée", content: json(extractCaptureResponseSchema) },
    ...errorResponses,
  },
});
```

`mobile-api.ts` : port `extractCapture(actor: CaptureActor, captureId: string): Promise<ExtractCaptureResponse>;` et handler :

```ts
  app.openapi(extractCaptureRoute, async (c) => {
    const started = await ports.extractCapture(
      c.get("actor"),
      c.req.valid("param").captureId,
    );
    return validated(c, 200, extractCaptureResponseSchema, started);
  });
```

`mobile-api.ports.ts` : extraire le déclenchement en helper de module, réutilisé par la régénération :

```ts
async function triggerExtraction(reportId: string, captureId: string) {
  const { tasks } = await import("@trigger.dev/sdk/v3");
  const { extractReportTaskId } = await import("#/trigger/extract-report.trigger");
  await tasks.trigger(extractReportTaskId, { reportId, captureId });
}
```

Port :

```ts
    async extractCapture(actor, captureId) {
      const capture = await repository.findCapture({
        id: captureId,
        organizationId: actor.organizationId,
      });
      if (!capture) throw new MobileRequestError("not_found");
      // Sans rapport, l'extraction n'a nulle part où écrire : rattacher d'abord.
      if (!capture.reportId) throw new MobileRequestError("conflict");

      const transcript = await readTranscript(actor, captureId);
      if (
        !transcript ||
        (transcript.status !== "ready" && transcript.status !== "corrected")
      ) {
        throw new MobileRequestError("conflict");
      }

      await triggerExtraction(capture.reportId, captureId);
      return { captureId, reportId: capture.reportId };
    },
```

Correction de `regenerateProposals` (lignes 644-664) : quand aucune proposition n'existe encore, la source est la capture du rapport, pas une proposition :

```ts
      const [fromProposal] = await db
        .select({ id: reportProposal.captureId })
        .from(reportProposal)
        .where(eq(reportProposal.reportId, reportId))
        .limit(1);
      const [fromCapture] = await db
        .select({ id: audioCapture.id })
        .from(audioCapture)
        .where(
          and(
            eq(audioCapture.reportId, reportId),
            eq(audioCapture.organizationId, actor.organizationId),
          ),
        )
        .orderBy(desc(audioCapture.createdAt))
        .limit(1);

      const source = fromProposal?.id ?? fromCapture?.id;
      if (source) await triggerExtraction(reportId, source);
      return current;
```

Importer `desc` depuis `drizzle-orm` si absent.

- [ ] **Étape 4 : Lancer, vérifier le succès**

```bash
cd apps/web && rtk bun run test -- src/server/mobile/ && rtk bun run check-types
```

- [ ] **Étape 5 : Commit**

```bash
rtk git add apps/web/src/server/mobile/
rtk git commit -m "feat(web): valider la transcription lance l'extraction, régénérer sans proposition repart de la capture"
```

---

### Tâche 4 : La réponse des propositions porte l'animal, le propriétaire et l'état

**Fichiers :**
- Modifier : `apps/web/src/server/mobile/mobile-api.ports.ts` (`readReportProposals`, lignes 174-215)
- Test : `apps/web/src/server/mobile/mobile-api.proposals.test.ts` (fixtures)

**Interfaces :**
- Consomme : `reportProposalsResponseSchema` étendu (tâche 1).
- Produit : `readReportProposals` renvoie `status`, `patientName`, `owner`.

- [ ] **Étape 1 : Mettre à jour les fixtures des tests existants**

Dans `mobile-api.proposals.test.ts`, chaque objet de réponse de propositions reçoit `status: "draft" as const`, `patientName: "Filou"`, `owner: { id: "owner-1", name: "Camille Roux", email: "camille@example.org" }`, `captureId: null`.

- [ ] **Étape 2 : Lancer, vérifier l'échec**

```bash
cd apps/web && rtk bun run test -- src/server/mobile/mobile-api.proposals.test.ts
```
Attendu : vert côté handler (la fixture est validée par le contrat étendu). Le vrai échec est de typage : `readReportProposals` ne renvoie pas les champs.

```bash
cd apps/web && rtk bun run check-types
```
Attendu : erreur sur `readReportProposals`.

- [ ] **Étape 3 : Étendre la lecture**

Remplacer le premier `select` de `readReportProposals` :

```ts
  const [report] = await db
    .select({
      id: advancedReport.id,
      status: advancedReport.status,
      patientName: pets.name,
      ownerId: clients.id,
      ownerName: clients.name,
      ownerEmail: clients.email,
    })
    .from(advancedReport)
    .leftJoin(pets, eq(pets.id, advancedReport.patientId))
    .leftJoin(clients, eq(clients.id, pets.ownerId))
    .where(
      and(
        eq(advancedReport.id, reportId),
        eq(advancedReport.createdBy, actor.organizationId),
      ),
    )
    .limit(1);

  if (!report) return null;
```

et le `return` :

```ts
  return {
    reportId,
    status: report.status,
    patientName: report.patientName ?? "Animal sans nom",
    owner: {
      id: report.ownerId ?? "",
      name: report.ownerName ?? "Propriétaire sans nom",
      email: report.ownerEmail ?? null,
    },
    captureId: captureId ?? null,
    transcript: transcript?.text ?? "",
    items,
    sections: deriveSectionStates(items),
  };
```

- [ ] **Étape 4 : Lancer, vérifier le succès**

```bash
cd apps/web && rtk bun run test -- src/server/mobile/ && rtk bun run check-types
```

- [ ] **Étape 5 : Commit**

```bash
rtk git add apps/web/src/server/mobile/
rtk git commit -m "feat(web): les propositions portent l'animal, le propriétaire et l'état du rapport"
```

---

### Tâche 5 : Finaliser et partager en un geste

**Fichiers :**
- Créer : `apps/web/src/server/report/report-shared-version.ports.ts`
- Modifier : `apps/web/src/functions/reports.function.ts:595-650` (importer les ports déplacés)
- Créer : `apps/web/src/server/report/finalize-report.service.ts`
- Créer : `apps/web/src/server/mobile/report-email.ts`
- Modifier : `apps/web/src/server/mobile/mobile-api.routes.ts`, `mobile-api.ts`, `mobile-api.ports.ts`
- Test : `apps/web/src/server/report/finalize-report.service.test.ts`, `apps/web/src/server/mobile/mobile-api.finalize.test.ts`

**Interfaces :**
- Consomme : `createImmutableReportSharedVersion` (`apps/web/src/functions/report-shared-version.service.ts`), `generateShareToken` (`apps/web/src/server/owner/owner-access.service.ts`), `normalizeReportSectionStates` (`#/functions/report-domain`), `canFinalizeReport` (`@biume/contracts/report`), `NewReportClientEmail` (`@biume/emails/NewReportClientEmail`, export par défaut).
- Produit : `finalizeReport(request, ports): Promise<FinalizeReportResponse>` ; `FinalizeReportPorts` ; port API `finalizeReport(actor, reportId, request)` ; route `POST /reports/{reportId}/finalize`.

- [ ] **Étape 1 : Écrire le test du service qui échoue**

`apps/web/src/server/report/finalize-report.service.test.ts` :

```ts
import { describe, expect, it, vi } from "vitest";

import { MobileRequestError } from "../mobile/mobile-api.errors";
import { finalizeReport, type FinalizeReportPorts } from "./finalize-report.service";

const now = new Date("2026-09-03T10:00:00.000Z");

function report(overrides: Partial<Awaited<ReturnType<FinalizeReportPorts["loadReport"]>>> = {}) {
  return {
    id: "report-1",
    status: "draft" as const,
    sectionStates: [
      { section: "clinical" as const, state: "confirmed" as const },
      { section: "anatomical" as const, state: "not_applicable" as const },
      { section: "recommendations" as const, state: "confirmed" as const },
      { section: "notes" as const, state: "not_applicable" as const },
    ],
    patient: {
      name: "Filou",
      owner: { id: "owner-1", name: "Camille Roux", email: "camille@example.org" },
    },
    ...overrides,
  };
}

function createPorts(overrides: Partial<FinalizeReportPorts> = {}): FinalizeReportPorts {
  return {
    loadReport: vi.fn(async () => report()),
    markStatus: vi.fn(async () => {}),
    createSharedVersion: vi.fn(async () => ({ id: "version-1" })),
    findActiveLink: vi.fn(async () => null),
    insertLink: vi.fn(async () => {}),
    generateToken: vi.fn(() => "jeton-secret"),
    sendEmail: vi.fn(async () => {}),
    ...overrides,
  };
}

const request = { organizationId: "org-1", reportId: "report-1", sendToOwner: true, now };

describe("finaliser et partager", () => {
  it("finalise, fige, lie, envoie, puis marque envoyé", async () => {
    const ports = createPorts();
    const result = await finalizeReport(request, ports);

    expect(ports.markStatus).toHaveBeenNthCalledWith(1, { organizationId: "org-1", reportId: "report-1" }, "finalized", now);
    expect(ports.createSharedVersion).toHaveBeenCalled();
    expect(ports.insertLink).toHaveBeenCalledWith({ token: "jeton-secret", sharedVersionId: "version-1", ownerId: "owner-1" });
    expect(ports.sendEmail).toHaveBeenCalledWith({
      to: "camille@example.org",
      clientName: "Camille Roux",
      petName: "Filou",
      reportDate: "3 septembre 2026",
      token: "jeton-secret",
    });
    expect(ports.markStatus).toHaveBeenNthCalledWith(2, { organizationId: "org-1", reportId: "report-1" }, "sent", now);
    expect(result).toEqual({ reportId: "report-1", status: "sent", sentToOwner: true });
  });

  it("refuse un rapport dont une section reste à vérifier", async () => {
    const ports = createPorts({
      loadReport: vi.fn(async () =>
        report({
          sectionStates: [
            { section: "clinical", state: "proposed" },
            { section: "anatomical", state: "not_applicable" },
            { section: "recommendations", state: "confirmed" },
            { section: "notes", state: "not_applicable" },
          ],
        }),
      ),
    });
    await expect(finalizeReport(request, ports)).rejects.toMatchObject({ code: "validation" });
    expect(ports.markStatus).not.toHaveBeenCalled();
  });

  it("finalise sans envoyer quand le praticien l'a demandé", async () => {
    const ports = createPorts();
    const result = await finalizeReport({ ...request, sendToOwner: false }, ports);
    expect(ports.sendEmail).not.toHaveBeenCalled();
    expect(result).toEqual({ reportId: "report-1", status: "finalized", sentToOwner: false });
  });

  it("n'envoie pas sans adresse, même si l'envoi est demandé", async () => {
    const ports = createPorts({
      loadReport: vi.fn(async () =>
        report({ patient: { name: "Filou", owner: { id: "owner-1", name: "Camille Roux", email: null } } }),
      ),
    });
    const result = await finalizeReport(request, ports);
    expect(ports.sendEmail).not.toHaveBeenCalled();
    expect(result.sentToOwner).toBe(false);
  });

  it("réutilise le lien actif au lieu d'en créer un second", async () => {
    const ports = createPorts({ findActiveLink: vi.fn(async () => ({ token: "existant" })) });
    await finalizeReport(request, ports);
    expect(ports.insertLink).not.toHaveBeenCalled();
    expect(ports.sendEmail).toHaveBeenCalledWith(expect.objectContaining({ token: "existant" }));
  });

  it("ne repasse pas un rapport déjà envoyé en finalisé", async () => {
    const ports = createPorts({ loadReport: vi.fn(async () => report({ status: "sent" })) });
    await finalizeReport({ ...request, sendToOwner: false }, ports);
    expect(ports.markStatus).not.toHaveBeenCalledWith(expect.anything(), "finalized", expect.anything());
  });

  it("refuse un rapport sans propriétaire", async () => {
    const ports = createPorts({ loadReport: vi.fn(async () => report({ patient: null })) });
    await expect(finalizeReport(request, ports)).rejects.toBeInstanceOf(MobileRequestError);
  });
});
```

- [ ] **Étape 2 : Lancer, vérifier l'échec**

```bash
cd apps/web && rtk bun run test -- src/server/report/finalize-report.service.test.ts
```
Attendu : module introuvable.

- [ ] **Étape 3 : Écrire le service**

`apps/web/src/server/report/finalize-report.service.ts` :

```ts
import { canFinalizeReport, type ReportSectionId, type ReportSectionState, type ReportStatus } from "@biume/contracts/report";
import type { FinalizeReportResponse } from "@biume/contracts/proposal";

import { normalizeReportSectionStates } from "#/functions/report-domain";
import { MobileRequestError } from "../mobile/mobile-api.errors";

export type ReportScope = { organizationId: string; reportId: string };

export type FinalizableReport = {
  id: string;
  status: ReportStatus;
  sectionStates: Array<{ section: ReportSectionId; state: ReportSectionState }>;
  patient: {
    name: string;
    owner: { id: string; name: string | null; email: string | null } | null;
  } | null;
};

export type FinalizeReportPorts = {
  loadReport(scope: ReportScope): Promise<FinalizableReport | null>;
  markStatus(scope: ReportScope, status: "finalized" | "sent", at: Date): Promise<void>;
  createSharedVersion(scope: ReportScope, at: Date): Promise<{ id: string }>;
  findActiveLink(input: { sharedVersionId: string; ownerId: string }): Promise<{ token: string } | null>;
  insertLink(input: { token: string; sharedVersionId: string; ownerId: string }): Promise<void>;
  generateToken(): string;
  sendEmail(input: {
    to: string;
    clientName: string;
    petName: string;
    reportDate: string;
    token: string;
  }): Promise<void>;
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeZone: "Europe/Paris",
});

/**
 * Un seul geste, en étapes ordonnées et chacune idempotente : rejouer la
 * finalisation après une coupure ne crée ni seconde version, ni second lien,
 * ni second e-mail sur un rapport déjà « envoyé ».
 */
export async function finalizeReport(
  request: ReportScope & { sendToOwner: boolean; now: Date },
  ports: FinalizeReportPorts,
): Promise<FinalizeReportResponse> {
  const scope = { organizationId: request.organizationId, reportId: request.reportId };
  const report = await ports.loadReport(scope);
  if (!report) throw new MobileRequestError("not_found");

  const states = normalizeReportSectionStates(report.sectionStates);
  if (!canFinalizeReport(states)) throw new MobileRequestError("validation");

  const owner = report.patient?.owner;
  if (!report.patient || !owner) throw new MobileRequestError("conflict");

  if (report.status === "draft") {
    await ports.markStatus(scope, "finalized", request.now);
  }

  const version = await ports.createSharedVersion(scope, request.now);

  const existing = await ports.findActiveLink({ sharedVersionId: version.id, ownerId: owner.id });
  const token = existing?.token ?? ports.generateToken();
  if (!existing) {
    await ports.insertLink({ token, sharedVersionId: version.id, ownerId: owner.id });
  }

  const canSend = request.sendToOwner && owner.email !== null && report.status !== "sent";
  if (canSend) {
    await ports.sendEmail({
      to: owner.email as string,
      clientName: owner.name ?? "cher client",
      petName: report.patient.name,
      reportDate: dateFormatter.format(request.now),
      token,
    });
    await ports.markStatus(scope, "sent", request.now);
  }

  const status: ReportStatus = canSend || report.status === "sent" ? "sent" : "finalized";
  return { reportId: request.reportId, status, sentToOwner: canSend };
}
```

- [ ] **Étape 4 : Lancer, vérifier le succès du service**

```bash
cd apps/web && rtk bun run test -- src/server/report/finalize-report.service.test.ts
```

- [ ] **Étape 5 : Déplacer les ports Drizzle de la version partagée**

Créer `apps/web/src/server/report/report-shared-version.ports.ts` avec, déplacés **à l'identique** depuis `reports.function.ts:598-649`, `findReportSharedVersion` et `reportSharedVersionPorts` (exportés). Dans `reports.function.ts`, supprimer ces définitions et importer `reportSharedVersionPorts` depuis `#/server/report/report-shared-version.ports`. Les imports devenus inutiles dans `reports.function.ts` (`reportSharedVersion`, `ReportSharedVersionPorts`) sont retirés si plus rien ne les référence.

- [ ] **Étape 6 : E-mail, route, port**

`apps/web/src/server/mobile/report-email.ts` :

```ts
/**
 * Le courriel ne porte aucun contenu clinique : un lien, un prénom d'animal.
 * La page propriétaire demandera un code avant de montrer quoi que ce soit.
 */
export async function sendNewReportEmail(input: {
  to: string;
  clientName: string;
  petName: string;
  reportDate: string;
  token: string;
}): Promise<void> {
  const { Resend } = await import("resend");
  const { env } = await import("@biume/env/server");
  const { default: NewReportClientEmail } = await import(
    "@biume/emails/NewReportClientEmail"
  );

  await new Resend(env.RESEND_API_KEY).emails.send({
    from: "Biume <no-reply@biume.app>",
    to: input.to,
    subject: `Le compte rendu de ${input.petName} est disponible`,
    react: NewReportClientEmail({
      clientName: input.clientName,
      petName: input.petName,
      reportDate: input.reportDate,
      reportUrl: `${env.APP_URL}/r/${input.token}`,
    }),
  });
}
```

`mobile-api.routes.ts`, après `regenerateProposalsRoute` :

```ts
export const finalizeReportRoute = createRoute({
  method: "post",
  path: "/reports/{reportId}/finalize",
  security,
  summary: "Finaliser le compte rendu, le figer et l'envoyer au propriétaire",
  request: {
    params: reportIdParamsSchema,
    body: { content: json(finalizeReportRequestSchema) },
  },
  responses: {
    200: { description: "Rapport finalisé", content: json(finalizeReportResponseSchema) },
    ...errorResponses,
  },
});
```

`mobile-api.ts` : port `finalizeReport(actor: CaptureActor, reportId: string, request: FinalizeReportRequest): Promise<FinalizeReportResponse>;` et handler :

```ts
  app.openapi(finalizeReportRoute, async (c) => {
    const finalized = await ports.finalizeReport(
      c.get("actor"),
      c.req.valid("param").reportId,
      c.req.valid("json"),
    );
    return validated(c, 200, finalizeReportResponseSchema, finalized);
  });
```

`mobile-api.ports.ts` : `createProductionMobileApiPorts` reçoit une dépendance injectable :

```ts
export async function createProductionMobileApiPorts(
  overrides: { sendReportEmail?: FinalizeReportPorts["sendEmail"] } = {},
): Promise<MobileApiPorts> {
  const sendReportEmail = overrides.sendReportEmail ?? sendNewReportEmail;
```

et le port :

```ts
    async finalizeReport(actor, reportId, request) {
      return finalizeReport(
        { organizationId: actor.organizationId, reportId, sendToOwner: request.sendToOwner, now: new Date() },
        {
          async loadReport(scope) {
            const row = await db.query.advancedReport.findFirst({
              where: and(
                eq(advancedReport.id, scope.reportId),
                eq(advancedReport.createdBy, scope.organizationId),
              ),
              with: { patient: { with: { owner: true } }, sectionStates: true },
            });
            if (!row) return null;
            return {
              id: row.id,
              status: row.status,
              sectionStates: row.sectionStates.map((s) => ({ section: s.section, state: s.state })),
              patient: row.patient
                ? {
                    name: row.patient.name,
                    owner: row.patient.owner
                      ? { id: row.patient.owner.id, name: row.patient.owner.name, email: row.patient.owner.email }
                      : null,
                  }
                : null,
            };
          },
          async markStatus(scope, status, at) {
            await db
              .update(advancedReport)
              .set({ status, updatedAt: at })
              .where(
                and(
                  eq(advancedReport.id, scope.reportId),
                  eq(advancedReport.createdBy, scope.organizationId),
                ),
              );
          },
          async createSharedVersion(scope, at) {
            const version = await createImmutableReportSharedVersion(
              { organizationId: scope.organizationId, reportId: scope.reportId, createdAt: at },
              reportSharedVersionPorts,
            );
            return { id: version.id };
          },
          async findActiveLink({ sharedVersionId, ownerId }) {
            const [link] = await db
              .select({ token: reportShareLink.token })
              .from(reportShareLink)
              .where(
                and(
                  eq(reportShareLink.sharedVersionId, sharedVersionId),
                  eq(reportShareLink.ownerId, ownerId),
                  isNull(reportShareLink.revokedAt),
                ),
              )
              .limit(1);
            return link ?? null;
          },
          async insertLink(link) {
            await db.insert(reportShareLink).values(link);
          },
          generateToken: generateShareToken,
          sendEmail: sendReportEmail,
        },
      );
    },
```

Imports : `finalizeReport`, `FinalizeReportPorts` depuis `#/server/report/finalize-report.service` ; `createImmutableReportSharedVersion` depuis `#/functions/report-shared-version.service` ; `reportSharedVersionPorts` depuis `#/server/report/report-shared-version.ports` ; `generateShareToken` depuis `#/server/owner/owner-access.service` ; `sendNewReportEmail` depuis `./report-email`. Le retour de `createImmutableReportSharedVersion` est une ligne `ReportSharedVersion` (elle a `id`) ; si sa signature renvoie `undefined` dans un cas, lever `new MobileRequestError("server_error", { retryable: true })`.

- [ ] **Étape 7 : Test handler**

`apps/web/src/server/mobile/mobile-api.finalize.test.ts`, même gabarit que `mobile-api.attach.test.ts` : un POST `/reports/report-1/finalize` avec `{ sendToOwner: true }` renvoie 200 et un corps validé par `finalizeReportResponseSchema` ; un corps `{}` renvoie 400 ; un port qui lève `MobileRequestError("validation")` renvoie 400.

- [ ] **Étape 8 : Lancer, vérifier le succès**

```bash
cd apps/web && rtk bun run test -- src/server/ src/functions/ && rtk bun run check-types
```

- [ ] **Étape 9 : Commit**

```bash
rtk git add apps/web/src/
rtk git commit -m "feat(web): finaliser un compte rendu, figer sa version, créer le lien propriétaire et l'envoyer"
```

---

### Tâche 6 : Compléter l'e-mail d'un propriétaire

**Fichiers :**
- Modifier : `apps/web/src/server/mobile/mobile-api.routes.ts`, `mobile-api.ts`, `mobile-api.ports.ts`
- Test : `apps/web/src/server/mobile/mobile-api.records.test.ts` (ajout)

**Interfaces :**
- Consomme : `updateOwnerEmailRequestSchema`, `mobileOwnerSchema` (tâche 1) ; `toMobileOwner` (`records.repository.ts:46`).
- Produit : port `updateOwnerEmail(actor, ownerId, request): Promise<MobileOwner>` ; route `POST /owners/{ownerId}/email`.

Le routeur de fichiers `apps/web/src/routes/api/mobile/v1/$.ts` ne monte que GET, POST et DELETE : l'action est un POST, pas un PATCH.

- [ ] **Étape 1 : Test qui échoue** (dans `mobile-api.records.test.ts`, avec sa fabrique de ports ; ajouter `updateOwnerEmail: vi.fn(async () => owner)` où `owner` est la fixture propriétaire du fichier avec `email: "camille@example.org"`)

```ts
describe("e-mail du propriétaire", () => {
  it("met à jour l'e-mail et renvoie la fiche", async () => {
    const response = await createMobileApiHandler(createPorts())(
      post("/owners/owner-1/email", { email: "camille@example.org" }),
    );
    expect(response.status).toBe(200);
    expect(mobileOwnerSchema.parse(await response.json()).email).toBe("camille@example.org");
  });

  it("refuse une adresse invalide", async () => {
    const response = await createMobileApiHandler(createPorts())(
      post("/owners/owner-1/email", { email: "pas-une-adresse" }),
    );
    expect(response.status).toBe(400);
  });
});
```

- [ ] **Étape 2 : Lancer, vérifier l'échec** — `cd apps/web && rtk bun run test -- src/server/mobile/mobile-api.records.test.ts` → 404.

- [ ] **Étape 3 : Route, port, implémentation**

`mobile-api.routes.ts` :

```ts
export const ownerIdParamsSchema = z.object({
  ownerId: z.string().min(1).openapi({ param: { name: "ownerId", in: "path" } }),
});

export const updateOwnerEmailRoute = createRoute({
  method: "post",
  path: "/owners/{ownerId}/email",
  security,
  summary: "Compléter l'e-mail d'un propriétaire",
  request: {
    params: ownerIdParamsSchema,
    body: { content: json(updateOwnerEmailRequestSchema) },
  },
  responses: {
    200: { description: "Propriétaire mis à jour", content: json(mobileOwnerSchema) },
    ...errorResponses,
  },
});
```

`mobile-api.ts` : port `updateOwnerEmail(actor: CaptureActor, ownerId: string, request: UpdateOwnerEmailRequest): Promise<MobileOwner>;` et handler :

```ts
  app.openapi(updateOwnerEmailRoute, async (c) => {
    const updated = await ports.updateOwnerEmail(
      c.get("actor"),
      c.req.valid("param").ownerId,
      c.req.valid("json"),
    );
    return validated(c, 200, mobileOwnerSchema, updated);
  });
```

`mobile-api.ports.ts` :

```ts
    async updateOwnerEmail(actor, ownerId, request) {
      const [updated] = await db
        .update(clients)
        .set({ email: request.email })
        .where(
          and(eq(clients.id, ownerId), eq(clients.organizationId, actor.organizationId)),
        )
        .returning({
          id: clients.id,
          name: clients.name,
          email: clients.email,
          phone: clients.phone,
          city: clients.city,
        });
      if (!updated) throw new MobileRequestError("not_found");

      const [counted] = await db
        .select({ patientCount: count() })
        .from(pets)
        .where(eq(pets.ownerId, ownerId));

      return toMobileOwner({ ...updated, patientCount: counted?.patientCount ?? 0 });
    },
```

Importer `count` depuis `drizzle-orm`.

- [ ] **Étape 4 : Lancer, vérifier le succès** — `cd apps/web && rtk bun run test -- src/server/mobile/ && rtk bun run check-types`.

- [ ] **Étape 5 : Commit**

```bash
rtk git add apps/web/src/server/mobile/
rtk git commit -m "feat(web): compléter l'e-mail d'un propriétaire depuis le terrain"
```

---

### Tâche 7 : Le suivi se programme sur le lien du bon rapport

**Fichiers :**
- Modifier : `apps/web/src/server/mobile/mobile-api.ports.ts:527-565` (`scheduleFollowUp`) et `:241-291` (`readFollowUp`)
- Test : `apps/web/src/server/mobile/capture.persistence.postgres.test.ts` (ajout d'un cas d'intégration, même harnais)

**Interfaces :**
- Consomme : `reportShareLink`, `reportSharedVersion` (`@biume/db/schema/index`).
- Produit : programmation refusée (`conflict`) sur un rapport en brouillon ou sans lien ; nom d'animal lu via le rapport, pas via « n'importe quel animal du propriétaire ».

- [ ] **Étape 1 : Test d'intégration qui échoue**

Dans `capture.persistence.postgres.test.ts`, ajouter un cas dans la transaction annulée du harnais : insérer une organisation, un propriétaire, deux animaux, deux rapports finalisés, deux versions partagées et deux liens ; appeler `createProductionMobileApiPorts()` n'est pas possible (il ouvre `@biume/auth`), donc extraire la lecture du lien en fonction exportée testable :

```ts
export async function findReportShareToken(
  database: CaptureDatabase,
  scope: { organizationId: string; reportId: string },
): Promise<string | null>
```

dans `mobile-api.ports.ts`, et le test vérifie qu'elle renvoie le jeton du rapport demandé et `null` pour un rapport d'une autre organisation.

- [ ] **Étape 2 : Lancer, vérifier l'échec** — `cd apps/web && rtk bun run test -- src/server/mobile/capture.persistence.postgres.test.ts` → fonction inexistante.

- [ ] **Étape 3 : Corriger**

```ts
export async function findReportShareToken(
  database: CaptureDatabase,
  scope: { organizationId: string; reportId: string },
): Promise<string | null> {
  const [link] = await database
    .select({ token: reportShareLink.token })
    .from(reportShareLink)
    .innerJoin(
      reportSharedVersion,
      eq(reportSharedVersion.id, reportShareLink.sharedVersionId),
    )
    .where(
      and(
        eq(reportSharedVersion.reportId, scope.reportId),
        eq(reportSharedVersion.organizationId, scope.organizationId),
        isNull(reportShareLink.revokedAt),
      ),
    )
    .orderBy(desc(reportShareLink.createdAt))
    .limit(1);
  return link?.token ?? null;
}
```

Dans `scheduleFollowUp`, le `select` du rapport lit aussi `status: advancedReport.status` ; après le contrôle d'échéance :

```ts
      // Un suivi porte un lien vers le compte rendu : sans rapport finalisé,
      // le propriétaire recevrait un questionnaire sur un document qu'il n'a
      // jamais reçu.
      if (report.status === "draft") throw new MobileRequestError("conflict");
      const shareToken = await findReportShareToken(db, {
        organizationId: actor.organizationId,
        reportId,
      });
      if (!shareToken) throw new MobileRequestError("conflict");
```

et `shareToken` remplace `link?.token ?? null` dans l'insertion. Supprimer le `select ... limit(1)` sans `where`.

Dans `readFollowUp`, remplacer les jointures `clients`/`pets` :

```ts
    .from(followUp)
    .innerJoin(advancedReport, eq(advancedReport.id, followUp.reportId))
    .leftJoin(pets, eq(pets.id, advancedReport.patientId))
    .leftJoin(clients, eq(clients.id, pets.ownerId))
```

`CaptureDatabase` est exporté par `./capture.repository`. Ajouter `reportSharedVersion` à l'import du schéma.

- [ ] **Étape 4 : Mettre à jour `mobile-api.followup.test.ts`** : ajouter un cas « refuse un rapport en brouillon » où le port lève `MobileRequestError("conflict")` → 409.

- [ ] **Étape 5 : Lancer, vérifier le succès** — `cd apps/web && rtk bun run test -- src/server/mobile/ && rtk bun run check-types`.

- [ ] **Étape 6 : Commit**

```bash
rtk git add apps/web/src/server/mobile/
rtk git commit -m "fix(web): programmer le suivi sur le lien du bon rapport et nommer le bon animal"
```

---

### Tâche 8 : « À traiter » calculé côté serveur

**Fichiers :**
- Créer : `apps/web/src/server/mobile/todo.service.ts`
- Test : `apps/web/src/server/mobile/todo.service.test.ts`, `apps/web/src/server/mobile/mobile-api.todo.test.ts`
- Modifier : `mobile-api.routes.ts`, `mobile-api.ts`, `mobile-api.ports.ts`

**Interfaces :**
- Consomme : `todoResponseSchema`, `TodoItemKind` (tâche 1) ; `canFinalizeReport` ; `normalizeReportSectionStates`.
- Produit : `classifyTodo(source: TodoSource): TodoItemKind | null` ; port `listTodo(actor): Promise<TodoResponse>` ; route `GET /todo`.

- [ ] **Étape 1 : Test du classement pur qui échoue**

`todo.service.test.ts` :

```ts
import { describe, expect, it } from "vitest";
import { classifyTodo, type TodoSource } from "./todo.service";

const resolved = { clinical: "confirmed", anatomical: "not_applicable", recommendations: "confirmed", notes: "not_applicable" } as const;
const pending = { ...resolved, clinical: "proposed" } as const;

function source(overrides: Partial<TodoSource> = {}): TodoSource {
  return {
    reportId: "report-1",
    reportStatus: "draft",
    transcriptStatus: "ready",
    proposalCount: 0,
    sectionStates: null,
    ...overrides,
  };
}

describe("classement d'une dictée", () => {
  it("exclut un rapport finalisé ou envoyé", () => {
    expect(classifyTodo(source({ reportStatus: "finalized" }))).toBeNull();
    expect(classifyTodo(source({ reportStatus: "sent" }))).toBeNull();
  });
  it("signale une dictée inaudible avant tout le reste", () => {
    expect(classifyTodo(source({ reportId: null, transcriptStatus: "inaudible" }))).toBe("inaudible");
  });
  it("demande le rattachement d'une capture sans rapport", () => {
    expect(classifyTodo(source({ reportId: null, reportStatus: null, transcriptStatus: "running" }))).toBe("to_attach");
  });
  it("attend une transcription en cours", () => {
    expect(classifyTodo(source({ transcriptStatus: "pending" }))).toBe("transcribing");
    expect(classifyTodo(source({ transcriptStatus: null }))).toBe("transcribing");
  });
  it("propose de relire une transcription sans proposition", () => {
    expect(classifyTodo(source({ transcriptStatus: "corrected" }))).toBe("transcript_to_review");
  });
  it("demande de valider tant qu'une section reste à vérifier", () => {
    expect(classifyTodo(source({ proposalCount: 3, sectionStates: pending }))).toBe("report_to_validate");
  });
  it("dit prêt à envoyer quand tout est décidé", () => {
    expect(classifyTodo(source({ proposalCount: 3, sectionStates: resolved }))).toBe("ready_to_send");
  });
});
```

- [ ] **Étape 2 : Lancer, vérifier l'échec** — module introuvable.

- [ ] **Étape 3 : Écrire le service**

```ts
import { canFinalizeReport, type ReportSectionStates, type ReportStatus } from "@biume/contracts/report";
import type { TodoItemKind } from "@biume/contracts/mobile-todo";
import type { TranscriptStatus } from "@biume/contracts/transcript";

export type TodoSource = {
  reportId: string | null;
  reportStatus: ReportStatus | null;
  transcriptStatus: TranscriptStatus | null;
  proposalCount: number;
  sectionStates: ReportSectionStates | null;
};

/**
 * L'ordre des tests est l'ordre des priorités du praticien : une dictée
 * inaudible se réenregistre avant toute autre considération, un rattachement
 * peut se faire pendant que le serveur transcrit.
 */
export function classifyTodo(source: TodoSource): TodoItemKind | null {
  if (source.reportStatus === "finalized" || source.reportStatus === "sent") return null;
  if (source.transcriptStatus === "inaudible") return "inaudible";
  if (source.transcriptStatus === "failed") return "transcription_failed";
  if (!source.reportId) return "to_attach";
  if (
    source.transcriptStatus === null ||
    source.transcriptStatus === "pending" ||
    source.transcriptStatus === "running"
  ) {
    return "transcribing";
  }
  if (source.proposalCount === 0) return "transcript_to_review";
  if (source.sectionStates && canFinalizeReport(source.sectionStates)) return "ready_to_send";
  return "report_to_validate";
}
```

- [ ] **Étape 4 : Route, port, implémentation**

`mobile-api.routes.ts` :

```ts
export const todoRoute = createRoute({
  method: "get",
  path: "/todo",
  security,
  summary: "Tout ce qui attend un geste du praticien",
  responses: {
    200: { description: "Éléments à traiter", content: json(todoResponseSchema) },
    ...errorResponses,
  },
});
```

`mobile-api.ts` : port `listTodo(actor: CaptureActor): Promise<TodoResponse>;`, handler :

```ts
  app.openapi(todoRoute, async (c) => {
    const todo = await ports.listTodo(c.get("actor"));
    return validated(c, 200, todoResponseSchema, todo);
  });
  methodNotAllowed("/todo");
```

`mobile-api.ports.ts` :

```ts
    async listTodo(actor) {
      // Trente jours : une dictée plus ancienne non traitée est un cas de
      // support, pas une ligne de liste.
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const rows = await db
        .select({
          captureId: audioCapture.id,
          reportId: audioCapture.reportId,
          appointmentId: audioCapture.appointmentId,
          updatedAt: audioCapture.updatedAt,
          patientName: pets.name,
          transcriptStatus: captureTranscript.status,
          reportStatus: advancedReport.status,
        })
        .from(audioCapture)
        .leftJoin(captureTranscript, eq(captureTranscript.captureId, audioCapture.id))
        .leftJoin(advancedReport, eq(advancedReport.id, audioCapture.reportId))
        .leftJoin(pets, eq(pets.id, audioCapture.patientId))
        .where(
          and(
            eq(audioCapture.organizationId, actor.organizationId),
            eq(audioCapture.status, "uploaded"),
            gte(audioCapture.createdAt, since),
          ),
        )
        .orderBy(desc(audioCapture.createdAt))
        .limit(todoPageSize);

      const reportIds = rows
        .map((row) => row.reportId)
        .filter((id): id is string => id !== null);

      const proposalCounts = reportIds.length
        ? await db
            .select({ reportId: reportProposal.reportId, total: count() })
            .from(reportProposal)
            .where(inArray(reportProposal.reportId, reportIds))
            .groupBy(reportProposal.reportId)
        : [];
      const stateRows = reportIds.length
        ? await db
            .select({
              reportId: reportSectionState.reportId,
              section: reportSectionState.section,
              state: reportSectionState.state,
            })
            .from(reportSectionState)
            .where(inArray(reportSectionState.reportId, reportIds))
        : [];

      const countByReport = new Map(proposalCounts.map((row) => [row.reportId, Number(row.total)]));
      const statesByReport = new Map<string, typeof stateRows>();
      for (const row of stateRows) {
        statesByReport.set(row.reportId, [...(statesByReport.get(row.reportId) ?? []), row]);
      }

      const items = rows.flatMap((row) => {
        const states = row.reportId ? statesByReport.get(row.reportId) : undefined;
        const kind = classifyTodo({
          reportId: row.reportId,
          reportStatus: row.reportStatus,
          transcriptStatus: row.transcriptStatus as TranscriptStatus | null,
          proposalCount: row.reportId ? (countByReport.get(row.reportId) ?? 0) : 0,
          sectionStates: states ? normalizeReportSectionStates(states) : null,
        });
        if (!kind) return [];
        return [
          {
            kind,
            captureId: row.captureId,
            reportId: row.reportId,
            appointmentId: row.appointmentId,
            patientName: row.patientName ?? null,
            updatedAt: row.updatedAt.toISOString(),
          },
        ];
      });

      return { items };
    },
```

Imports : `classifyTodo` depuis `./todo.service` ; `todoPageSize` depuis `@biume/contracts/mobile-todo` ; `TranscriptStatus` type depuis `@biume/contracts/transcript` ; `gte`, `inArray`, `count`, `desc` depuis `drizzle-orm` ; `normalizeReportSectionStates` depuis `#/functions/report-domain`.

- [ ] **Étape 5 : Test handler** `mobile-api.todo.test.ts` : GET `/todo` → 200 validé par `todoResponseSchema` ; POST `/todo` → 405.

- [ ] **Étape 6 : Lancer, vérifier** — `cd apps/web && rtk bun run test -- src/server/mobile/ && rtk bun run check-types`.

- [ ] **Étape 7 : Commit**

```bash
rtk git add apps/web/src/server/mobile/
rtk git commit -m "feat(web): lister ce qui attend un geste du praticien"
```

---

### Tâche 9 : Figer le contrat OpenAPI

**Fichiers :**
- Régénérer : `apps/web/openapi.json`
- Vérifier : `apps/web/src/server/mobile/openapi-drift.test.ts`

- [ ] **Étape 1 : Régénérer et vérifier**

```bash
rtk bun --filter @biume/web emit-openapi
cd apps/web && rtk bun run test && rtk bun run check-types
```
Attendu : tout vert, y compris la dérive. Vérifier dans `openapi.json` la présence des chemins `/captures/{captureId}/attach`, `/captures/{captureId}/extract`, `/reports/{reportId}/finalize`, `/owners/{ownerId}/email`, `/todo`.

- [ ] **Étape 2 : Commit**

```bash
rtk git add apps/web/openapi.json
rtk git commit -m "chore(web): figer le contrat mobile du lot A"
```

---

## Partie 2 — Flutter : fondations et capture libre

### Tâche 10 : Un identifiant de dictée qui est un UUID

**Fichiers :**
- Créer : `apps/mobile/lib/core/ids/uuid.dart`
- Modifier : `apps/mobile/lib/features/capture/presentation/recording_page.dart:31`
- Test : `apps/mobile/test/core/uuid_test.dart`

**Interfaces :**
- Produit : `String uuidV4({Random? random})`.

Constat : `recording_page.dart` génère l'identifiant avec `UniqueKey().toString()`, soit `[#a1b2c]`. Le contrat serveur exige `z.uuid()` : la déclaration est rejetée en `validation`, non réessayable, et **chaque dictée finit en `needs_action`**. Aucune dictée n'a jamais pu être transcrite par cette application.

- [ ] **Étape 1 : Test qui échoue**

```dart
import 'dart:math';

import 'package:biume_mobile/core/ids/uuid.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final v4 = RegExp(
    r'^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
  );

  test('produit un UUID version 4 en minuscules', () {
    for (var i = 0; i < 100; i++) {
      expect(uuidV4(), matches(v4));
    }
  });

  test('est déterministe pour une source aléatoire donnée', () {
    expect(uuidV4(random: Random(7)), uuidV4(random: Random(7)));
  });
}
```

- [ ] **Étape 2 : Lancer, vérifier l'échec** — `cd apps/mobile && rtk flutter test test/core/uuid_test.dart` → import introuvable.

- [ ] **Étape 3 : Implémenter**

```dart
import 'dart:math';

/// UUID v4 sans dépendance : seize octets aléatoires, version et variante
/// posées à la main. Le serveur refuse tout identifiant qui n'est pas un UUID.
String uuidV4({Random? random}) {
  final source = random ?? Random.secure();
  final bytes = List<int>.generate(16, (_) => source.nextInt(256));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  final hex = bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
  return '${hex.substring(0, 8)}-${hex.substring(8, 12)}-'
      '${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}';
}
```

Dans `recording_page.dart`, remplacer `newId: () => UniqueKey().toString(),` par `newId: uuidV4,` et importer `../../../core/ids/uuid.dart`.

- [ ] **Étape 4 : Lancer, vérifier** — `cd apps/mobile && rtk flutter test && rtk flutter analyze`.

- [ ] **Étape 5 : Commit**

```bash
rtk git add apps/mobile/
rtk git commit -m "fix(mobile): identifier chaque dictée par un vrai UUID"
```

---

### Tâche 11 : L'animal choisi voyage avec la dictée en file

**Fichiers :**
- Modifier : `apps/mobile/lib/core/database/app_database.dart` (colonnes, schéma v2)
- Modifier : `apps/mobile/lib/features/capture/domain/capture_store.dart`, `sync_decision.dart`, `upload_client.dart`, `sync_engine.dart`
- Modifier : `apps/mobile/lib/features/capture/data/drift_capture_store.dart`, `http_capture_api.dart`
- Modifier : `apps/mobile/lib/features/capture/presentation/recording_page.dart`
- Test : `apps/mobile/test/core/app_database_test.dart`, `apps/mobile/test/features/capture/sync_engine_test.dart`

**Interfaces :**
- Produit : `LocalCaptures.patientId` (nullable), `LocalCaptures.extractionRequestedAt` (nullable) ; `CaptureStore.create(... String? patientId)` ; `CaptureStore.attachPatient(String id, String patientId)` ; `CaptureStore.markExtractionRequested(String id, DateTime at)` ; `SyncCandidate.patientId` ; `CaptureApi.attach(String captureId, String patientId): Future<Result<void>>` ; `RecordingPage({this.appointmentId, this.patientId})`.

- [ ] **Étape 1 : Tests qui échouent**

Dans `app_database_test.dart` :

```dart
test('conserve l\'animal rattaché à une dictée en file', () async {
  await db.into(db.localCaptures).insert(
    LocalCapturesCompanion.insert(
      id: 'c-1',
      status: LocalCaptureStatus.queued,
      durationMs: 1000,
      byteSize: 10,
      sha256: 'x',
      createdAt: DateTime.utc(2026, 9, 3),
      expiresAt: DateTime.utc(2026, 9, 4),
      patientId: const Value('pet-1'),
    ),
  );
  final row = await (db.select(db.localCaptures)..where((c) => c.id.equals('c-1'))).getSingle();
  expect(row.patientId, 'pet-1');
  expect(row.extractionRequestedAt, isNull);
});
```

Dans `sync_engine_test.dart`, avec les doublures du fichier (la doublure de `CaptureApi` gagne un `attach` qui journalise ses appels dans `attached`, un compteur d'ordre `attachOrder` et un `attachFailure` optionnel). Ajouter au fichier un raccourci :

```dart
Future<void> enFile(FakeCaptureStore store, String id, {String? patientId}) async {
  await store.create(
    id: id,
    appointmentId: null,
    durationMs: 1000,
    byteSize: 10,
    sha256: 'a' * 64,
    filePath: '/tmp/$id.biume',
    createdAt: DateTime.utc(2026, 9, 3),
    expiresAt: DateTime.utc(2026, 9, 4),
    patientId: patientId,
  );
  await store.transition(id, LocalCaptureStatus.queued);
}
```

puis :

```dart
test('rattache l\'animal choisi juste après la déclaration', () async {
  await enFile(store, 'c-1', patientId: 'pet-1');
  await engine.runOnce();
  expect(api.attached, [('c-1', 'pet-1')]);
  expect(api.declared.indexOf('c-1'), lessThan(api.attachOrder['c-1']!));
});

test('ne rattache rien quand aucun animal n\'a été choisi', () async {
  await enFile(store, 'c-1');
  await engine.runOnce();
  expect(api.attached, isEmpty);
});

test('un rattachement en conflit met la dictée en attente d\'action', () async {
  api.attachFailure = const ConflictFailure();
  await enFile(store, 'c-1', patientId: 'pet-1');
  await engine.runOnce();
  expect((await store.byId('c-1'))!.status, LocalCaptureStatus.needsAction);
});
```

- [ ] **Étape 2 : Lancer, vérifier l'échec** — `cd apps/mobile && rtk flutter test test/core/app_database_test.dart test/features/capture/sync_engine_test.dart`.

- [ ] **Étape 3 : Schéma, store, API, moteur**

`app_database.dart`, dans `LocalCaptures` :

```dart
  /// Animal choisi pour une capture libre. Écrit localement, envoyé au
  /// serveur juste après la déclaration : c'est la seule « écriture » hors
  /// ligne, et elle appartient à la dictée en file, pas au cache.
  TextColumn get patientId => text().nullable()();

  /// Le moment où « Valider la transcription » a été pressé. Sert à afficher
  /// « Biume prépare le compte rendu » sans que le serveur ait à le savoir.
  DateTimeColumn get extractionRequestedAt => dateTime().nullable()();
```

et dans `AppDatabase` :

```dart
  @override
  int get schemaVersion => 2;

  @override
  MigrationStrategy get migration => MigrationStrategy(
    onUpgrade: (migrator, from, to) async {
      if (from < 2) {
        await migrator.addColumn(localCaptures, localCaptures.patientId);
        await migrator.addColumn(localCaptures, localCaptures.extractionRequestedAt);
      }
    },
  );
```

Puis `rtk dart run build_runner build --delete-conflicting-outputs`.

`capture_store.dart` : `create` gagne `String? patientId` (paramètre nommé, non requis) ; ajouter :

```dart
  /// Mémorise l'animal d'une capture libre. Sans effet sur le serveur : c'est
  /// le moteur de synchronisation qui portera ce choix après la déclaration.
  Future<void> attachPatient(String id, String patientId);

  Future<void> markExtractionRequested(String id, DateTime at);
```

`sync_decision.dart` : `SyncCandidate` gagne `final String? patientId;` (constructeur nommé, optionnel).

`drift_capture_store.dart` : écrire `patientId: Value(patientId)` dans `create` ; `pending()` renseigne `patientId: row.patientId` ; implémenter :

```dart
  @override
  Future<void> attachPatient(String id, String patientId) =>
      (_db.update(_db.localCaptures)..where((c) => c.id.equals(id)))
          .write(LocalCapturesCompanion(patientId: Value(patientId)));

  @override
  Future<void> markExtractionRequested(String id, DateTime at) =>
      (_db.update(_db.localCaptures)..where((c) => c.id.equals(id)))
          .write(LocalCapturesCompanion(extractionRequestedAt: Value(at)));
```

`upload_client.dart`, dans `CaptureApi` :

```dart
  /// Rattache une capture libre à un animal. Idempotent sur le même animal.
  Future<Result<void>> attach(String captureId, String patientId);
```

`http_capture_api.dart` :

```dart
  @override
  Future<Result<void>> attach(String captureId, String patientId) async {
    try {
      await _dio.post<Map<String, dynamic>>(
        '/api/mobile/v1/captures/$captureId/attach',
        data: {'patientId': patientId},
      );
      return const Success(null);
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }
```

`sync_engine.dart`, dans `_upload`, **juste après** que `_api.declare(...)` a renvoyé `Success` et **avant** `_api.requestUpload(...)` :

```dart
    if (capture.patientId case final patientId?) {
      final attached = await _api.attach(capture.id, patientId);
      if (attached case Err(:final failure)) {
        return _handleFailure(capture, failure);
      }
    }
```

(`_handleFailure` est la fonction existante de la ligne 170 ; l'appeler avec les mêmes arguments que pour un échec de déclaration.)

`recording_page.dart` : `RecordingPage({this.appointmentId, this.patientId, super.key})`, et dans `onSaved`, `patientId: patientId` passé à `create`.

- [ ] **Étape 4 : Lancer, vérifier** — `cd apps/mobile && rtk flutter test && rtk flutter analyze`.

- [ ] **Étape 5 : Commit**

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): l'animal choisi hors ligne part avec la dictée"
```

---

### Tâche 12 : Cache des animaux, rempli à chaque ouverture en ligne

**Fichiers :**
- Créer : `apps/mobile/lib/features/records/domain/patient.dart`, `patient_repository.dart`
- Créer : `apps/mobile/lib/features/records/data/patient_repository_impl.dart`
- Créer : `apps/mobile/lib/core/lifecycle/foreground_refresh.dart`
- Modifier : `apps/mobile/lib/injection_container.dart`, `apps/mobile/lib/main.dart`
- Test : `apps/mobile/test/features/records/patient_repository_test.dart`, `apps/mobile/test/core/foreground_refresh_test.dart`

**Interfaces :**
- Produit :

```dart
class Patient { final String id, ownerId, ownerName, name, species; final String? breed; }
abstract class PatientRepository {
  Stream<List<Patient>> watchAll();
  Future<Result<void>> refresh();
}
class ForegroundRefresh with WidgetsBindingObserver {
  ForegroundRefresh({required Future<void> Function() onForeground});
  void start(); void stop();
}
Future<void> refreshForeground();  // dans foreground_refresh.dart : sync + agenda + animaux
```

- [ ] **Étape 1 : Tests qui échouent**

`patient_repository_test.dart` (drift en mémoire via `AppDatabase.forTesting(NativeDatabase.memory())`, Dio doublé par un `HttpClientAdapter` factice ou, plus simple, un `Dio` avec `interceptors` qui résout les requêtes via `handler.resolve(Response(...))`) :

```dart
test('remplace le cache par les pages du serveur, en suivant le curseur', () async {
  // page 1 : un animal, nextCursor 'c2' ; page 2 : un animal, nextCursor null
  final result = await repository.refresh();
  expect(result.isSuccess, isTrue);
  expect((await repository.watchAll().first).map((p) => p.name), ['Filou', 'Rex']);
});

test('garde le cache quand le réseau échoue', () async {
  // cache préalable : Filou ; réseau : DioException connectionError
  final result = await repository.refresh();
  expect(result.failureOrNull, isA<NetworkFailure>());
  expect((await repository.watchAll().first).single.name, 'Filou');
});
```

`foreground_refresh_test.dart` :

```dart
test('rafraîchit à la reprise au premier plan et jamais à la mise en pause', () {
  var calls = 0;
  final refresh = ForegroundRefresh(onForeground: () async => calls++);
  refresh.didChangeAppLifecycleState(AppLifecycleState.paused);
  expect(calls, 0);
  refresh.didChangeAppLifecycleState(AppLifecycleState.resumed);
  expect(calls, 1);
});
```

- [ ] **Étape 2 : Lancer, vérifier l'échec.**

- [ ] **Étape 3 : Implémenter**

`patient.dart` :

```dart
import 'package:flutter/foundation.dart';

@immutable
class Patient {
  const Patient({
    required this.id,
    required this.ownerId,
    required this.ownerName,
    required this.name,
    required this.species,
    this.breed,
  });

  final String id;
  final String ownerId;
  final String ownerName;
  final String name;
  final String species;
  final String? breed;

  /// Ce que le sélecteur affiche sous le nom : « Chien · Camille Roux ».
  String get subtitle => '${speciesLabels[species] ?? species} · $ownerName';

  @override
  bool operator ==(Object other) => other is Patient && other.id == id;
  @override
  int get hashCode => id.hashCode;
}

const Map<String, String> speciesLabels = {
  'DOG': 'Chien',
  'CAT': 'Chat',
  'HORSE': 'Cheval',
  'RABBIT': 'Lapin',
  'NAC': 'NAC',
  'COW': 'Bovin',
  'OTHER': 'Autre',
};
```

`patient_repository_impl.dart` :

```dart
class PatientRepositoryImpl implements PatientRepository {
  const PatientRepositoryImpl(this._db, this._dio);

  final AppDatabase _db;
  final Dio _dio;

  @override
  Stream<List<Patient>> watchAll() =>
      (_db.select(_db.cachedPatients)..orderBy([(p) => OrderingTerm.asc(p.name)]))
          .watch()
          .map((rows) => rows
              .map((r) => Patient(
                    id: r.id, ownerId: r.ownerId, ownerName: r.ownerName,
                    name: r.name, species: r.species, breed: r.breed,
                  ))
              .toList());

  @override
  Future<Result<void>> refresh() async {
    final items = <Map<String, dynamic>>[];
    String? cursor;
    try {
      // Pages de cinquante, bornées par le contrat ; on suit le curseur
      // jusqu'au bout pour que le sélecteur hors ligne soit complet.
      do {
        final response = await _dio.get<Map<String, dynamic>>(
          '/api/mobile/v1/patients',
          queryParameters: {'limit': 50, if (cursor != null) 'cursor': cursor},
        );
        items.addAll(
          (response.data?['items'] as List<dynamic>? ?? const [])
              .whereType<Map<String, dynamic>>(),
        );
        cursor = response.data?['nextCursor'] as String?;
      } while (cursor != null);
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }

    await _db.transaction(() async {
      await _db.delete(_db.cachedPatients).go();
      for (final item in items) {
        await _db.into(_db.cachedPatients).insert(
              CachedPatientsCompanion.insert(
                id: item['id'] as String,
                ownerId: item['ownerId'] as String,
                ownerName: item['ownerName'] as String,
                name: item['name'] as String,
                species: item['species'] as String,
                breed: Value(item['breed'] as String?),
              ),
              mode: InsertMode.insertOrReplace,
            );
      }
    });
    return const Success(null);
  }
}
```

`foreground_refresh.dart` :

```dart
import 'dart:async';

import 'package:flutter/widgets.dart';

import '../../features/capture/domain/sync_engine.dart';
import '../../features/records/domain/patient_repository.dart';
import '../../injection_container.dart';

/// Ce qui doit être à jour avant d'être sur le terrain : la file part, le cache
/// des animaux se remplit. Appelé à la connexion et à chaque retour au premier
/// plan, jamais à la demande depuis un écran.
Future<void> refreshForeground() async {
  await Future.wait<void>([
    getIt<SyncEngine>().runOnce().then((_) {}),
    getIt<PatientRepository>().refresh().then((_) {}),
  ]);
}

class ForegroundRefresh with WidgetsBindingObserver {
  ForegroundRefresh({required this.onForeground});

  final Future<void> Function() onForeground;

  void start() => WidgetsBinding.instance.addObserver(this);
  void stop() => WidgetsBinding.instance.removeObserver(this);

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) unawaited(onForeground());
  }
}
```

`injection_container.dart` : `..registerLazySingleton<PatientRepository>(() => PatientRepositoryImpl(getIt(), getIt()))`.

`main.dart`, dans `_BiumeAppState` : créer `late final _foreground = ForegroundRefresh(onForeground: _refreshIfAuthenticated);`, `start()` dans `initState`, `stop()` dans `dispose` ; s'abonner à `_auth.stream` et appeler `refreshForeground()` à chaque passage en `AuthAuthenticated` ; `_refreshIfAuthenticated` ne fait rien si `_auth.state` n'est pas `AuthAuthenticated`.

- [ ] **Étape 4 : Lancer, vérifier** — `cd apps/mobile && rtk flutter test && rtk flutter analyze`.

- [ ] **Étape 5 : Commit**

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): précharger les animaux et relancer la file à chaque retour au premier plan"
```

---

### Tâche 13 : Sélecteur d'animal

**Fichiers :**
- Créer : `apps/mobile/lib/features/records/presentation/patient_picker_cubit.dart`, `patient_picker_screen.dart`
- Modifier : `apps/mobile/lib/config/app_router.dart` (route `/animaux/choisir`)
- Test : `apps/mobile/test/features/records/patient_picker_cubit_test.dart`, `patient_picker_screen_test.dart`

**Interfaces :**
- Produit : route `/animaux/choisir` qui **retourne** le `Patient` choisi via `context.pop(patient)` ; `PatientPickerCubit(PatientRepository)` avec `start()`, `search(String query)` ; état `PatientPickerState({required List<Patient> all, required String query})` avec `List<Patient> get visible`.

- [ ] **Étape 1 : Tests qui échouent**

```dart
blocTest<PatientPickerCubit, PatientPickerState>(
  'filtre sur le nom de l\'animal et du propriétaire, sans casse ni accent',
  build: () => PatientPickerCubit(repository)..start(),
  act: (cubit) => cubit.search('rou'),
  expect: () => [
    isA<PatientPickerState>().having((s) => s.visible.length, 'tous', 2),
    isA<PatientPickerState>().having((s) => s.visible.map((p) => p.name), 'filtré', ['Filou']),
  ],
);
```

Widget : taper « rex » dans le champ ne laisse qu'une ligne ; taper la ligne appelle `Navigator.pop` avec le `Patient`.

- [ ] **Étape 2 : Lancer, vérifier l'échec.**

- [ ] **Étape 3 : Implémenter**

Cubit :

```dart
class PatientPickerState {
  const PatientPickerState({required this.all, required this.query});
  final List<Patient> all;
  final String query;

  List<Patient> get visible {
    final needle = _fold(query);
    if (needle.isEmpty) return all;
    return all
        .where((p) => _fold(p.name).contains(needle) || _fold(p.ownerName).contains(needle))
        .toList();
  }
}

/// Minuscules et accents retirés : « Léo » se trouve en tapant « leo ».
String _fold(String value) => value
    .toLowerCase()
    .replaceAll(RegExp('[àáâä]'), 'a')
    .replaceAll(RegExp('[éèêë]'), 'e')
    .replaceAll(RegExp('[îï]'), 'i')
    .replaceAll(RegExp('[ôö]'), 'o')
    .replaceAll(RegExp('[ùûü]'), 'u')
    .replaceAll('ç', 'c');

class PatientPickerCubit extends Cubit<PatientPickerState> {
  PatientPickerCubit(this._repository)
      : super(const PatientPickerState(all: [], query: ''));

  final PatientRepository _repository;
  StreamSubscription<List<Patient>>? _subscription;

  void start() {
    _subscription = _repository.watchAll().listen(
      (all) => emit(PatientPickerState(all: all, query: state.query)),
    );
  }

  void search(String query) => emit(PatientPickerState(all: state.all, query: query));

  @override
  Future<void> close() async {
    await _subscription?.cancel();
    return super.close();
  }
}
```

Écran : `Scaffold` titre « Quel animal ? », `TextField` autofocus avec `hintText: 'Nom de l\'animal ou du propriétaire'`, `ListView` de `ListTile(title: name, subtitle: patient.subtitle, onTap: () => context.pop(patient))`. Si `all` est vide : « Aucun animal dans le cache. Connectez-vous une fois au réseau pour le remplir. » (Le bouton « Nouveau client » est ajouté par le lot B, pas ici.)

Route : `GoRoute(path: '/animaux/choisir', builder: (_, _) => const PatientPickerPage())` où la page crée le cubit depuis `getIt<PatientRepository>()`.

- [ ] **Étape 4 : Lancer, vérifier** — `cd apps/mobile && rtk flutter test && rtk flutter analyze`.

- [ ] **Étape 5 : Commit**

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): choisir l'animal d'une dictée depuis le cache"
```

---

### Tâche 14 : Correction et validation de la transcription

**Fichiers :**
- Modifier : `apps/mobile/lib/features/transcript/domain/transcript_repository.dart`
- Créer : `apps/mobile/lib/features/transcript/data/http_transcript_repository.dart`
- Modifier : `apps/mobile/lib/features/transcript/presentation/transcript_cubit.dart`
- Créer : `apps/mobile/lib/features/transcript/presentation/transcript_page.dart`, `transcript_screen.dart`
- Modifier : `apps/mobile/lib/config/app_router.dart`, `apps/mobile/lib/injection_container.dart`
- Test : `apps/mobile/test/features/transcript/transcript_cubit_test.dart` (ajout), `transcript_screen_test.dart` (créer)

**Interfaces :**
- Consomme : `CaptureStore.markExtractionRequested` (tâche 11), route `/animaux/choisir` (tâche 13).
- Produit :

```dart
abstract class TranscriptRepository {
  Future<Result<Transcript>> load(String captureId);
  Future<Result<Transcript>> correct(String captureId, String text);
  Future<Result<void>> attach(String captureId, String patientId);
  Future<Result<String>> extract(String captureId); // renvoie reportId
}
// TranscriptCubit
Future<void> validate({required String text, required String? patientId});
class TranscriptValidating extends TranscriptState { final Transcript transcript; }
class TranscriptValidated extends TranscriptState { final String reportId; }
```

Route : `/dictees/:captureId/transcription?rattacher=1&rdv=<id>`.

- [ ] **Étape 1 : Tests du cubit qui échouent**

```dart
blocTest<TranscriptCubit, TranscriptState>(
  'valide sans correction : pas d\'appel à correct, extraction lancée',
  setUp: () {
    when(() => repository.load(any())).thenAnswer((_) async => Success(prete));
    when(() => repository.extract('capture-1')).thenAnswer((_) async => const Success('report-1'));
  },
  build: () => TranscriptCubit(repository, store),
  act: (cubit) async {
    await cubit.load('capture-1');
    await cubit.validate(text: prete.text, patientId: null);
  },
  verify: (cubit) {
    verifyNever(() => repository.correct(any(), any()));
    verify(() => store.markExtractionRequested('capture-1', any())).called(1);
    expect(cubit.state, const TranscriptValidated('report-1'));
  },
);

blocTest<TranscriptCubit, TranscriptState>(
  'corrige puis rattache puis extrait, dans cet ordre',
  setUp: () {
    when(() => repository.load(any())).thenAnswer((_) async => Success(prete));
    when(() => repository.correct('capture-1', 'Texte corrigé')).thenAnswer((_) async => Success(corrigee));
    when(() => repository.attach('capture-1', 'pet-1')).thenAnswer((_) async => const Success(null));
    when(() => repository.extract('capture-1')).thenAnswer((_) async => const Success('report-1'));
  },
  build: () => TranscriptCubit(repository, store),
  act: (cubit) async {
    await cubit.load('capture-1');
    await cubit.validate(text: 'Texte corrigé', patientId: 'pet-1');
  },
  verify: (_) {
    verifyInOrder([
      () => repository.correct('capture-1', 'Texte corrigé'),
      () => repository.attach('capture-1', 'pet-1'),
      () => repository.extract('capture-1'),
    ]);
  },
);

blocTest<TranscriptCubit, TranscriptState>(
  'garde la saisie quand l\'extraction échoue',
  setUp: () {
    when(() => repository.load(any())).thenAnswer((_) async => Success(prete));
    when(() => repository.extract(any())).thenAnswer((_) async => const Err(NetworkFailure()));
  },
  build: () => TranscriptCubit(repository, store),
  act: (cubit) async {
    await cubit.load('capture-1');
    await cubit.validate(text: prete.text, patientId: null);
  },
  expect: () => [
    const TranscriptLoading(),
    TranscriptReady(prete),
    TranscriptValidating(prete),
    TranscriptReady(prete, draft: prete.text, message: 'Connexion indisponible.'),
  ],
);

blocTest<TranscriptCubit, TranscriptState>(
  'refuse de valider une transcription non prête',
  setUp: () {
    when(() => repository.load(any())).thenAnswer((_) async => Success(enCours));
  },
  build: () => TranscriptCubit(repository, store),
  act: (cubit) async {
    await cubit.load('capture-1');
    await cubit.validate(text: '', patientId: null);
  },
  verify: (_) => verifyNever(() => repository.extract(any())),
);
```

Fixtures du fichier : `prete = Transcript(captureId: 'capture-1', status: TranscriptStatus.ready, text: 'Filou présente une tension lombaire.')`, `corrigee = Transcript(captureId: 'capture-1', status: TranscriptStatus.corrected, text: 'Texte corrigé')`, `enCours = Transcript(captureId: 'capture-1', status: TranscriptStatus.running, text: '')`. `store` est un `MockCaptureStore` ; `registerFallbackValue(DateTime(2026))` dans `setUp`.

- [ ] **Étape 2 : Lancer, vérifier l'échec.**

- [ ] **Étape 3 : Implémenter**

Cubit : constructeur `TranscriptCubit(this._repository, this._store)` ; états `TranscriptValidating(transcript)` et `TranscriptValidated(reportId)` sur le modèle des existants (égalité par valeur) ; méthode :

```dart
  /// Un seul bouton : enregistre la correction s'il y en a une, rattache
  /// l'animal s'il a été choisi, puis lance l'extraction. L'ordre est celui de
  /// la spécification : on corrige la source avant d'en extraire quoi que ce
  /// soit.
  Future<void> validate({required String text, required String? patientId}) async {
    final current = state;
    if (current is! TranscriptReady) return;
    if (!current.transcript.isCorrectable) return;

    var transcript = current.transcript;
    emit(TranscriptValidating(transcript));

    if (text != transcript.text) {
      switch (await _repository.correct(transcript.captureId, text)) {
        case Success(:final value):
          transcript = value;
        case Err(:final failure):
          emit(TranscriptReady(transcript, draft: text, message: failure.message));
          return;
      }
    }

    if (patientId != null) {
      if (await _repository.attach(transcript.captureId, patientId) case Err(:final failure)) {
        emit(TranscriptReady(transcript, draft: text, message: failure.message));
        return;
      }
    }

    switch (await _repository.extract(transcript.captureId)) {
      case Success(:final value):
        await _store.markExtractionRequested(transcript.captureId, DateTime.now());
        emit(TranscriptValidated(value));
      case Err(:final failure):
        emit(TranscriptReady(transcript, draft: text, message: failure.message));
    }
  }
```

`http_transcript_repository.dart` : GET `/api/mobile/v1/captures/$id/transcript` → `Transcript(captureId, status: transcriptStatusFrom(data['status']), text: data['text'])` ; POST `.../transcript` `{text}` ; POST `.../attach` `{patientId}` ; POST `.../extract` → `data['reportId'] as String`. Chaque méthode suit le gabarit `try { ... } on DioException catch (error) { return Err(failureFromDioException(error)); }`.

`transcript_screen.dart` : reçoit `captureId`, `needsPatient`, `appointmentId`. `BlocConsumer` :
- `TranscriptLoading` → indicateur ;
- `TranscriptPending` → « Biume transcrit votre dictée. Vous pouvez quitter cet écran, elle apparaîtra dans « À traiter ». » ;
- `TranscriptInaudible` → « Rien n'a été capté. » + `FilledButton('Réenregistrer')` → `context.push('/dicter?rdv=$appointmentId')` ;
- `TranscriptUnavailable(message)` → message ;
- `TranscriptReady` → `TextField(maxLines: null, controller)` initialisé à `draft ?? transcript.text` ; si `needsPatient`, une ligne « Animal : {nom} » avec bouton « Choisir » (`final patient = await context.push<Patient>('/animaux/choisir')`) ; bouton unique `FilledButton('Valider la transcription')` désactivé si `needsPatient && patient == null` ; `message` affiché dans une bannière `warningSurface` ;
- `TranscriptValidating` → bouton en attente ;
- listener : `TranscriptValidated(reportId)` → `context.pushReplacement('/comptes-rendus/$reportId')`.

Aucune sauvegarde automatique : le texte part uniquement par le bouton.

Route : `GoRoute(path: '/dictees/:captureId/transcription', builder: (_, state) => TranscriptPage(captureId: state.pathParameters['captureId']!, needsPatient: state.uri.queryParameters['rattacher'] == '1', appointmentId: state.uri.queryParameters['rdv']))`. DI : `registerLazySingleton<TranscriptRepository>(() => HttpTranscriptRepository(getIt()))`.

- [ ] **Étape 4 : Test widget** : l'écran prêt affiche le texte dans un champ et **un seul** `FilledButton` ; taper le bouton appelle `validate` avec le texte du champ ; l'écran inaudible n'affiche aucun `TextField`.

- [ ] **Étape 5 : Lancer, vérifier** — `cd apps/mobile && rtk flutter test && rtk flutter analyze`.

- [ ] **Étape 6 : Commit**

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): corriger la transcription puis la valider en un geste"
```

---

## Partie 3 — Flutter : compte rendu, suivi, accueil

### Tâche 15 : Compte rendu branché sur le serveur, avec attente de l'extraction

**Fichiers :**
- Modifier : `apps/mobile/lib/features/report/domain/proposal.dart`, `report_repository.dart`
- Créer : `apps/mobile/lib/features/report/data/http_report_repository.dart`
- Modifier : `apps/mobile/lib/features/report/presentation/report_cubit.dart`, `report_screen.dart`
- Modifier : `apps/mobile/lib/config/app_router.dart`, `apps/mobile/lib/injection_container.dart`
- Test : `apps/mobile/test/features/report/report_cubit_test.dart`, `report_screen_test.dart`, `apps/mobile/test/features/report/http_report_repository_test.dart`

**Interfaces :**
- Produit :

```dart
enum ReportStatus { draft, finalized, sent }
class ReportOwner { final String id; final String name; final String? email; }
class ReportProposals { ... + final ReportStatus status; final String patientName; final ReportOwner owner; final String? captureId; bool get isReadOnly => status != ReportStatus.draft; }
class FinalizeOutcome { final ReportStatus status; final bool sentToOwner; }
abstract class ReportRepository {
  ... existants ...
  Future<Result<FinalizeOutcome>> finalize(String reportId, {required bool sendToOwner});
  Future<Result<void>> updateOwnerEmail(String ownerId, String email);
}
// ReportCubit
ReportCubit(ReportRepository repository, {Duration pollInterval = const Duration(seconds: 3), int maxPolls = 40});
class ReportPreparing extends ReportState {}      // extraction en cours, on interroge
class ReportFinalized extends ReportState { final FinalizeOutcome outcome; final String reportId; }
Future<void> finalize({required bool sendToOwner});
Future<void> addOwnerEmailThenFinalize(String email);
```

Route : `/comptes-rendus/:reportId`.

- [ ] **Étape 1 : Tests qui échouent**

Dans `report_cubit_test.dart`, `propositions()` reçoit les trois champs nouveaux (`status: ReportStatus.draft`, `patientName: 'Filou'`, `owner: const ReportOwner(id: 'owner-1', name: 'Camille Roux', email: 'camille@example.org')`). Ajouter :

```dart
blocTest<ReportCubit, ReportState>(
  'attend l\'extraction puis affiche les propositions',
  setUp: () {
    var calls = 0;
    when(() => repository.load(any())).thenAnswer((_) async {
      calls++;
      return Success(calls < 3 ? propositions(items: const []) : propositions());
    });
  },
  build: () => ReportCubit(repository, pollInterval: Duration.zero),
  act: (cubit) => cubit.load('report-1'),
  expect: () => [
    const ReportLoading(),
    const ReportPreparing(),
    isA<ReportLoaded>().having((s) => s.data.proposals.length, 'propositions', 1),
  ],
);

blocTest<ReportCubit, ReportState>(
  'renonce à attendre après le nombre maximal d\'interrogations',
  setUp: () {
    when(() => repository.load(any())).thenAnswer((_) async => Success(propositions(items: const [])));
  },
  build: () => ReportCubit(repository, pollInterval: Duration.zero, maxPolls: 2),
  act: (cubit) => cubit.load('report-1'),
  expect: () => [
    const ReportLoading(),
    const ReportPreparing(),
    isA<ReportLoaded>().having((s) => s.message, 'message', contains('plus long que prévu')),
  ],
);

blocTest<ReportCubit, ReportState>(
  'n\'attend pas sur un rapport finalisé sans proposition',
  setUp: () {
    when(() => repository.load(any())).thenAnswer(
      (_) async => Success(propositions(items: const [], status: ReportStatus.sent)),
    );
  },
  build: () => ReportCubit(repository, pollInterval: Duration.zero),
  act: (cubit) => cubit.load('report-1'),
  expect: () => [const ReportLoading(), isA<ReportLoaded>()],
);

blocTest<ReportCubit, ReportState>(
  'finalise et envoie',
  setUp: () {
    when(() => repository.load(any())).thenAnswer((_) async => Success(propositions(sections: toutesDecidees)));
    when(() => repository.finalize('report-1', sendToOwner: true)).thenAnswer(
      (_) async => const Success(FinalizeOutcome(status: ReportStatus.sent, sentToOwner: true)),
    );
  },
  build: () => ReportCubit(repository, pollInterval: Duration.zero),
  act: (cubit) async {
    await cubit.load('report-1');
    await cubit.finalize(sendToOwner: true);
  },
  verify: (cubit) => expect(cubit.state, isA<ReportFinalized>().having((s) => s.outcome.sentToOwner, 'envoyé', true)),
);

blocTest<ReportCubit, ReportState>(
  'complète l\'e-mail puis finalise',
  setUp: () {
    when(() => repository.load(any())).thenAnswer(
      (_) async => Success(propositions(sections: toutesDecidees, owner: const ReportOwner(id: 'owner-1', name: 'Camille Roux', email: null))),
    );
    when(() => repository.updateOwnerEmail('owner-1', 'camille@example.org')).thenAnswer((_) async => const Success(null));
    when(() => repository.finalize('report-1', sendToOwner: true)).thenAnswer(
      (_) async => const Success(FinalizeOutcome(status: ReportStatus.sent, sentToOwner: true)),
    );
  },
  build: () => ReportCubit(repository, pollInterval: Duration.zero),
  act: (cubit) async {
    await cubit.load('report-1');
    await cubit.addOwnerEmailThenFinalize('camille@example.org');
  },
  verify: (_) => verifyInOrder([
    () => repository.updateOwnerEmail('owner-1', 'camille@example.org'),
    () => repository.finalize('report-1', sendToOwner: true),
  ]),
);

blocTest<ReportCubit, ReportState>(
  'refuse de finaliser tant qu\'une section reste à vérifier',
  setUp: () {
    when(() => repository.load(any())).thenAnswer((_) async => Success(propositions()));
  },
  build: () => ReportCubit(repository, pollInterval: Duration.zero),
  act: (cubit) async {
    await cubit.load('report-1');
    await cubit.finalize(sendToOwner: true);
  },
  verify: (_) => verifyNever(() => repository.finalize(any(), sendToOwner: any(named: 'sendToOwner'))),
);
```

`toutesDecidees` = les quatre sections en `confirmed`/`notApplicable`. `propositions()` gagne les paramètres nommés `status` et `owner`.

`http_report_repository_test.dart` (Dio intercepté) : `load` mappe `needs_confirmation` → `SectionState.needsConfirmation` et `not_applicable` → `SectionState.notApplicable`, `status: 'sent'` → `ReportStatus.sent`, `owner.email: null` → `null`.

Dans `report_screen_test.dart` : « n'affiche aucun bouton sur un rapport finalisé » ; « propose d'ajouter l'e-mail quand le propriétaire n'en a pas » (taper « Finaliser et partager » → une feuille avec un `TextField` et deux boutons « Enregistrer et envoyer » / « Finaliser sans envoyer ») ; « affiche « Biume prépare le compte rendu » pendant l'attente ».

- [ ] **Étape 2 : Lancer, vérifier l'échec.**

- [ ] **Étape 3 : Domaine et dépôt HTTP**

`proposal.dart` : ajouter `enum ReportStatus { draft, finalized, sent }`, `ReportStatus reportStatusFrom(String v)` (`'finalized'`, `'sent'`, sinon `draft`), `SectionState sectionStateFrom(String v)` (`'proposed'`, `'needs_confirmation'`, `'confirmed'`, `'not_applicable'`, sinon `empty`), `String sectionStateToApi(SectionState s)` (inverse, `confirmed` → `'confirmed'`, `notApplicable` → `'not_applicable'`), `ReportSection reportSectionFrom(String v)` et `sectionToApi`. Classe `ReportOwner` immuable (`id`, `name`, `email?`). `ReportProposals` gagne `status`, `patientName`, `owner`, `captureId`, `bool get isReadOnly => status != ReportStatus.draft`. Classe `FinalizeOutcome` immuable.

`http_report_repository.dart` :

```dart
class HttpReportRepository implements ReportRepository {
  const HttpReportRepository(this._dio);
  final Dio _dio;

  ReportProposals _parse(Map<String, dynamic> data) {
    final owner = data['owner'] as Map<String, dynamic>;
    final sections = (data['sections'] as Map<String, dynamic>? ?? const {}).map(
      (key, value) => MapEntry(reportSectionFrom(key), sectionStateFrom(value as String)),
    );
    return ReportProposals(
      reportId: data['reportId'] as String,
      status: reportStatusFrom(data['status'] as String),
      patientName: data['patientName'] as String,
      captureId: data['captureId'] as String?,
      owner: ReportOwner(id: owner['id'] as String, name: owner['name'] as String, email: owner['email'] as String?),
      transcript: data['transcript'] as String,
      proposals: (data['items'] as List<dynamic>).whereType<Map<String, dynamic>>().map((item) {
        final anchor = item['anchor'] as Map<String, dynamic>;
        return Proposal(
          id: item['id'] as String,
          section: reportSectionFrom(item['section'] as String),
          text: item['text'] as String,
          state: sectionStateFrom(item['state'] as String),
          anchor: TranscriptAnchor(start: anchor['start'] as int, end: anchor['end'] as int, quote: anchor['quote'] as String),
        );
      }).toList(),
      // Les quatre sections sont toujours présentes : une section absente de
      // la réponse est « à remplir », pas une clé manquante à l'écran.
      sections: {for (final s in ReportSection.values) s: sections[s] ?? SectionState.empty},
    );
  }

  Future<Result<ReportProposals>> _call(Future<Response<Map<String, dynamic>>> Function() request) async {
    try {
      return Success(_parse((await request()).data!));
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }

  @override
  Future<Result<ReportProposals>> load(String reportId) =>
      _call(() => _dio.get('/api/mobile/v1/reports/$reportId/proposals'));

  @override
  Future<Result<ReportProposals>> decide({required String reportId, required String proposalId, required SectionState decision}) =>
      _call(() => _dio.post('/api/mobile/v1/reports/$reportId/proposals/$proposalId/decision', data: {'state': sectionStateToApi(decision)}));

  @override
  Future<Result<ReportProposals>> decideSection({required String reportId, required ReportSection section, required SectionState decision}) =>
      _call(() => _dio.post('/api/mobile/v1/reports/$reportId/sections/${sectionToApi(section)}/decision', data: {'state': sectionStateToApi(decision)}));

  @override
  Future<Result<ReportProposals>> regenerate(String reportId) =>
      _call(() => _dio.post('/api/mobile/v1/reports/$reportId/proposals/regenerate'));

  @override
  Future<Result<FinalizeOutcome>> finalize(String reportId, {required bool sendToOwner}) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/api/mobile/v1/reports/$reportId/finalize',
        data: {'sendToOwner': sendToOwner},
      );
      final data = response.data!;
      return Success(FinalizeOutcome(status: reportStatusFrom(data['status'] as String), sentToOwner: data['sentToOwner'] as bool));
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }

  @override
  Future<Result<void>> updateOwnerEmail(String ownerId, String email) async {
    try {
      await _dio.post<Map<String, dynamic>>('/api/mobile/v1/owners/$ownerId/email', data: {'email': email});
      return const Success(null);
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }
}
```

- [ ] **Étape 4 : Cubit**

```dart
class ReportCubit extends Cubit<ReportState> {
  ReportCubit(this._repository, {this.pollInterval = const Duration(seconds: 3), this.maxPolls = 40})
      : super(const ReportInitial());

  final ReportRepository _repository;
  final Duration pollInterval;
  final int maxPolls;

  /// Après « Valider la transcription », les propositions arrivent dans les
  /// secondes qui suivent. On interroge tant qu'il n'y en a pas, à intervalle
  /// court, et on cesse au bout de deux minutes : le praticien reste libre de
  /// partir, « À traiter » le rappellera.
  Future<void> load(String reportId) async {
    emit(const ReportLoading());
    for (var attempt = 0; ; attempt++) {
      final result = await _repository.load(reportId);
      switch (result) {
        case Err(:final failure):
          emit(ReportUnavailable(failure.message));
          return;
        case Success(:final value):
          final waiting = value.proposals.isEmpty && !value.isReadOnly;
          if (!waiting) {
            emit(ReportLoaded(value));
            return;
          }
          if (attempt >= maxPolls - 1) {
            emit(ReportLoaded(value, message: "La préparation prend plus long que prévu. Revenez dans un instant depuis « À traiter »."));
            return;
          }
          if (state is! ReportPreparing) emit(const ReportPreparing());
          if (isClosed) return;
          await Future<void>.delayed(pollInterval);
          if (isClosed) return;
      }
    }
  }

  Future<void> finalize({required bool sendToOwner}) async {
    final current = state;
    if (current is! ReportLoaded || !current.data.canFinalize || current.data.isReadOnly) return;
    emit(ReportLoaded(current.data, busy: true));
    switch (await _repository.finalize(current.data.reportId, sendToOwner: sendToOwner)) {
      case Success(:final value):
        emit(ReportFinalized(reportId: current.data.reportId, outcome: value));
      case Err(:final failure):
        emit(ReportLoaded(current.data, message: failure.message));
    }
  }

  /// Le garde-fou e-mail : compléter la fiche, puis envoyer. Deux appels, un
  /// seul geste pour le praticien.
  Future<void> addOwnerEmailThenFinalize(String email) async {
    final current = state;
    if (current is! ReportLoaded) return;
    emit(ReportLoaded(current.data, busy: true));
    if (await _repository.updateOwnerEmail(current.data.owner.id, email) case Err(:final failure)) {
      emit(ReportLoaded(current.data, message: failure.message));
      return;
    }
    emit(ReportLoaded(current.data.withOwnerEmail(email)));
    await finalize(sendToOwner: true);
  }
  // confirm / dismiss / decideWholeSection / regenerate / _apply / _decide : inchangés
}
```

`ReportProposals.withOwnerEmail(String email)` renvoie une copie avec `owner.email` renseigné. `ReportPreparing` et `ReportFinalized` : classes d'état avec égalité par valeur comme les autres.

- [ ] **Étape 5 : Écran**

`report_screen.dart` :
- `ReportPreparing` → colonne centrée : indicateur + « Biume prépare le compte rendu » + « Vous pouvez quitter cet écran. » ;
- `ReportLoaded` avec `data.isReadOnly` → aucun bouton dans les cartes, pas de bouton de finalisation, bandeau « Compte rendu envoyé » ou « Compte rendu finalisé » ;
- bouton final `FilledButton` « Finaliser et partager » actif si `canFinalize && !busy && !isReadOnly` ; à la pression : si `data.owner.email == null`, ouvrir `showModalBottomSheet` avec le texte « {owner.name} n'a pas d'adresse e-mail. Sans elle, Biume ne peut pas lui envoyer le compte rendu. », un `TextField(keyboardType: emailAddress)`, `FilledButton('Enregistrer et envoyer')` → `addOwnerEmailThenFinalize(text)`, `TextButton('Finaliser sans envoyer')` → `finalize(sendToOwner: false)` ; sinon `finalize(sendToOwner: true)` ;
- `BlocListener` : `ReportFinalized` → `context.pushReplacement('/comptes-rendus/${state.reportId}/suivi?capture=${captureId ?? ''}')`.

Route : `GoRoute(path: '/comptes-rendus/:reportId', builder: (_, state) => ReportPage(reportId: state.pathParameters['reportId']!))`. DI : `registerLazySingleton<ReportRepository>(() => HttpReportRepository(getIt()))`.

- [ ] **Étape 6 : Lancer, vérifier** — `cd apps/mobile && rtk flutter test && rtk flutter analyze`.

- [ ] **Étape 7 : Commit**

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): valider le compte rendu prérempli, le finaliser et l'envoyer"
```

---

### Tâche 16 : Suivi proposé par défaut, refusable

**Fichiers :**
- Créer : `apps/mobile/lib/features/followup/domain/follow_up_repository.dart`, `follow_up_questionnaire.dart`
- Créer : `apps/mobile/lib/features/followup/data/http_follow_up_repository.dart`
- Créer : `apps/mobile/lib/features/followup/presentation/follow_up_schedule_cubit.dart`, `follow_up_schedule_screen.dart`
- Modifier : `apps/mobile/lib/config/app_router.dart`, `apps/mobile/lib/injection_container.dart`
- Test : `apps/mobile/test/features/followup/follow_up_schedule_cubit_test.dart`, `follow_up_schedule_screen_test.dart`

**Interfaces :**
- Produit :

```dart
abstract class FollowUpRepository {
  Future<Result<void>> schedule(String reportId, DateTime dueAt);
}
const int followUpMinDelayDays = 3;
const int followUpMaxDelayDays = 90;
const int followUpDefaultDelayDays = 7;
const Map<String, dynamic> defaultFollowUpQuestionnaire = { ... copie exacte du contrat ... };
const List<String> defaultFollowUpQuestionLabels = [ ...trois libellés... ];
// Cubit
FollowUpScheduleCubit(FollowUpRepository repository, {required String reportId, required DateTime Function() now});
class FollowUpScheduleState { final DateTime dueAt; final bool busy; final String? message; final bool done; }
void chooseDate(DateTime dueAt); Future<void> schedule(); void decline();
```

Route : `/comptes-rendus/:reportId/suivi`.

- [ ] **Étape 1 : Tests qui échouent**

```dart
blocTest<FollowUpScheduleCubit, FollowUpScheduleState>(
  'propose J+7 par défaut',
  build: () => FollowUpScheduleCubit(repository, reportId: 'report-1', now: () => DateTime(2026, 9, 3, 10)),
  verify: (cubit) => expect(cubit.state.dueAt, DateTime(2026, 9, 10, 10)),
);

blocTest<FollowUpScheduleCubit, FollowUpScheduleState>(
  'refuse une échéance sous le plancher de trois jours',
  build: () => FollowUpScheduleCubit(repository, reportId: 'report-1', now: () => DateTime(2026, 9, 3, 10)),
  act: (cubit) => cubit.chooseDate(DateTime(2026, 9, 4)),
  verify: (cubit) => expect(cubit.state.dueAt, DateTime(2026, 9, 10, 10)),
);

blocTest<FollowUpScheduleCubit, FollowUpScheduleState>(
  'programme le suivi et se déclare terminé',
  setUp: () => when(() => repository.schedule('report-1', any())).thenAnswer((_) async => const Success(null)),
  build: () => FollowUpScheduleCubit(repository, reportId: 'report-1', now: () => DateTime(2026, 9, 3, 10)),
  act: (cubit) => cubit.schedule(),
  verify: (cubit) => expect(cubit.state.done, isTrue),
);

blocTest<FollowUpScheduleCubit, FollowUpScheduleState>(
  'refuser est un geste explicite qui termine sans appel réseau',
  build: () => FollowUpScheduleCubit(repository, reportId: 'report-1', now: () => DateTime(2026, 9, 3, 10)),
  act: (cubit) => cubit.decline(),
  verify: (cubit) {
    expect(cubit.state.done, isTrue);
    verifyNever(() => repository.schedule(any(), any()));
  },
);
```

Widget : les trois libellés du questionnaire sont affichés en lecture seule (aucun `TextField`) ; deux boutons exactement, « Programmer le suivi » et « Pas de suivi pour cette séance ».

- [ ] **Étape 2 : Lancer, vérifier l'échec.**

- [ ] **Étape 3 : Implémenter**

`follow_up_questionnaire.dart` : les constantes ci-dessus. `defaultFollowUpQuestionnaire` est la copie **exacte** de `packages/contracts/src/followup.ts:52-73` (trois questions : `scale/evolution` avec `better/same/worse` « Mieux/Pareil/Moins bien », `text/reaction`, `boolean/wantsContact`). Un test vérifie que les trois `id` sont `evolution`, `reaction`, `wantsContact`.

`http_follow_up_repository.dart` : POST `/api/mobile/v1/reports/$reportId/followup` avec `{'dueAt': dueAt.toUtc().toIso8601String(), 'questionnaire': defaultFollowUpQuestionnaire}`.

Cubit :

```dart
class FollowUpScheduleCubit extends Cubit<FollowUpScheduleState> {
  FollowUpScheduleCubit(this._repository, {required this.reportId, required DateTime Function() now})
      : _now = now,
        super(FollowUpScheduleState(dueAt: now().add(const Duration(days: followUpDefaultDelayDays))));

  final FollowUpRepository _repository;
  final String reportId;
  final DateTime Function() _now;

  /// Le plancher est métier : un questionnaire envoyé le lendemain ne mesure
  /// rien. Une date hors bornes est ignorée, l'échéance précédente reste.
  void chooseDate(DateTime dueAt) {
    final min = _now().add(const Duration(days: followUpMinDelayDays));
    final max = _now().add(const Duration(days: followUpMaxDelayDays));
    if (dueAt.isBefore(min) || dueAt.isAfter(max)) return;
    emit(state.copyWith(dueAt: dueAt));
  }

  Future<void> schedule() async {
    emit(state.copyWith(busy: true, message: null));
    switch (await _repository.schedule(reportId, state.dueAt)) {
      case Success():
        emit(state.copyWith(busy: false, done: true));
      case Err(:final failure):
        emit(state.copyWith(busy: false, message: failure.message));
    }
  }

  void decline() => emit(state.copyWith(done: true, declined: true));
}
```

`FollowUpScheduleState` : `dueAt`, `busy`, `message`, `done`, `declined`, `copyWith`, égalité par valeur.

Écran : titre « Suivi du propriétaire » ; ligne « Envoyé le {date en toutes lettres} » avec bouton « Modifier » → `showDatePicker(firstDate: now+3j, lastDate: now+90j)` ; carte « Trois questions » listant `defaultFollowUpQuestionLabels` ; `FilledButton('Programmer le suivi')`, `TextButton('Pas de suivi pour cette séance')` ; listener : `done` → `context.go('/')`.

Route et DI : `GoRoute(path: '/comptes-rendus/:reportId/suivi', ...)`, `registerLazySingleton<FollowUpRepository>(() => HttpFollowUpRepository(getIt()))`.

- [ ] **Étape 4 : Lancer, vérifier** — `cd apps/mobile && rtk flutter test && rtk flutter analyze`.

- [ ] **Étape 5 : Commit**

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): proposer le suivi du propriétaire juste après l'envoi"
```

---

### Tâche 17 : « À traiter »

**Fichiers :**
- Créer : `apps/mobile/lib/features/todo/domain/todo_item.dart`, `todo_api.dart`
- Créer : `apps/mobile/lib/features/todo/data/http_todo_api.dart`
- Créer : `apps/mobile/lib/features/todo/presentation/todo_cubit.dart`, `todo_section.dart`
- Test : `apps/mobile/test/features/todo/todo_item_test.dart`, `todo_cubit_test.dart`, `todo_section_test.dart`

**Interfaces :**
- Consomme : `CaptureStore.watchAll()` (existant), `LocalCapture` (drift), `refreshForeground` (tâche 12).
- Produit :

```dart
enum TodoKind { pendingUpload, uploadBlocked, toAttach, transcribing, transcriptToReview, inaudible, transcriptionFailed, preparing, reportToValidate, readyToSend }
const Map<TodoKind, String> todoLabels;
class TodoItem { final TodoKind kind; final String captureId; final String? reportId; final String? appointmentId; final String? patientName; final DateTime updatedAt; String get label; String? get route; }
abstract class TodoApi { Future<Result<List<TodoItem>>> list(); }
TodoCubit(CaptureStore store, TodoApi api, {Duration pollInterval = const Duration(seconds: 10), DateTime Function() now = DateTime.now});
class TodoState { final List<TodoItem> items; final String? offlineMessage; }
```

- [ ] **Étape 1 : Tests qui échouent**

`todo_item_test.dart` :

```dart
test('chaque genre a un libellé et aucun libellé n\'est un état machine', () {
  for (final kind in TodoKind.values) {
    final label = todoLabels[kind]!;
    expect(label, isNotEmpty);
    expect(label, isNot(matches(RegExp(r'^[a-z_]+$'))));
  }
});

test('mène à l\'écran qui répond au geste', () {
  expect(item(TodoKind.transcriptToReview).route, '/dictees/c-1/transcription');
  expect(item(TodoKind.toAttach).route, '/dictees/c-1/transcription?rattacher=1');
  expect(item(TodoKind.reportToValidate, reportId: 'r-1').route, '/comptes-rendus/r-1');
  expect(item(TodoKind.transcribing).route, isNull);
});
```

`todo_cubit_test.dart` :

```dart
blocTest<TodoCubit, TodoState>(
  'place les dictées locales non envoyées avant les éléments du serveur',
  setUp: () {
    store.emitAll([localQueued('c-local')]);
    when(() => api.list()).thenAnswer((_) async => Success([serverItem(TodoKind.reportToValidate, 'c-srv')]));
  },
  build: () => TodoCubit(store, api, pollInterval: Duration.zero),
  act: (cubit) => cubit.start(),
  verify: (cubit) => expect(cubit.state.items.map((i) => i.captureId), ['c-local', 'c-srv']),
);

blocTest<TodoCubit, TodoState>(
  'affiche « Biume prépare le compte rendu » juste après la validation',
  setUp: () {
    store.emitAll([localUploaded('c-1', extractionRequestedAt: DateTime(2026, 9, 3, 10, 0))]);
    when(() => api.list()).thenAnswer((_) async => Success([serverItem(TodoKind.transcriptToReview, 'c-1')]));
  },
  build: () => TodoCubit(store, api, pollInterval: Duration.zero, now: () => DateTime(2026, 9, 3, 10, 1)),
  act: (cubit) => cubit.start(),
  verify: (cubit) => expect(cubit.state.items.single.kind, TodoKind.preparing),
);

blocTest<TodoCubit, TodoState>(
  'garde la liste et dit hors ligne quand le serveur ne répond pas',
  setUp: () {
    store.emitAll([localQueued('c-local')]);
    when(() => api.list()).thenAnswer((_) async => const Err(NetworkFailure()));
  },
  build: () => TodoCubit(store, api, pollInterval: Duration.zero),
  act: (cubit) => cubit.start(),
  verify: (cubit) {
    expect(cubit.state.items, hasLength(1));
    expect(cubit.state.offlineMessage, 'Connexion indisponible.');
  },
);
```

- [ ] **Étape 2 : Lancer, vérifier l'échec.**

- [ ] **Étape 3 : Implémenter**

`todo_item.dart` :

```dart
/// Le libellé dit le geste ou ce que Biume fait. Jamais l'état interne.
const Map<TodoKind, String> todoLabels = {
  TodoKind.pendingUpload: "Dictée en attente d'envoi",
  TodoKind.uploadBlocked: "Envoi impossible, appuyez pour réessayer",
  TodoKind.toAttach: 'À rattacher à un animal',
  TodoKind.transcribing: 'Biume transcrit votre dictée',
  TodoKind.transcriptToReview: 'Transcription à relire',
  TodoKind.inaudible: 'Dictée inaudible',
  TodoKind.transcriptionFailed: "La transcription n'a pas abouti",
  TodoKind.preparing: 'Biume prépare le compte rendu',
  TodoKind.reportToValidate: 'Compte rendu à valider',
  TodoKind.readyToSend: 'Prêt à envoyer',
};

TodoKind todoKindFromApi(String value) => switch (value) {
  'to_attach' => TodoKind.toAttach,
  'transcribing' => TodoKind.transcribing,
  'transcript_to_review' => TodoKind.transcriptToReview,
  'inaudible' => TodoKind.inaudible,
  'transcription_failed' => TodoKind.transcriptionFailed,
  'report_to_validate' => TodoKind.reportToValidate,
  'ready_to_send' => TodoKind.readyToSend,
  _ => TodoKind.transcribing,
};

@immutable
class TodoItem {
  const TodoItem({required this.kind, required this.captureId, required this.updatedAt, this.reportId, this.appointmentId, this.patientName});
  // champs...
  String get label => todoLabels[kind]!;

  String? get route => switch (kind) {
    TodoKind.pendingUpload || TodoKind.uploadBlocked => null,
    TodoKind.toAttach => '/dictees/$captureId/transcription?rattacher=1${appointmentId == null ? '' : '&rdv=$appointmentId'}',
    TodoKind.transcriptToReview || TodoKind.inaudible || TodoKind.transcriptionFailed =>
      '/dictees/$captureId/transcription${appointmentId == null ? '' : '?rdv=$appointmentId'}',
    TodoKind.transcribing => null,
    TodoKind.preparing || TodoKind.reportToValidate || TodoKind.readyToSend =>
      reportId == null ? null : '/comptes-rendus/$reportId',
  };

  TodoItem copyWith({TodoKind? kind}) => TodoItem(kind: kind ?? this.kind, captureId: captureId, updatedAt: updatedAt, reportId: reportId, appointmentId: appointmentId, patientName: patientName);
}
```

`http_todo_api.dart` : GET `/api/mobile/v1/todo`, mappe chaque `item` (`kind` via `todoKindFromApi`, `updatedAt` parsé).

`todo_cubit.dart` :

```dart
class TodoCubit extends Cubit<TodoState> {
  TodoCubit(this._store, this._api, {this.pollInterval = const Duration(seconds: 10), DateTime Function()? now})
      : _now = now ?? DateTime.now,
        super(const TodoState(items: []));

  static const preparingWindow = Duration(minutes: 2);

  List<LocalCapture> _local = const [];
  List<TodoItem> _remote = const [];
  StreamSubscription<List<LocalCapture>>? _subscription;
  Timer? _timer;

  void start() {
    _subscription = _store.watchAll().listen((rows) {
      _local = rows;
      _publish(state.offlineMessage);
    });
    unawaited(refresh());
  }

  Future<void> refresh() async {
    switch (await _api.list()) {
      case Success(:final value):
        _remote = value;
        _publish(null);
      case Err(:final failure):
        _publish(failure.message);
    }
    _timer?.cancel();
    // On ne réinterroge à intervalle court que si quelque chose est « en
    // cours » : sinon le retour au premier plan suffit.
    if (state.items.any((i) => i.kind == TodoKind.transcribing || i.kind == TodoKind.preparing)) {
      _timer = Timer(pollInterval, () => unawaited(refresh()));
    }
  }

  void _publish(String? offlineMessage) {
    final now = _now();
    final requestedAt = {for (final c in _local) if (c.extractionRequestedAt != null) c.id: c.extractionRequestedAt!};

    final local = _local
        .where((c) => c.status == LocalCaptureStatus.queued || c.status == LocalCaptureStatus.uploading || c.status == LocalCaptureStatus.needsAction)
        .map((c) => TodoItem(
              kind: c.status == LocalCaptureStatus.needsAction ? TodoKind.uploadBlocked : TodoKind.pendingUpload,
              captureId: c.id,
              appointmentId: c.appointmentId,
              updatedAt: c.createdAt,
            ));

    final remote = _remote.map((item) {
      final at = requestedAt[item.captureId];
      final preparing = item.kind == TodoKind.transcriptToReview && at != null && now.difference(at) < preparingWindow;
      return preparing ? item.copyWith(kind: TodoKind.preparing) : item;
    });

    emit(TodoState(items: [...local, ...remote], offlineMessage: offlineMessage));
  }

  @override
  Future<void> close() async {
    _timer?.cancel();
    await _subscription?.cancel();
    return super.close();
  }
}
```

`todo_section.dart` : `TodoSection` = titre « À traiter » + liste de `Card` (`ListTile(title: item.patientName ?? 'Capture libre', subtitle: item.label, trailing: item.route == null ? null : Icon(chevron), onTap: route == null ? null : () => context.push(route!))`). Pour `uploadBlocked`, `onTap` déclenche `refreshForeground()`. Vide → « Rien à traiter. » Bandeau `offlineMessage` en `warningSurface`.

- [ ] **Étape 4 : Test widget** : une ligne par élément, le sous-titre est le libellé, jamais un `kind.name`.

- [ ] **Étape 5 : Lancer, vérifier** — `cd apps/mobile && rtk flutter test && rtk flutter analyze`.

- [ ] **Étape 6 : Commit**

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): lister ce qui attend un geste, dictées locales comprises"
```

---

### Tâche 18 : Un seul accueil

**Fichiers :**
- Créer : `apps/mobile/lib/features/home/presentation/home_screen.dart`
- Modifier : `apps/mobile/lib/features/agenda/presentation/agenda_screen.dart` (extraire `AgendaBody`)
- Modifier : `apps/mobile/lib/config/app_router.dart`, `apps/mobile/lib/injection_container.dart`
- Test : `apps/mobile/test/features/home/home_screen_test.dart`

**Interfaces :**
- Consomme : `TodoSection`, `TodoCubit` (tâche 17), `AgendaCubit`.
- Produit : `HomeScreen` sur `/` ; `AgendaBody` (le contenu de l'ancien `_AgendaView` sans `Scaffold`, `AppBar` ni bouton flottant).

- [ ] **Étape 1 : Test qui échoue**

```dart
testWidgets('empile À traiter puis l\'agenda, avec Dicter seul en bas', (tester) async {
  await monter(tester);
  expect(find.text('À traiter'), findsOneWidget);
  expect(find.text('Vos séances'), findsOneWidget);
  expect(find.widgetWithText(FloatingActionButton, 'Dicter'), findsOneWidget);
  expect(find.byType(BottomNavigationBar), findsNothing);
});

testWidgets('le menu du compte propose de changer d\'entreprise et de se déconnecter', (tester) async {
  await monter(tester);
  await tester.tap(find.byTooltip('Compte'));
  await tester.pumpAndSettle();
  expect(find.text("Changer d'entreprise"), findsOneWidget);
  expect(find.text('Se déconnecter'), findsOneWidget);
});
```

- [ ] **Étape 2 : Lancer, vérifier l'échec.**

- [ ] **Étape 3 : Implémenter**

`agenda_screen.dart` : renommer `_AgendaView` en `AgendaBody` (public, sans `Scaffold`), qui rend la bannière hors ligne, le titre « Vos séances » et la liste. `AgendaScreen` est supprimé.

`home_screen.dart` :

```dart
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => TodoCubit(getIt<CaptureStore>(), getIt<TodoApi>())..start()),
        BlocProvider(create: (_) => AgendaCubit(getIt<AgendaRepository>())..load(DateTime.now())),
      ],
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Biume'),
          actions: [
            PopupMenuButton<String>(
              tooltip: 'Compte',
              icon: const Icon(Icons.account_circle_outlined),
              onSelected: (value) => switch (value) {
                'entreprise' => context.push('/entreprise'),
                _ => context.read<AuthCubit>().signOut(),
              },
              itemBuilder: (_) => const [
                PopupMenuItem(value: 'entreprise', child: Text("Changer d'entreprise")),
                PopupMenuItem(value: 'deconnexion', child: Text('Se déconnecter')),
              ],
            ),
          ],
        ),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: () => context.push('/dicter'),
          icon: const Icon(Icons.mic),
          label: const Text('Dicter'),
        ),
        body: SafeArea(
          child: ListView(
            padding: const EdgeInsets.only(bottom: 96),
            children: const [TodoSection(), AgendaBody()],
          ),
        ),
      ),
    );
  }
}
```

`AgendaBody` devient une liste **non défilante** (`shrinkWrap: true`, `physics: NeverScrollableScrollPhysics()`) puisqu'elle vit dans le `ListView` de l'accueil. Le garde `AuthAuthenticated` de `app_router.dart` qui redirige `/entreprise` vers `/` doit laisser passer une navigation volontaire : ne rediriger `/entreprise` que si `state.extra != 'volontaire'` ; `context.push('/entreprise', extra: 'volontaire')`.

Route : `GoRoute(path: '/', builder: (_, _) => const HomeScreen())`. DI : `registerLazySingleton<TodoApi>(() => HttpTodoApi(getIt()))`.

- [ ] **Étape 4 : Lancer, vérifier** — `cd apps/mobile && rtk flutter test && rtk flutter analyze`.

- [ ] **Étape 5 : Commit**

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): un seul accueil, à traiter puis l'agenda"
```

---

### Tâche 19 : Télémétrie du parcours

**Fichiers :**
- Modifier : `apps/mobile/lib/core/telemetry/telemetry.dart` (propriétés autorisées)
- Créer : `apps/mobile/lib/core/telemetry/journey_events.dart`
- Modifier : `apps/mobile/lib/injection_container.dart`, et les cubits `TranscriptCubit`, `ReportCubit`, `FollowUpScheduleCubit`, `RecordingPage.onSaved`
- Test : `apps/mobile/test/core/telemetry_test.dart` (ajout), `apps/mobile/test/core/journey_events_test.dart`

**Interfaces :**
- Produit :

```dart
abstract final class JourneyEvents {
  static const dictationSaved = 'mobile.dictation_saved';
  static const transcriptValidated = 'mobile.transcript_validated';
  static const extractionRequested = 'mobile.extraction_requested';
  static const reportFinalized = 'mobile.report_finalized';
  static const followUpScheduled = 'mobile.followup_scheduled';
  static const followUpDeclined = 'mobile.followup_declined';
}
```

`allowedTelemetryProperties` gagne `'reportId'`, `'sentToOwner'`, `'textChanged'`, `'kind'`. L'identifiant de parcours est **l'identifiant de capture** ; le suivi, qui ne connaît que le rapport, reçoit le `captureId` par la route (`/comptes-rendus/:reportId/suivi?capture=<id>`), passé par l'écran de compte rendu qui le tient de `ReportProposals.captureId` (tâches 1, 4 et 15). Sans identifiant de capture (rapport créé sur le web), `journeyId` vaut `reportId`.

- [ ] **Étape 1 : Tests qui échouent**

```dart
test('les six événements du parcours ont un nom préfixé mobile.', () {
  for (final name in JourneyEvents.all) {
    expect(name, startsWith('mobile.'));
  }
});

test('sentToOwner et reportId passent la liste blanche', () {
  ProductEvent? sent;
  Telemetry(sink: (e) => sent = e).emit(const ProductEvent(
    name: JourneyEvents.reportFinalized,
    journeyId: 'c-1',
    properties: {'reportId': 'r-1', 'sentToOwner': true, 'ownerEmail': 'x@y.z'},
  ));
  expect(sent!.properties.keys, unorderedEquals(['reportId', 'sentToOwner']));
});
```

- [ ] **Étape 2 : Lancer, vérifier l'échec.**

- [ ] **Étape 3 : Implémenter**

`journey_events.dart` avec la classe ci-dessus et `static const List<String> all = [...]`. Chaque cubit concerné reçoit un `Telemetry` optionnel (`this._telemetry = telemetry ?? Telemetry()`) et émet : `dictationSaved` dans `RecordingPage.onSaved` (`durationMs`, `byteSize`) ; `transcriptValidated` (`textChanged`) puis `extractionRequested` (`reportId`) dans `validate` ; `reportFinalized` (`reportId`, `sentToOwner`) ; `followUpScheduled` / `followUpDeclined` (`reportId`). DI : `registerLazySingleton(() => Telemetry(sink: kDebugMode ? (e) => debugPrint('[telemetry] ${e.name} ${e.journeyId} ${e.properties}') : null))`. Le transport PostHog est installé au lot C avec la mesure du délai de notification ; le puits est remplaçable par `installSink`.

- [ ] **Étape 4 : Lancer, vérifier** — `cd apps/mobile && rtk flutter test && rtk flutter analyze`.

- [ ] **Étape 5 : Commit**

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): tracer le parcours de la dictée au suivi sous un même identifiant"
```

---

### Tâche 20 : Vérification sur téléphone, chronométrage, distribution

**Fichiers :**
- Modifier : `docs/mobile/manual-test-matrix.md`
- Modifier : `docs/superpowers/specs/2026-09-03-mobile-v1-completion-design.md` (section 9)

- [ ] **Étape 1 : Serveur local et téléphone**

```bash
rtk bun --filter @biume/web dev
cd apps/mobile && rtk flutter run --dart-define-from-file=dart_define/local.json
```

Parcours à dérouler, chronomètre en main, sur une dictée réelle d'une minute :
1. RDV du jour → Dicter → valider la dictée → retour à l'accueil : « Dictée en attente d'envoi » puis disparition à l'envoi, puis « Biume transcrit votre dictée ».
2. Mode avion → Dicter (capture libre) → choisir un animal depuis le cache → valider → « Dictée en attente d'envoi » ; couper le mode avion → l'élément passe en « Biume transcrit » puis « Transcription à relire ».
3. Ouvrir la transcription, corriger un mot, « Valider la transcription » → écran compte rendu « Biume prépare » → propositions.
4. Confirmer / écarter jusqu'à « Prêt à envoyer » ; « Finaliser et partager » sur un propriétaire **sans** e-mail → feuille e-mail → « Enregistrer et envoyer » → e-mail reçu avec le lien `/r/<token>`.
5. Écran suivi → « Programmer le suivi » → retour accueil, l'élément a disparu.
6. Rejouer 4 avec « Finaliser sans envoyer » → statut finalisé, pas d'e-mail ; programmer le suivi doit réussir (le lien existe).
7. Tuer l'application pendant « Biume prépare » → relancer → l'élément est dans « À traiter » avec le bon libellé.

- [ ] **Étape 2 : Consigner** le temps actif de l'étape 3 à l'étape 4 (fin de dictée → brouillon prêt à relire) dans la section 9 de la spécification, et ajouter les sept scénarios à `docs/mobile/manual-test-matrix.md`.

- [ ] **Étape 3 : Build TestFlight**

```bash
cd apps/mobile && rtk flutter build ipa --dart-define=BIUME_API_URL=https://biume.app
```
Envoi manuel via Transporter, comme prévu par le design parent (7.12).

- [ ] **Étape 4 : Commit**

```bash
rtk git add docs/
rtk git commit -m "docs(mobile): matrice de test du parcours signature et temps actif mesuré"
```

---

## Critères d'acceptation du plan

- `cd apps/web && rtk bun run test && rtk bun run check-types` vert, `openapi.json` à jour.
- `cd apps/mobile && rtk flutter test && rtk flutter analyze` vert.
- Une dictée réelle traverse : file → transcription → correction → extraction → validation → finalisation → e-mail reçu → suivi programmé, sans ouvrir le web.
- Une capture libre faite en mode avion, rattachée hors ligne, aboutit au même résultat une fois le réseau revenu.
- Aucun écran n'affiche un nom d'état serveur (`proposed`, `ready`, `to_attach`…).
- Le temps actif du parcours est consigné dans la spécification.
