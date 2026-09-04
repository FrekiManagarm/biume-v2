# Mobile lot B — Agenda et fiches — Plan d'implémentation

> **Pour les agents d'exécution :** SOUS-COMPÉTENCE REQUISE : utiliser `superpowers:subagent-driven-development` (recommandé) ou `superpowers:executing-plans` pour exécuter ce plan tâche par tâche. Les étapes utilisent la syntaxe à cases (`- [ ]`) pour le suivi.

**Objectif :** Qu'un praticien voie ses huit prochains jours, prenne et déplace une séance depuis le terrain, crée un nouveau client en trente secondes et retrouve, avant la séance, ce qu'il a fait la dernière fois pour cet animal.

**Architecture :** Un endpoint serveur nouveau (créer une séance, avec avertissement de conflit dans la réponse) et une extension du déplacement existant (même avertissement). Côté Flutter, l'agenda passe d'un jour à une fenêtre de huit jours mise en cache ; trois écrans nouveaux (nouvelle séance, nouveau client, fiche animal) et deux dépôts (`AppointmentWriteRepository`, `OwnerRepository`) s'ajoutent sans toucher aux features du lot A, sauf le sélecteur d'animal qui gagne « Nouveau client » et l'écran compte rendu qui sait déjà se verrouiller.

**Pile technique :** identique au lot A.

**Spécification :** `docs/superpowers/specs/2026-09-03-mobile-v1-completion-design.md` (sections 5.7 à 5.10, 7).

**Dépend de :** lot A terminé (`docs/superpowers/plans/2026-09-03-mobile-lot-a-parcours-signature.md`) : sélecteur d'animal, cache des animaux, `refreshForeground`, accueil unique, compte rendu en lecture seule.

## Contraintes globales

- Celles du lot A, intégralement.
- Création de séance, de propriétaire et d'animal **en ligne uniquement**. Hors ligne, l'écran le dit et propose de dicter d'abord.
- Le conflit d'horaire est un **avertissement contournable**, jamais un blocage. Le serveur écrit, puis signale.
- `checkAppointmentConflicts` n'existe pas sous ce nom : le prédicat partagé est `findAppointmentConflicts` (`apps/web/src/lib/dashboard/appointment-conflicts.ts:25`), déjà utilisé par le déplacement mobile. La création l'utilise à l'identique.
- Le cache hors ligne couvre **huit jours** d'agenda (aujourd'hui + 7), les fiches et le dernier compte rendu finalisé des animaux concernés. Rien d'autre n'est mis en cache.
- L'e-mail du propriétaire est **demandé avec insistance, jamais exigé**.

---

## Structure des fichiers

```
packages/contracts/src/mobile-records.ts        (modifier) createAppointmentRequestSchema, appointmentWriteResponseSchema
apps/web/src/server/mobile/mobile-api.routes.ts  (modifier) createAppointmentRoute
apps/web/src/server/mobile/mobile-api.ts         (modifier) port createAppointment
apps/web/src/server/mobile/mobile-api.ports.ts   (modifier) createAppointment, moveAppointment factorisé
apps/web/src/server/mobile/appointment-write.service.ts (créer) règles pures : créneau, durée par défaut
apps/web/src/server/mobile/appointment-write.service.test.ts (créer)
apps/web/src/server/mobile/mobile-api.appointments.test.ts (créer)
apps/web/openapi.json                            (régénérer)

apps/mobile/lib/
  core/database/app_database.dart                (modifier) CachedAppointments.atHome, CachedPatients.birthDate/lastAppointmentAt, CachedReports, schéma v3
  features/agenda/domain/agenda_repository.dart  (modifier) watchWindow, refreshWindow
  features/agenda/data/agenda_repository_impl.dart (modifier)
  features/agenda/presentation/agenda_cubit.dart (modifier) fenêtre de huit jours, groupée par jour
  features/agenda/presentation/agenda_screen.dart (modifier) AgendaBody groupé, sélecteur de date
  features/agenda/domain/appointment_write_repository.dart (créer)
  features/agenda/data/http_appointment_write_repository.dart (créer)
  features/agenda/presentation/appointment_form_cubit.dart (créer)
  features/agenda/presentation/appointment_form_screen.dart (créer) création et déplacement
  features/records/domain/owner_repository.dart  (créer)
  features/records/data/http_owner_repository.dart (créer)
  features/records/presentation/new_client_cubit.dart (créer)
  features/records/presentation/new_client_screen.dart (créer) propriétaire puis animal
  features/records/presentation/patient_picker_screen.dart (modifier) bouton « Nouveau client »
  features/records/domain/patient_history.dart   (créer)
  features/records/data/patient_repository_impl.dart (modifier) history, cache des fiches
  features/records/presentation/patient_sheet_cubit.dart (créer)
  features/records/presentation/patient_sheet_screen.dart (créer) fiche animal lecture seule
  features/report/data/http_report_repository.dart (modifier) cache du dernier compte rendu finalisé
  features/home/presentation/home_screen.dart    (modifier) menu « + »
  core/lifecycle/foreground_refresh.dart         (modifier) fenêtre de huit jours + fiches
  config/app_router.dart                         (modifier) routes
  injection_container.dart                       (modifier)
apps/mobile/test/                                 miroirs
docs/mobile/manual-test-matrix.md                (modifier)
```

---

## Partie 1 — Serveur

### Tâche 1 : Contrat et règles pures de création de séance

**Fichiers :**
- Modifier : `packages/contracts/src/mobile-records.ts`
- Créer : `apps/web/src/server/mobile/appointment-write.service.ts`
- Test : `packages/contracts/src/mobile-records.test.ts` (ajout), `apps/web/src/server/mobile/appointment-write.service.test.ts`

**Interfaces :**
- Produit :

```ts
// contrats
export const createAppointmentRequestSchema = z.object({
  patientId: z.string().min(1),
  beginAt: isoDateTimeSchema,
  endAt: isoDateTimeSchema,
  atHome: z.boolean(),
}).strict().refine(fin > début);
export const appointmentWriteResponseSchema = z.object({
  appointmentId: z.string().min(1),
  reportId: z.string().min(1).nullable(),
  beginAt: isoDateTimeSchema,
  endAt: isoDateTimeSchema,
  conflicts: z.array(z.object({ appointmentId, beginAt, patientName: z.string().nullable() }).strict()),
}).strict();
// service pur
export function defaultDurationMs(lastAppointment: { beginAt: Date; endAt: Date } | null): number; // dernière durée, sinon 3 600 000
export function dayBounds(at: Date): { dayStart: Date; dayEnd: Date };
```

`moveAppointmentResponseSchema` existant est remplacé par `appointmentWriteResponseSchema` (mêmes champs plus `reportId`). Le déplacement renvoie l'identifiant du brouillon lié s'il existe, lu par `advancedReport.appointmentId`. Un seul schéma de réponse pour les deux écritures.

- [ ] **Étape 1 : Tests qui échouent**

```ts
// appointment-write.service.test.ts
describe("durée par défaut", () => {
  it("reprend la durée de la dernière séance", () => {
    expect(defaultDurationMs({ beginAt: new Date("2026-09-01T10:00:00Z"), endAt: new Date("2026-09-01T10:45:00Z") })).toBe(45 * 60 * 1000);
  });
  it("vaut une heure sans historique", () => {
    expect(defaultDurationMs(null)).toBe(60 * 60 * 1000);
  });
});
describe("bornes du jour", () => {
  it("encadre la journée locale du créneau", () => {
    const { dayStart, dayEnd } = dayBounds(new Date("2026-09-03T14:30:00Z"));
    expect(dayEnd.getTime()).toBeGreaterThan(dayStart.getTime());
    expect(dayEnd.getTime() - dayStart.getTime()).toBeLessThan(25 * 60 * 60 * 1000);
  });
});
```

Contrat : un `endAt` antérieur à `beginAt` est refusé ; `atHome` est obligatoire.

- [ ] **Étape 2 : Lancer, vérifier l'échec** — `cd packages/contracts && rtk bun run test` ; `cd apps/web && rtk bun run test -- src/server/mobile/appointment-write.service.test.ts`.

- [ ] **Étape 3 : Implémenter** les schémas ci-dessus dans `mobile-records.ts` (le `refine` copie celui de `moveAppointmentRequestSchema:122-125`) et le service :

```ts
export const defaultAppointmentDurationMs = 60 * 60 * 1000;

/** La durée de la dernière séance du praticien : ce qu'il fait d'habitude. */
export function defaultDurationMs(last: { beginAt: Date; endAt: Date } | null): number {
  if (!last) return defaultAppointmentDurationMs;
  const duration = last.endAt.getTime() - last.beginAt.getTime();
  return duration > 0 ? duration : defaultAppointmentDurationMs;
}

export function dayBounds(at: Date): { dayStart: Date; dayEnd: Date } {
  const dayStart = new Date(at);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(at);
  dayEnd.setHours(23, 59, 59, 999);
  return { dayStart, dayEnd };
}
```

- [ ] **Étape 4 : Lancer, vérifier le succès.**

- [ ] **Étape 5 : Commit**

```bash
rtk git add packages/contracts/ apps/web/src/server/mobile/appointment-write.service.ts apps/web/src/server/mobile/appointment-write.service.test.ts
rtk git commit -m "chore(contracts): créer une séance depuis le terrain, réponse d'écriture commune"
```

---

### Tâche 2 : Créer une séance, avertir des conflits

**Fichiers :**
- Modifier : `apps/web/src/server/mobile/mobile-api.routes.ts`, `mobile-api.ts`, `mobile-api.ports.ts:686-757`
- Test : `apps/web/src/server/mobile/mobile-api.appointments.test.ts` (créer, en déplaçant les cas de `mobile-api.move.test.ts`)

**Interfaces :**
- Produit : port `createAppointment(actor, request: CreateAppointmentRequest): Promise<AppointmentWriteResponse>` ; route `POST /appointments` (201) ; `moveAppointment` renvoie `AppointmentWriteResponse`.

- [ ] **Étape 1 : Tests handler qui échouent** (gabarit des tests du lot A) : POST `/appointments` valide → 201 validé par `appointmentWriteResponseSchema` ; `endAt < beginAt` → 400 ; port levant `not_found` (animal inconnu) → 404. Le cas existant de déplacement vérifie désormais la présence de `reportId` dans la réponse.

- [ ] **Étape 2 : Lancer, vérifier l'échec.**

- [ ] **Étape 3 : Implémenter**

Route :

```ts
export const createAppointmentRoute = createRoute({
  method: "post",
  path: "/appointments",
  security,
  summary: "Créer une séance depuis le terrain, avec avertissement de conflit",
  request: { body: { content: json(createAppointmentRequestSchema) } },
  responses: {
    201: { description: "Séance créée", content: json(appointmentWriteResponseSchema) },
    ...errorResponses,
  },
});
```

Handler : `validated(c, 201, appointmentWriteResponseSchema, await ports.createAppointment(c.get("actor"), c.req.valid("json")))`. Le handler du déplacement valide sur `appointmentWriteResponseSchema`.

Ports : extraire de `moveAppointment` un helper de module `conflictsOn(actor, beginAt, endAt, excludeAppointmentId?)` qui lit les candidats du jour (`dayBounds`) et appelle `findAppointmentConflicts`, et un helper `linkedReportId(reportScope)` qui lit `advancedReport.id where appointmentId = ? and createdBy = org`. Puis :

```ts
    async createAppointment(actor, request) {
      const beginAt = new Date(request.beginAt);
      const endAt = new Date(request.endAt);

      const [patient] = await db
        .select({ id: pets.id })
        .from(pets)
        .where(and(eq(pets.id, request.patientId), eq(pets.organizationId, actor.organizationId)))
        .limit(1);
      if (!patient) throw new MobileRequestError("not_found");

      const appointmentId = crypto.randomUUID();
      const reportId = crypto.randomUUID();
      const now = new Date();

      // Le brouillon naît avec la séance, comme sur le web (`withReport: true`) :
      // c'est lui que la dictée du RDV alimentera.
      await db.insert(appointments).values({
        id: appointmentId,
        organizationId: actor.organizationId,
        patientId: patient.id,
        beginAt,
        endAt,
        atHome: request.atHome,
        status: "CREATED",
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(advancedReport).values({
        id: reportId,
        title: `Séance du ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" }).format(beginAt)}`,
        consultationReason: "",
        patientId: patient.id,
        appointmentId,
        notes: "",
        status: "draft",
        createdBy: actor.organizationId,
        createdAt: now,
      });
      await db.insert(reportSectionState).values(
        buildReportSectionStateRows(reportId, createInitialReportSectionStates()),
      );

      const conflicts = await conflictsOn(actor, beginAt, endAt, appointmentId);
      return {
        appointmentId,
        reportId,
        beginAt: beginAt.toISOString(),
        endAt: endAt.toISOString(),
        conflicts: conflicts.map((c) => ({
          appointmentId: c.id,
          beginAt: new Date(c.beginAt).toISOString(),
          patientName: c.patientName,
        })),
      };
    },
```

Colonnes vérifiées dans `packages/db/src/schema/appointments.ts` : `id`, `patientId`, `beginAt`, `endAt`, `organizationId`, `atHome` (booléen, défaut `false`), `status` (défaut `CREATED`), `note`, `createdAt`, `updatedAt`. L'insertion ci-dessus les respecte.

- [ ] **Étape 4 : Régénérer et vérifier**

```bash
rtk bun --filter @biume/web emit-openapi
cd apps/web && rtk bun run test && rtk bun run check-types
```

- [ ] **Étape 5 : Commit**

```bash
rtk git add apps/web/
rtk git commit -m "feat(web): créer une séance depuis le mobile et signaler les chevauchements"
```

---

## Partie 2 — Flutter

### Tâche 3 : Agenda sur huit jours, cache étendu

**Fichiers :**
- Modifier : `apps/mobile/lib/core/database/app_database.dart` (schéma v3 : `CachedAppointments.atHome` bool, `CachedPatients.birthDate` nullable, `lastAppointmentAt` nullable ; table `CachedReports {reportId, patientId, appointmentId?, status, payload (json texte), cachedAt}`)
- Modifier : `agenda_repository.dart`, `agenda_repository_impl.dart`, `agenda_cubit.dart`, `agenda_screen.dart`, `foreground_refresh.dart`
- Test : `test/features/agenda/agenda_cubit_test.dart`, `agenda_repository_test.dart`, `test/core/app_database_test.dart`

**Interfaces :**
- Produit :

```dart
abstract class AgendaRepository {
  Stream<List<Appointment>> watchWindow(DateTime from, DateTime to);
  Future<Result<void>> refreshWindow(DateTime from, DateTime to);   // suit nextCursor
  Future<Result<List<Appointment>>> fetchDay(DateTime day);           // hors cache, pour le sélecteur de date
}
class AgendaLoaded { final List<AgendaDay> days; final String? offlineMessage; }
class AgendaDay { final DateTime day; final List<Appointment> appointments; }
AgendaCubit.load(DateTime today)   // fenêtre today..today+7
Future<void> AgendaCubit.showDay(DateTime day)  // hors fenêtre : fetchDay, état AgendaDayLoaded(day, appointments)
```

- [ ] **Étape 1 : Tests qui échouent**

```dart
blocTest<AgendaCubit, AgendaState>(
  'groupe huit jours, aujourd\'hui en tête, jours vides compris',
  setUp: () {
    when(() => repository.watchWindow(any(), any())).thenAnswer((_) => Stream.value([rdv(DateTime(2026, 9, 5, 10))]));
    when(() => repository.refreshWindow(any(), any())).thenAnswer((_) async => const Success(null));
  },
  build: () => AgendaCubit(repository, now: () => DateTime(2026, 9, 3, 8)),
  act: (cubit) => cubit.load(DateTime(2026, 9, 3)),
  verify: (cubit) {
    final state = cubit.state as AgendaLoaded;
    expect(state.days, hasLength(8));
    expect(state.days.first.day, DateTime(2026, 9, 3));
    expect(state.days[2].appointments, hasLength(1));
  },
);

blocTest<AgendaCubit, AgendaState>(
  'un jour hors fenêtre est lu sans cache et dit hors ligne s\'il échoue',
  setUp: () {
    when(() => repository.fetchDay(any())).thenAnswer((_) async => const Err(NetworkFailure()));
  },
  build: () => AgendaCubit(repository, now: () => DateTime(2026, 9, 3, 8)),
  act: (cubit) => cubit.showDay(DateTime(2026, 10, 1)),
  verify: (cubit) => expect((cubit.state as AgendaDayUnavailable).message, 'Connexion indisponible.'),
);
```

Dépôt : `refreshWindow` remplace **toute la fenêtre** dans une transaction et suit `nextCursor` (pages de 50 : `mobileAppointmentsPageSize`) ; un échec réseau ne touche pas le cache.

- [ ] **Étape 2 : Lancer, vérifier l'échec.**

- [ ] **Étape 3 : Implémenter**

`watchAppointmentsBetween(from, to)` dans `AppDatabase` (même requête que `watchAppointmentsOn` avec les deux bornes). `refreshWindow` : boucle `GET /api/mobile/v1/appointments?from&to&limit=50&cursor` ; suppression de la fenêtre puis insertion. `fetchDay` : même GET sans écriture, mappé en `Appointment`. Le cubit construit `days` : pour `i` de 0 à 7, `AgendaDay(day: today+i, appointments: ceux dont `beginAt.toLocal()` tombe ce jour)`.

`AgendaBody` : une section par jour avec un en-tête `DateFormat('EEEE d MMMM', 'fr_FR')` (« Aujourd'hui » et « Demain » pour les deux premiers), « Aucune séance » sous un jour vide, les cartes existantes sinon. En bas : `TextButton.icon(Icons.calendar_month, 'Une autre date')` → `showDatePicker` → `showDay`. `AgendaDayLoaded` s'affiche dans une feuille modale listant les séances du jour choisi ; `AgendaDayUnavailable` affiche le message.

`refreshForeground` appelle `refreshWindow(today, today+7)` en plus de la file et des animaux.

Migration drift v3 : `addColumn` pour les trois colonnes, `createTable(cachedReports)`.

- [ ] **Étape 4 : Lancer, vérifier** — `cd apps/mobile && rtk dart run build_runner build --delete-conflicting-outputs && rtk flutter test && rtk flutter analyze`.

- [ ] **Étape 5 : Commit**

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): agenda d'aujourd'hui et des sept prochains jours, en cache"
```

---

### Tâche 4 : Créer et déplacer une séance

**Fichiers :**
- Créer : `features/agenda/domain/appointment_write_repository.dart`, `features/agenda/data/http_appointment_write_repository.dart`, `features/agenda/presentation/appointment_form_cubit.dart`, `appointment_form_screen.dart`
- Modifier : `app_router.dart`, `injection_container.dart`, `agenda_screen.dart` (geste « Déplacer » sur une carte), `home_screen.dart` (menu « + » avec « Nouvelle séance »)
- Test : `test/features/agenda/appointment_form_cubit_test.dart`, `appointment_form_screen_test.dart`

**Interfaces :**
- Produit :

```dart
class AppointmentConflict { final String appointmentId; final DateTime beginAt; final String? patientName; String get sentence; }
class AppointmentWriteOutcome { final String appointmentId; final String? reportId; final List<AppointmentConflict> conflicts; }
abstract class AppointmentWriteRepository {
  Future<Result<AppointmentWriteOutcome>> create({required String patientId, required DateTime beginAt, required DateTime endAt, required bool atHome});
  Future<Result<AppointmentWriteOutcome>> move(String appointmentId, {required DateTime beginAt, required DateTime endAt});
  Future<Duration> defaultDuration();   // dernière séance du cache, sinon 1 h
}
AppointmentFormCubit(repository, {Appointment? existing, Patient? initialPatient, required DateTime Function() now})
class AppointmentFormState { Patient? patient; DateTime day; TimeOfDay start; Duration duration; bool atHome; bool busy; String? message; AppointmentWriteOutcome? saved; }
choosePatient / chooseDay / chooseStart / chooseDuration / toggleAtHome / submit()
```

Routes : `/seances/nouvelle?animal=<id>` et `/seances/:appointmentId/deplacer`.

- [ ] **Étape 1 : Tests qui échouent**

```dart
blocTest<AppointmentFormCubit, AppointmentFormState>(
  'prend la durée de la dernière séance par défaut',
  setUp: () => when(() => repository.defaultDuration()).thenAnswer((_) async => const Duration(minutes: 45)),
  build: () => AppointmentFormCubit(repository, now: () => DateTime(2026, 9, 3, 9)),
  act: (cubit) => cubit.start(),
  verify: (cubit) => expect(cubit.state.duration, const Duration(minutes: 45)),
);

blocTest<AppointmentFormCubit, AppointmentFormState>(
  'crée la séance et remonte les conflits sans échouer',
  setUp: () {
    when(() => repository.defaultDuration()).thenAnswer((_) async => const Duration(hours: 1));
    when(() => repository.create(patientId: 'pet-1', beginAt: any(named: 'beginAt'), endAt: any(named: 'endAt'), atHome: true))
        .thenAnswer((_) async => Success(AppointmentWriteOutcome(appointmentId: 'a-1', reportId: 'r-1', conflicts: [conflit('Rex', DateTime(2026, 9, 4, 14))])));
  },
  build: () => AppointmentFormCubit(repository, initialPatient: filou, now: () => DateTime(2026, 9, 3, 9)),
  act: (cubit) async {
    await cubit.start();
    cubit.chooseDay(DateTime(2026, 9, 4));
    cubit.chooseStart(const TimeOfDay(hour: 14, minute: 30));
    cubit.toggleAtHome(true);
    await cubit.submit();
  },
  verify: (cubit) {
    expect(cubit.state.saved!.conflicts.single.sentence, 'Chevauche la séance de Rex à 14:00.');
  },
);

blocTest<AppointmentFormCubit, AppointmentFormState>(
  'refuse de soumettre sans animal',
  setUp: () => when(() => repository.defaultDuration()).thenAnswer((_) async => const Duration(hours: 1)),
  build: () => AppointmentFormCubit(repository, now: () => DateTime(2026, 9, 3, 9)),
  act: (cubit) async { await cubit.start(); await cubit.submit(); },
  verify: (cubit) {
    expect(cubit.state.message, 'Choisissez un animal.');
    verifyNever(() => repository.create(patientId: any(named: 'patientId'), beginAt: any(named: 'beginAt'), endAt: any(named: 'endAt'), atHome: any(named: 'atHome')));
  },
);
```

- [ ] **Étape 2 : Lancer, vérifier l'échec.**

- [ ] **Étape 3 : Implémenter**

Dépôt HTTP : `create` → POST `/api/mobile/v1/appointments` ; `move` → POST `/api/mobile/v1/appointments/$id/move` ; `defaultDuration` → lecture drift de la dernière `CachedAppointment` par `beginAt` décroissant (`endAt - beginAt`), sinon une heure. `AppointmentConflict.sentence` : `'Chevauche la séance de ${patientName ?? 'un animal'} à ${DateFormat.Hm('fr_FR').format(beginAt.toLocal())}.'`.

Cubit : `submit()` vérifie `patient != null` (message « Choisissez un animal. ») ; `beginAt = day + start`, `endAt = beginAt + duration` ; en création appelle `create`, en déplacement `move` (durée conservée : `existing.endAt - existing.beginAt`). Sur `Success`, `saved` est renseigné ; l'écran affiche les conflits **après** l'écriture, dans une bannière `warningSurface` (« Chevauche la séance de Rex à 14:00. La séance est prise quand même. »), puis « Terminé » → `context.pop()`. L'agenda se rafraîchit via `refreshForeground()`.

Écran : champ « Animal » (`context.push<Patient>('/animaux/choisir')`, prérempli par `?animal=` ou en déplacement, masqué en déplacement), `showDatePicker`, `showTimePicker`, durée par `SegmentedButton` 30 / 45 / 60 / 90 min (valeur par défaut = celle du cubit), `SwitchListTile('À domicile')` (masqué en déplacement), `FilledButton('Prendre la séance')` ou `('Déplacer la séance')`. Hors ligne (échec `NetworkFailure`) : « Sans réseau, la séance ne peut pas être créée. Vous pouvez dicter dès maintenant et rattacher ensuite. » avec un bouton « Dicter ».

Carte d'agenda : un `PopupMenuButton` « Déplacer » → `/seances/:id/deplacer`. Menu « + » de l'accueil (`PopupMenuButton` icône `add`, tooltip « Ajouter ») : « Nouvelle séance » → `/seances/nouvelle`, « Nouveau client » → `/clients/nouveau` (tâche 5).

- [ ] **Étape 4 : Lancer, vérifier** — `cd apps/mobile && rtk flutter test && rtk flutter analyze`.

- [ ] **Étape 5 : Commit**

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): prendre et déplacer une séance, conflits en avertissement"
```

---

### Tâche 5 : Nouveau client, propriétaire puis animal

**Fichiers :**
- Créer : `features/records/domain/owner_repository.dart`, `features/records/data/http_owner_repository.dart`, `features/records/presentation/new_client_cubit.dart`, `new_client_screen.dart`
- Modifier : `patient_picker_screen.dart` (bouton « Nouveau client » et « Ajouter un animal à ce propriétaire »), `app_router.dart`, `injection_container.dart`
- Test : `test/features/records/new_client_cubit_test.dart`, `new_client_screen_test.dart`

**Interfaces :**
- Produit :

```dart
class Owner { final String id; final String name; final String? email; final String? phone; final String? city; }
abstract class OwnerRepository {
  Future<Result<Owner>> create({required String name, String? email, String? phone, String? city});
  Future<Result<Patient>> createPatient({required String ownerId, required String name, required String species, String? breed, DateTime? birthDate});
}
NewClientCubit(OwnerRepository owners, PatientRepository patients, {String? existingOwnerId})
class NewClientState { NewClientStep step (owner|patient|done); Owner? owner; Patient? patient; bool busy; String? message; }
Future<void> submitOwner({required String name, String? email, String? phone, String? city});
Future<void> submitPatient({required String name, required String species, String? breed, DateTime? birthDate});
```

Route : `/clients/nouveau?proprietaire=<id>` ; l'écran **retourne** le `Patient` créé via `context.pop(patient)` pour que le sélecteur le sélectionne.

- [ ] **Étape 1 : Tests qui échouent**

```dart
blocTest<NewClientCubit, NewClientState>(
  'crée le propriétaire puis l\'animal, et rafraîchit le cache',
  setUp: () {
    when(() => owners.create(name: 'Camille Roux', email: null, phone: null, city: null)).thenAnswer((_) async => Success(camille));
    when(() => owners.createPatient(ownerId: 'owner-1', name: 'Filou', species: 'DOG', breed: null, birthDate: null)).thenAnswer((_) async => Success(filou));
    when(() => patients.refresh()).thenAnswer((_) async => const Success(null));
  },
  build: () => NewClientCubit(owners, patients),
  act: (cubit) async {
    await cubit.submitOwner(name: 'Camille Roux');
    await cubit.submitPatient(name: 'Filou', species: 'DOG');
  },
  verify: (cubit) {
    expect(cubit.state.step, NewClientStep.done);
    expect(cubit.state.patient, filou);
    verify(() => patients.refresh()).called(1);
  },
);

blocTest<NewClientCubit, NewClientState>(
  'saute le volet propriétaire quand il existe déjà',
  build: () => NewClientCubit(owners, patients, existingOwnerId: 'owner-1'),
  verify: (cubit) => expect(cubit.state.step, NewClientStep.patient),
);

blocTest<NewClientCubit, NewClientState>(
  'un nom vide ne part jamais',
  build: () => NewClientCubit(owners, patients),
  act: (cubit) => cubit.submitOwner(name: '   '),
  verify: (cubit) {
    expect(cubit.state.message, 'Le nom est obligatoire.');
    verifyNever(() => owners.create(name: any(named: 'name'), email: any(named: 'email'), phone: any(named: 'phone'), city: any(named: 'city')));
  },
);
```

Widget : le volet propriétaire montre le champ e-mail **avec** la mention « Sans e-mail, vous ne pourrez pas lui envoyer le compte rendu depuis l'application. » ; on peut passer au volet animal sans e-mail ; le volet animal offre les sept espèces (`speciesLabels`, tâche 12 du lot A).

- [ ] **Étape 2 : Lancer, vérifier l'échec.**

- [ ] **Étape 3 : Implémenter**

Dépôt HTTP : POST `/api/mobile/v1/owners` `{name, email?, phone?, city?}` (omettre les clés nulles : le contrat est `strict` et `optional`, pas `nullable`) ; POST `/api/mobile/v1/patients` `{ownerId, name, species, breed?, birthDate?}` (`birthDate` en ISO UTC). Mapper `MobilePatient` → `Patient` (`species` est le code).

Cubit : `submitOwner` refuse un nom vide après `trim` ; sur succès, `step = patient`. `submitPatient` refuse un nom vide ; sur succès, `patients.refresh()` (pour que le sélecteur et le cache hors ligne connaissent l'animal), puis `step = done`.

Écran : `PageView` non défilable à deux volets, `Stepper`-like en tête (« 1. Propriétaire  2. Animal »). Volet 1 : nom (obligatoire), e-mail avec la mention insistante sous le champ, téléphone, ville, `FilledButton('Continuer')`. Volet 2 : nom, `DropdownButtonFormField` espèce (défaut `DOG`), race, date de naissance (`showDatePicker`), `FilledButton('Créer')`. Sur `done` : `context.pop(state.patient)`. Hors ligne : bannière « Sans réseau, la fiche ne peut pas être créée. Dictez dès maintenant, vous rattacherez l'animal plus tard. »

Sélecteur d'animal (`patient_picker_screen.dart`) : bouton en bas `OutlinedButton.icon(Icons.person_add, 'Nouveau client')` → `final created = await context.push<Patient>('/clients/nouveau'); if (created != null) context.pop(created);`. Sur une ligne, un appui long propose « Ajouter un animal à {ownerName} » → `/clients/nouveau?proprietaire=${patient.ownerId}`.

- [ ] **Étape 4 : Lancer, vérifier** — `cd apps/mobile && rtk flutter test && rtk flutter analyze`.

- [ ] **Étape 5 : Commit**

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): créer un nouveau client, propriétaire puis animal, e-mail insistant"
```

---

### Tâche 6 : Fiche animal orientée « avant la séance »

**Fichiers :**
- Créer : `features/records/domain/patient_history.dart`, `features/records/presentation/patient_sheet_cubit.dart`, `patient_sheet_screen.dart`
- Modifier : `patient_repository.dart` / `patient_repository_impl.dart` (`history`, `byId`, cache des fiches), `http_report_repository.dart` (cache `CachedReports` du dernier compte rendu finalisé), `foreground_refresh.dart`, `agenda_screen.dart` (la carte ouvre la fiche), `patient_picker_screen.dart` (icône info), `app_router.dart`, `pubspec.yaml` (`url_launcher`)
- Test : `test/features/records/patient_sheet_cubit_test.dart`, `patient_sheet_screen_test.dart`, `test/features/records/patient_repository_test.dart` (ajout)

**Interfaces :**
- Produit :

```dart
class PatientHistoryEntry { final String appointmentId; final DateTime beginAt; final String? reportId; final ReportStatus? reportStatus; final String consultationReason; }
class PatientSheet { final Patient patient; final Owner owner; final int? ageYears; final List<PatientHistoryEntry> history; }
// PatientRepository
Future<Patient?> byId(String id);                                    // cache
Future<Result<List<PatientHistoryEntry>>> history(String patientId); // GET /patients/{id}/history, première page
Future<Result<void>> refreshSheetsFor(Iterable<String> patientIds); // fiches + propriétaires + dernier compte rendu finalisé
// ReportRepository
Future<Result<ReportProposals>> loadCachedOrRemote(String reportId);
```

Routes : `/animaux/:patientId` ; le compte rendu passé s'ouvre sur `/comptes-rendus/:reportId` existant, qui se verrouille tout seul (`isReadOnly`).

- [ ] **Étape 1 : Tests qui échouent**

```dart
blocTest<PatientSheetCubit, PatientSheetState>(
  'affiche la fiche depuis le cache puis l\'historique du serveur',
  setUp: () {
    when(() => patients.byId('pet-1')).thenAnswer((_) async => filou);
    when(() => owners.byId('owner-1')).thenAnswer((_) async => camille);
    when(() => patients.history('pet-1')).thenAnswer((_) async => Success([entree(reportStatus: ReportStatus.sent)]));
  },
  build: () => PatientSheetCubit(patients, owners, now: () => DateTime(2026, 9, 3)),
  act: (cubit) => cubit.load('pet-1'),
  expect: () => [
    isA<PatientSheetLoaded>().having((s) => s.sheet.history, 'historique', isEmpty),
    isA<PatientSheetLoaded>().having((s) => s.sheet.history, 'historique', hasLength(1)),
  ],
);

blocTest<PatientSheetCubit, PatientSheetState>(
  'calcule l\'âge en années révolues',
  setUp: () {
    when(() => patients.byId('pet-1')).thenAnswer((_) async => filou.copyWith(birthDate: DateTime(2020, 10, 1)));
    when(() => owners.byId('owner-1')).thenAnswer((_) async => camille);
    when(() => patients.history('pet-1')).thenAnswer((_) async => const Success([]));
  },
  build: () => PatientSheetCubit(patients, owners, now: () => DateTime(2026, 9, 3)),
  act: (cubit) => cubit.load('pet-1'),
  verify: (cubit) => expect((cubit.state as PatientSheetLoaded).sheet.ageYears, 5),
);
```

Widget : le propriétaire a deux boutons « Appeler » (`tel:`) et « Écrire » (`mailto:`), désactivés sans numéro ou sans e-mail ; une séance passée dont `reportStatus` est `sent` ou `finalized` est un `ListTile` avec chevron ; une séance sans compte rendu finalisé n'a pas de chevron ; aucun `TextField` sur l'écran.

- [ ] **Étape 2 : Lancer, vérifier l'échec.**

- [ ] **Étape 3 : Implémenter**

`pubspec.yaml` : `url_launcher: ^6.3.1`. `Patient` gagne `birthDate` (colonne ajoutée en tâche 3) et `copyWith`. `OwnerRepository.byId` lit `CachedOwners`.

`refreshSheetsFor(ids)` : pour chaque animal des huit jours d'agenda, GET `/api/mobile/v1/patients?limit=50` est déjà couvert par `refresh()` ; les propriétaires viennent de `GET /api/mobile/v1/owners?limit=50` (boucle sur `nextCursor`, écrit `CachedOwners`) ; pour chaque animal, `history` puis, pour la **dernière** entrée finalisée, `GET /reports/{id}/proposals` écrit dans `CachedReports` (`payload` = JSON brut de la réponse). `refreshForeground` appelle `refreshSheetsFor` avec les `patientId` de la fenêtre après `refreshWindow`.

`HttpReportRepository.loadCachedOrRemote` : tente le réseau ; sur `NetworkFailure`, lit `CachedReports` et parse `payload` ; sinon propage l'échec. `ReportPage` utilise `loadCachedOrRemote` quand l'appel vient de la fiche animal (paramètre `?source=fiche`).

Cubit : `load(id)` émet la fiche (cache) avec `history: []`, puis l'historique du serveur ; sur échec réseau, garde la fiche et pose `offlineMessage`. `ageYears` : années révolues entre `birthDate` et `now()`, `null` sans date.

Écran : en-tête nom + `speciesLabels[species]` + race + « 5 ans » ; carte propriétaire (nom, ville, boutons Appeler / Écrire via `launchUrl`) ; « Dernières séances » : `ListTile(title: date, subtitle: consultationReason vide → 'Sans motif', trailing: chevron si rapport finalisé, onTap → '/comptes-rendus/$reportId?source=fiche')`. Bouton en bas « Prendre une séance » → `/seances/nouvelle?animal=$id`.

Carte d'agenda : le nom de l'animal devient tapable → `/animaux/$patientId`. Sélecteur : icône `info_outline` par ligne → même route.

- [ ] **Étape 4 : Lancer, vérifier** — `cd apps/mobile && rtk flutter pub get && rtk flutter test && rtk flutter analyze`.

- [ ] **Étape 5 : Commit**

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): fiche animal en lecture seule, comptes rendus passés consultables hors ligne"
```

---

### Tâche 7 : Vérification sur téléphone et distribution

**Fichiers :**
- Modifier : `docs/mobile/manual-test-matrix.md`

- [ ] **Étape 1 : Scénarios sur téléphone**

1. Ouvrir l'app en ligne : huit jours affichés, aujourd'hui en tête ; couper le réseau, relancer : les huit jours sont toujours là.
2. « + » → Nouvelle séance : animal, demain 14:30, durée par défaut = dernière séance ; créer sur un créneau déjà pris → bannière de conflit, séance créée quand même ; l'agenda la montre.
3. Déplacer cette séance depuis sa carte ; le conflit disparaît.
4. « + » → Nouveau client sans e-mail : la mention est visible, on passe quand même ; l'animal créé apparaît dans le sélecteur ; dicter pour lui ; à la finalisation, le garde-fou e-mail du lot A s'affiche.
5. Depuis une carte d'agenda, ouvrir la fiche animal ; « Appeler » ouvre le téléphone ; ouvrir un compte rendu passé : aucun bouton ; couper le réseau : le compte rendu s'ouvre encore.
6. Sélecteur de date → un jour dans un mois → liste chargée ; hors ligne → message.
7. En mode avion, « + » → Nouvelle séance → message « dicter dès maintenant » avec le bouton Dicter.

- [ ] **Étape 2 : Build TestFlight**

```bash
cd apps/mobile && rtk flutter build ipa --dart-define=BIUME_API_URL=https://biume.app
```

- [ ] **Étape 3 : Commit**

```bash
rtk git add docs/
rtk git commit -m "docs(mobile): matrice de test de l'agenda et des fiches"
```

---

## Critères d'acceptation du plan

- Serveur et Flutter verts, `openapi.json` à jour.
- Une séance peut être prise, déplacée et préparée (fiche, dernier compte rendu) sans réseau après une ouverture en ligne, à l'exception de la création elle-même, qui le dit.
- Un nouveau client est créé en deux volets, sans e-mail si le praticien le décide, et son animal est immédiatement sélectionnable.
- Aucun conflit d'horaire ne bloque ; tous sont signalés.
