# Mobile lot C — Boucle de retour — Plan d'implémentation

> **Pour les agents d'exécution :** SOUS-COMPÉTENCE REQUISE : utiliser `superpowers:subagent-driven-development` (recommandé) ou `superpowers:executing-plans` pour exécuter ce plan tâche par tâche. Les étapes utilisent la syntaxe à cases (`- [ ]`) pour le suivi.

**Objectif :** Que le praticien soit prévenu quand un propriétaire demande une action, qu'il traite ce suivi en trois gestes depuis son téléphone, et que les dictées en attente repartent toutes seules, sans qu'aucune infrastructure push ne soit construite.

**Architecture :** Aucun endpoint nouveau. Côté Flutter, une feature `followup` complète (dépôt HTTP, cubit, cartes dans « À traiter », écran de traitement), un module `background` qui enregistre une tâche `workmanager` périodique réutilisant les lectures du premier plan, un module `notifications` (locales seules) avec une mémoire drift de ce qui a déjà été notifié, et le puits PostHog de la télémétrie, qui mesure enfin le délai réel entre l'événement serveur et la notification.

**Pile technique :** identique aux lots A et B, plus `workmanager` (déjà déclaré, `^0.10.9`), `flutter_local_notifications` (déjà déclaré, `^22.3.0`), `posthog_flutter` (déjà déclaré, `^5.36.6`), `url_launcher` (lot B).

**Spécification :** `docs/superpowers/specs/2026-09-03-mobile-v1-completion-design.md` (sections 5.11, 5.12, 6). Design parent 7.10 et 7.11.

**Dépend de :** lots A et B terminés : `TodoCubit`, `refreshForeground`, `Telemetry`, création de séance avec animal prérempli.

## Contraintes globales

- Celles des lots A et B.
- **Notifications locales seules.** Aucun SDK push, aucun jeton d'appareil, aucune table serveur.
- Une situation n'est **jamais notifiée deux fois** (mémoire drift par identifiant) ; une réussite n'est **jamais notifiée**.
- « Traité » est un geste **explicite**. Appeler, écrire ou prendre un rendez-vous ne clôt rien.
- Le réveil en arrière-plan ne fait que **relire** (« à traiter », suivis) et **relancer la file**. Il n'écrit rien d'autre que la mémoire des notifications.
- iOS : `UIBackgroundModes` contient déjà `processing` (`ios/Runner/Info.plist:77`). `BGTaskSchedulerPermittedIdentifiers` doit contenir l'identifiant de la tâche `workmanager`. Android : `workmanager` n'exige aucune permission supplémentaire ; les notifications exigent `POST_NOTIFICATIONS` (API 33+).
- Le délai réel entre `answeredAt` (serveur) et la notification locale est **mesuré** et envoyé en télémétrie : c'est la donnée qui décidera, ou non, du chantier push.

---

## Structure des fichiers

```
apps/mobile/lib/
  core/database/app_database.dart                   (modifier) table NotifiedItems, schéma v4
  core/notifications/local_notifications.dart       (créer)   LocalNotifications (init, show, permission)
  core/notifications/notification_memory.dart       (créer)   ce qui a déjà été notifié
  core/notifications/notification_planner.dart      (créer)   pur : quoi notifier à partir de l'état
  core/background/background_refresh.dart           (créer)   point d'entrée workmanager + enregistrement
  core/telemetry/posthog_sink.dart                  (créer)   transport PostHog
  features/followup/domain/follow_up.dart           (modifier) réponse du propriétaire, contact
  features/followup/domain/actionable_follow_up_repository.dart (créer)
  features/followup/data/http_actionable_follow_up_repository.dart (créer)
  features/followup/presentation/follow_up_cubit.dart (créer)  liste actionnable
  features/followup/presentation/follow_up_screen.dart (créer) lire, contacter, prendre RDV, marquer traité
  features/todo/presentation/todo_cubit.dart        (modifier) fusionne les suivis actionnables
  features/todo/domain/todo_item.dart               (modifier) TodoKind.followUp
  config/app_router.dart                            (modifier) /suivis/:followUpId
  injection_container.dart                          (modifier)
  main.dart                                         (modifier) init notifications + workmanager
apps/mobile/ios/Runner/Info.plist                   (modifier) BGTaskSchedulerPermittedIdentifiers
apps/mobile/android/app/src/main/AndroidManifest.xml (modifier) POST_NOTIFICATIONS
apps/mobile/test/                                    miroirs
docs/mobile/operations.md                            (modifier) délai mesuré, procédure PostHog
```

---

### Tâche 1 : Le suivi actionnable, lu et traité

**Fichiers :**
- Modifier : `features/followup/domain/follow_up.dart`
- Créer : `features/followup/domain/actionable_follow_up_repository.dart`, `features/followup/data/http_actionable_follow_up_repository.dart`, `features/followup/presentation/follow_up_cubit.dart`
- Test : `test/features/followup/follow_up_test.dart` (ajout), `follow_up_cubit_test.dart`, `http_actionable_follow_up_repository_test.dart`

**Interfaces :**
- Produit :

```dart
enum Evolution { better, same, worse }
class FollowUpAnswer { final Evolution evolution; final String reaction; final bool wantsContact; }
class FollowUp { ... existants + final String reportId; final FollowUpAnswer? answer; final DateTime? answeredAt; final String? ownerPhone; final String? ownerEmail; final String? patientId; }
abstract class ActionableFollowUpRepository {
  Future<Result<List<FollowUp>>> listActionable();   // GET /followups/actionable, suit nextCursor
  Future<Result<FollowUp>> markHandled(String followUpId); // POST /followups/{id}/handled
}
FollowUpCubit(ActionableFollowUpRepository repository)
class FollowUpState { final List<FollowUp> items; final bool busy; final String? message; }
Future<void> load(); Future<void> markHandled(String id);
```

Le contrat `followUpSchema` (`packages/contracts/src/followup.ts:142`) ne porte ni téléphone, ni e-mail, ni `patientId` du propriétaire. **Extension serveur minimale** (la seule du lot) : ajouter `ownerPhone: z.string().nullable()`, `ownerEmail: z.string().nullable()`, `patientId: z.string().min(1).nullable()` à `followUpSchema`, les renseigner dans `readFollowUp` (`mobile-api.ports.ts`, jointure `clients` déjà présente depuis la correction du lot A ; `pets.id` pour `patientId`), mettre à jour les fixtures de `mobile-api.followup.test.ts`, régénérer `openapi.json`. Commit `feat(web): le suivi actionnable porte le contact du propriétaire`.

- [ ] **Étape 1 : Tests qui échouent**

```dart
// follow_up_test.dart
test('résume la réponse en français', () {
  final suivi = suiviAvec(answer: const FollowUpAnswer(evolution: Evolution.worse, reaction: 'Boite depuis hier', wantsContact: true));
  expect(suivi.answerSentences, [
    'État : moins bien.',
    'Réaction observée : « Boite depuis hier ».',
    'Souhaite être recontacté.',
  ]);
});

// follow_up_cubit_test.dart
blocTest<FollowUpCubit, FollowUpState>(
  'ne liste que ce qui demande une action',
  setUp: () => when(() => repository.listActionable()).thenAnswer((_) async => Success([suivi(), suivi(handled: true), suivi(reasons: const [])])),
  build: () => FollowUpCubit(repository),
  act: (cubit) => cubit.load(),
  verify: (cubit) => expect(cubit.state.items, hasLength(1)),
);

blocTest<FollowUpCubit, FollowUpState>(
  'fait disparaître un suivi une fois traité',
  setUp: () {
    when(() => repository.listActionable()).thenAnswer((_) async => Success([suivi(id: 'f-1'), suivi(id: 'f-2')]));
    when(() => repository.markHandled('f-1')).thenAnswer((_) async => Success(suivi(id: 'f-1', handled: true)));
  },
  build: () => FollowUpCubit(repository),
  act: (cubit) async { await cubit.load(); await cubit.markHandled('f-1'); },
  verify: (cubit) => expect(cubit.state.items.map((f) => f.id), ['f-2']),
);

blocTest<FollowUpCubit, FollowUpState>(
  'garde la liste et dit pourquoi quand marquer traité échoue',
  setUp: () {
    when(() => repository.listActionable()).thenAnswer((_) async => Success([suivi(id: 'f-1')]));
    when(() => repository.markHandled('f-1')).thenAnswer((_) async => const Err(NetworkFailure()));
  },
  build: () => FollowUpCubit(repository),
  act: (cubit) async { await cubit.load(); await cubit.markHandled('f-1'); },
  verify: (cubit) {
    expect(cubit.state.items, hasLength(1));
    expect(cubit.state.message, 'Connexion indisponible.');
  },
);
```

Dépôt (Dio intercepté) : `alertReasons: ['declared_worsening']` → `[AlertReason.declaredWorsening]` ; `answer: null` → `null` ; `handledAt` non nul → `handled: true`.

- [ ] **Étape 2 : Lancer, vérifier l'échec.**

- [ ] **Étape 3 : Implémenter**

`follow_up.dart` : ajouter `Evolution`, `evolutionFrom(String)`, `FollowUpAnswer`, les champs, et :

```dart
  /// Ce que le praticien lit avant d'appeler. Trois phrases au plus, dans
  /// l'ordre des questions posées au propriétaire.
  List<String> get answerSentences {
    final a = answer;
    if (a == null) return const [];
    return [
      'État : ${switch (a.evolution) { Evolution.better => 'mieux', Evolution.same => 'pareil', Evolution.worse => 'moins bien' }}.',
      if (a.reaction.trim().isNotEmpty) 'Réaction observée : « ${a.reaction.trim()} ».',
      if (a.wantsContact) 'Souhaite être recontacté.',
    ];
  }
```

Dépôt HTTP : `listActionable` boucle sur `GET /api/mobile/v1/followups/actionable?limit=50&cursor=` ; `markHandled` POST. Cubit : `load` filtre sur `isActionable` ; `markHandled` retire l'élément sur succès, pose `message` sur échec.

- [ ] **Étape 4 : Lancer, vérifier** — `cd apps/mobile && rtk flutter test && rtk flutter analyze` ; côté web `cd apps/web && rtk bun run test && rtk bun run check-types` après l'extension.

- [ ] **Étape 5 : Commit**

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): lire les suivis qui demandent une action et les marquer traités"
```

---

### Tâche 2 : L'écran de traitement et la place dans « À traiter »

**Fichiers :**
- Créer : `features/followup/presentation/follow_up_screen.dart`
- Modifier : `features/todo/domain/todo_item.dart`, `features/todo/presentation/todo_cubit.dart`, `todo_section.dart`, `app_router.dart`, `injection_container.dart`
- Test : `test/features/followup/follow_up_screen_test.dart`, `test/features/todo/todo_cubit_test.dart` (ajout)

**Interfaces :**
- Produit : `TodoKind.followUp` avec `TodoItem.followUp(FollowUp)` (label = `FollowUp.summary`, route `/suivis/:id`) ; `TodoCubit(store, api, followUps: ActionableFollowUpRepository)` place les suivis **entre** les dictées locales et les éléments serveur ; route `/suivis/:followUpId`.

- [ ] **Étape 1 : Tests qui échouent**

```dart
// todo_cubit_test.dart
blocTest<TodoCubit, TodoState>(
  'place les suivis actionnables après les dictées locales et avant le reste',
  setUp: () {
    store.emitAll([localQueued('c-local')]);
    when(() => api.list()).thenAnswer((_) async => Success([serverItem(TodoKind.reportToValidate, 'c-srv')]));
    when(() => followUps.listActionable()).thenAnswer((_) async => Success([suivi(id: 'f-1')]));
  },
  build: () => TodoCubit(store, api, followUps: followUps, pollInterval: Duration.zero),
  act: (cubit) => cubit.start(),
  verify: (cubit) => expect(cubit.state.items.map((i) => i.kind), [TodoKind.pendingUpload, TodoKind.followUp, TodoKind.reportToValidate]),
);
```

Widget `follow_up_screen_test.dart` : affiche le motif (`summary`), les phrases de réponse, « Appeler » désactivé sans téléphone, « Prendre un rendez-vous » pousse `/seances/nouvelle?animal=pet-1`, « Marquer comme traité » appelle `markHandled` puis `pop` ; **appeler ne marque pas traité** (après un tap sur « Appeler », `markHandled` n'a pas été appelé).

- [ ] **Étape 2 : Lancer, vérifier l'échec.**

- [ ] **Étape 3 : Implémenter**

`todo_item.dart` : `TodoKind.followUp`, `todoLabels[TodoKind.followUp] = 'Suivi à traiter'`, constructeur nommé `TodoItem.followUp(FollowUp f)` avec `captureId: ''`, `followUpId: f.id`, `patientName: f.patientName`, `detail: f.summary`, `updatedAt: f.answeredAt ?? DateTime.now()`. `label` renvoie `detail ?? todoLabels[kind]!`. `route` → `'/suivis/${followUpId}'`.

`TodoCubit.refresh()` appelle aussi `followUps.listActionable()` ; `_publish` compose `[...local, ...followUps, ...remote]`.

Écran `/suivis/:id` (`FollowUpPage` lit le suivi depuis le `FollowUpCubit` partagé par l'accueil, ou le recharge) : en-tête animal + propriétaire ; carte « Ce que dit le propriétaire » (`summary` en gras, puis `answerSentences`) ; rangée de trois `OutlinedButton.icon` : « Appeler » (`launchUrl(Uri(scheme: 'tel', path: ownerPhone))`), « Écrire » (`mailto:`), « Prendre un rendez-vous » (`context.push('/seances/nouvelle?animal=$patientId')`) ; en bas `FilledButton('Marquer comme traité')` → `markHandled` → `context.pop()`. Aucun champ de saisie.

- [ ] **Étape 4 : Lancer, vérifier** — `cd apps/mobile && rtk flutter test && rtk flutter analyze`.

- [ ] **Étape 5 : Commit**

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): traiter un suivi en trois gestes, marquer traité reste explicite"
```

---

### Tâche 3 : Ce qu'il faut notifier, décidé sans effet de bord

**Fichiers :**
- Modifier : `core/database/app_database.dart` (table `NotifiedItems { key text pk, notifiedAt }`, schéma v4)
- Créer : `core/notifications/notification_planner.dart`, `core/notifications/notification_memory.dart`
- Test : `test/core/notification_planner_test.dart`, `test/core/notification_memory_test.dart`

**Interfaces :**
- Produit :

```dart
class PlannedNotification { final String key; final String title; final String body; final String route; }
List<PlannedNotification> planNotifications({
  required List<TodoItem> todo,
  required Set<String> alreadyNotified,
});
abstract class NotificationMemory { Future<Set<String>> keys(); Future<void> remember(Iterable<String> keys); }
```

Clés : `followup:<id>`, `draft:<reportId>`, `blocked:<captureId>`. Seuls trois genres notifient : `followUp`, `reportToValidate`/`readyToSend` (« brouillon en attente »), `uploadBlocked` (dictée abandonnée après cinq échecs). Rien d'autre.

- [ ] **Étape 1 : Tests qui échouent**

```dart
test('notifie un suivi, un brouillon en attente et une dictée bloquée', () {
  final planned = planNotifications(
    todo: [item(TodoKind.followUp, followUpId: 'f-1'), item(TodoKind.readyToSend, reportId: 'r-1'), item(TodoKind.uploadBlocked, captureId: 'c-1')],
    alreadyNotified: const {},
  );
  expect(planned.map((n) => n.key), ['followup:f-1', 'draft:r-1', 'blocked:c-1']);
});

test('ne notifie jamais deux fois la même situation', () {
  final planned = planNotifications(todo: [item(TodoKind.followUp, followUpId: 'f-1')], alreadyNotified: const {'followup:f-1'});
  expect(planned, isEmpty);
});

test('ne notifie jamais une transcription en cours ni une réussite', () {
  final planned = planNotifications(
    todo: [item(TodoKind.transcribing), item(TodoKind.preparing), item(TodoKind.pendingUpload)],
    alreadyNotified: const {},
  );
  expect(planned, isEmpty);
});

test('les textes disent le geste, pas l\'état', () {
  final n = planNotifications(todo: [item(TodoKind.followUp, followUpId: 'f-1', patientName: 'Filou')], alreadyNotified: const {}).single;
  expect(n.title, 'Filou : un propriétaire demande une action');
  expect(n.route, '/suivis/f-1');
});
```

- [ ] **Étape 2 : Lancer, vérifier l'échec.**

- [ ] **Étape 3 : Implémenter**

```dart
List<PlannedNotification> planNotifications({required List<TodoItem> todo, required Set<String> alreadyNotified}) {
  final planned = <PlannedNotification>[];
  for (final item in todo) {
    final candidate = switch (item.kind) {
      TodoKind.followUp => PlannedNotification(
          key: 'followup:${item.followUpId}',
          title: '${item.patientName ?? 'Un animal'} : un propriétaire demande une action',
          body: item.label,
          route: item.route!,
        ),
      TodoKind.reportToValidate || TodoKind.readyToSend when item.reportId != null => PlannedNotification(
          key: 'draft:${item.reportId}',
          title: '${item.patientName ?? 'Une séance'} : compte rendu en attente',
          body: item.label,
          route: item.route!,
        ),
      TodoKind.uploadBlocked => PlannedNotification(
          key: 'blocked:${item.captureId}',
          title: "Une dictée n'a pas pu être envoyée",
          body: 'Ouvrez Biume pour réessayer.',
          route: '/',
        ),
      _ => null,
    };
    if (candidate != null && !alreadyNotified.contains(candidate.key)) planned.add(candidate);
  }
  return planned;
}
```

`DriftNotificationMemory` implémente `NotificationMemory` sur `NotifiedItems` (`insertOrIgnore`). Migration v4 : `createTable(notifiedItems)`.

- [ ] **Étape 4 : Lancer, vérifier** — codegen, `rtk flutter test`, `rtk flutter analyze`.

- [ ] **Étape 5 : Commit**

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): décider quoi notifier, une fois et seulement pour un geste"
```

---

### Tâche 4 : Notifications locales et réveil en arrière-plan

**Fichiers :**
- Créer : `core/notifications/local_notifications.dart`, `core/background/background_refresh.dart`
- Modifier : `main.dart`, `injection_container.dart`, `ios/Runner/Info.plist`, `android/app/src/main/AndroidManifest.xml`, `core/lifecycle/foreground_refresh.dart`
- Test : `test/core/background_refresh_test.dart` (la logique pure `runBackgroundCycle` sur doublures)

**Interfaces :**
- Produit :

```dart
class LocalNotifications {
  Future<void> initialize({required void Function(String route) onOpened});
  Future<bool> requestPermission();
  Future<void> show(PlannedNotification notification);
}
const String backgroundTaskId = 'com.biume.mobile.refresh';
Future<void> runBackgroundCycle({
  required SyncEngine sync, required TodoApi todo, required ActionableFollowUpRepository followUps,
  required CaptureStore store, required NotificationMemory memory, required LocalNotifications notifications,
  required Telemetry telemetry, required DateTime Function() now,
});
void registerBackgroundRefresh();   // Workmanager().registerPeriodicTask, 15 min, réseau requis
@pragma('vm:entry-point') void backgroundDispatcher();
```

- [ ] **Étape 1 : Test qui échoue**

```dart
test('un cycle relance la file, relit, notifie ce qui est nouveau et s\'en souvient', () async {
  when(() => sync.runOnce()).thenAnswer((_) async => outcomeVide);
  when(() => todo.list()).thenAnswer((_) async => Success([serverItem(TodoKind.readyToSend, 'c-1', reportId: 'r-1')]));
  when(() => followUps.listActionable()).thenAnswer((_) async => Success([suivi(id: 'f-1', answeredAt: DateTime(2026, 9, 3, 9))]));
  when(() => store.watchAll()).thenAnswer((_) => Stream.value(const []));
  when(() => memory.keys()).thenAnswer((_) async => {'draft:r-1'});
  when(() => memory.remember(any())).thenAnswer((_) async {});
  when(() => notifications.show(any())).thenAnswer((_) async {});

  await runBackgroundCycle(sync: sync, todo: todo, followUps: followUps, store: store, memory: memory, notifications: notifications, telemetry: telemetry, now: () => DateTime(2026, 9, 3, 11));

  verify(() => sync.runOnce()).called(1);
  final shown = verify(() => notifications.show(captureAny())).captured.cast<PlannedNotification>();
  expect(shown.map((n) => n.key), ['followup:f-1']);
  verify(() => memory.remember(['followup:f-1'])).called(1);
  final event = verify(() => telemetry.emit(captureAny())).captured.cast<ProductEvent>().single;
  expect(event.name, 'mobile.followup_notified');
  expect(event.properties['delayMs'], 2 * 60 * 60 * 1000);
});

test('un cycle sans réseau ne notifie rien et ne lève pas', () async {
  when(() => sync.runOnce()).thenAnswer((_) async => outcomeVide);
  when(() => todo.list()).thenAnswer((_) async => const Err(NetworkFailure()));
  when(() => followUps.listActionable()).thenAnswer((_) async => const Err(NetworkFailure()));
  when(() => store.watchAll()).thenAnswer((_) => Stream.value(const []));
  when(() => memory.keys()).thenAnswer((_) async => <String>{});
  await runBackgroundCycle(sync: sync, todo: todo, followUps: followUps, store: store, memory: memory, notifications: notifications, telemetry: telemetry, now: () => DateTime(2026, 9, 3, 11));
  verifyNever(() => notifications.show(any()));
});
```

- [ ] **Étape 2 : Lancer, vérifier l'échec.**

- [ ] **Étape 3 : Implémenter**

`runBackgroundCycle` : `await sync.runOnce()` ; lit `todo.list()` et `followUps.listActionable()` (un échec = liste vide, jamais d'exception) ; construit la liste comme `TodoCubit._publish` (extraire cette composition en fonction pure `composeTodo(local, followUps, remote, requestedAt, now)` dans `todo_cubit.dart` pour la partager) ; `planNotifications` ; `show` chacune ; `remember` ; pour chaque suivi notifié, émet `ProductEvent(name: 'mobile.followup_notified', journeyId: followUp.reportId, properties: {'delayMs': now.difference(answeredAt).inMilliseconds})`. Ajouter `'delayMs'` à `allowedTelemetryProperties` et `followUpNotified` à `JourneyEvents`.

`local_notifications.dart` : enveloppe `FlutterLocalNotificationsPlugin` ; canal Android `biume_actions` « Ce qui demande une action », importance haute ; `onDidReceiveNotificationResponse` → `onOpened(payload)` avec `payload = route` ; `requestPermission` via `AndroidFlutterLocalNotificationsPlugin.requestNotificationsPermission()` et `DarwinFlutterLocalNotificationsPlugin.requestPermissions(alert: true, badge: true, sound: false)`.

`background_refresh.dart` :

```dart
@pragma('vm:entry-point')
void backgroundDispatcher() {
  Workmanager().executeTask((task, _) async {
    // Isolat séparé : rien du premier plan n'est disponible, on reconstruit.
    WidgetsFlutterBinding.ensureInitialized();
    await configureDependencies();
    final notifications = LocalNotifications();
    await notifications.initialize(onOpened: (_) {});
    await runBackgroundCycle(
      sync: getIt(), todo: getIt(), followUps: getIt(), store: getIt(),
      memory: getIt(), notifications: notifications, telemetry: getIt(), now: DateTime.now,
    );
    return true;
  });
}

void registerBackgroundRefresh() {
  Workmanager().registerPeriodicTask(
    backgroundTaskId,
    backgroundTaskId,
    frequency: const Duration(minutes: 15),
    constraints: Constraints(networkType: NetworkType.connected),
    existingWorkPolicy: ExistingWorkPolicy.keep,
  );
}
```

`main.dart` : `await Workmanager().initialize(backgroundDispatcher)` avant `runApp` ; `LocalNotifications` initialisé avec `onOpened: (route) => router.go(route)` ; `registerBackgroundRefresh()` et `requestPermission()` **après** le premier `AuthAuthenticated`, pas au lancement (le praticien n'a pas encore vu l'app). `refreshForeground` exécute aussi `runBackgroundCycle` sans notification (paramètre `notify: false`) pour que la mémoire reste cohérente : ce que le praticien a vu au premier plan ne le réveillera pas plus tard.

`Info.plist` : ajouter

```xml
<key>BGTaskSchedulerPermittedIdentifiers</key>
<array>
  <string>com.biume.mobile.refresh</string>
</array>
```

et vérifier que `UIBackgroundModes` contient `processing` (déjà présent) et ajouter `fetch`. `AndroidManifest.xml` : `<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>`.

- [ ] **Étape 4 : Lancer, vérifier** — `cd apps/mobile && rtk flutter test && rtk flutter analyze`.

- [ ] **Étape 5 : Commit**

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): réveil périodique, notifications locales pour ce qui demande un geste"
```

---

### Tâche 5 : PostHog comme puits de télémétrie

**Fichiers :**
- Créer : `core/telemetry/posthog_sink.dart`
- Modifier : `injection_container.dart`, `config/app_environment.dart` (`BIUME_POSTHOG_KEY`, `BIUME_POSTHOG_HOST`), `dart_define/local.json.example`, `docs/mobile/operations.md`
- Test : `test/core/posthog_sink_test.dart`

**Interfaces :**
- Produit : `TelemetrySink createPosthogSink(Posthog client)` ; `Telemetry` reçoit ce puits quand `biumePosthogKey` est non vide, sinon reste sur le puits de débogage.

- [ ] **Étape 1 : Test qui échoue** : le puits appelle `client.capture(eventName: e.name, properties: {...e.properties, 'journeyId': e.journeyId})` ; une exception du client est avalée (le test vérifie qu'`emit` ne lève pas).

- [ ] **Étape 2 : Lancer, vérifier l'échec.**

- [ ] **Étape 3 : Implémenter** : `PosthogConfig(apiKey, host: biumePosthogHost, captureApplicationLifecycleEvents: false)` dans `configureDependencies` si la clé est définie ; `identify(userId)` à `AuthAuthenticated`, `reset()` à la déconnexion ; **aucune** propriété hors liste blanche ne part (déjà garanti par `Telemetry.emit`). Documenter dans `docs/mobile/operations.md` la requête PostHog qui donne le délai médian de `mobile.followup_notified`.

- [ ] **Étape 4 : Lancer, vérifier** — `cd apps/mobile && rtk flutter test && rtk flutter analyze`.

- [ ] **Étape 5 : Commit**

```bash
rtk git add apps/mobile/ docs/mobile/
rtk git commit -m "feat(mobile): envoyer la télémétrie du parcours à PostHog, délai de notification compris"
```

---

### Tâche 6 : Vérification sur téléphone et distribution

**Fichiers :**
- Modifier : `docs/mobile/manual-test-matrix.md`, `docs/superpowers/specs/2026-09-03-mobile-v1-completion-design.md` (section 5.11 : délai mesuré)

- [ ] **Étape 1 : Scénarios**

1. Répondre au questionnaire propriétaire depuis un autre téléphone (`/r/<token>`) avec « moins bien » ; mettre l'app en arrière-plan ; attendre le réveil (Android : ≤ 15 min ; iOS : forcer avec `e -l objc -- (void)[[BGTaskScheduler sharedScheduler] _simulateLaunchForTaskWithIdentifier:@"com.biume.mobile.refresh"]` dans le débogueur Xcode) → notification « Filou : un propriétaire demande une action » ; l'ouvrir → écran du suivi.
2. Revenir au premier plan sans ouvrir la notification : « À traiter » montre le suivi ; aucune seconde notification au cycle suivant.
3. « Appeler » → l'app téléphone s'ouvre ; revenir : le suivi est toujours là. « Marquer comme traité » → disparu.
4. Laisser un brouillon « Prêt à envoyer » → une notification, une seule, au cycle suivant.
5. Mode avion, cinq échecs d'envoi simulés (serveur arrêté) → notification « Une dictée n'a pas pu être envoyée ».
6. Vérifier dans PostHog les événements `mobile.*` avec `journeyId`, et `delayMs` sur `mobile.followup_notified`.

- [ ] **Étape 2 : Consigner** le délai iOS observé sur trois réveils réels (pas simulés) dans la spécification, section 5.11.

- [ ] **Étape 3 : Build TestFlight**

```bash
cd apps/mobile && rtk flutter build ipa --dart-define=BIUME_API_URL=https://biume.app --dart-define=BIUME_POSTHOG_KEY=<clé>
```

- [ ] **Étape 4 : Commit**

```bash
rtk git add docs/
rtk git commit -m "docs(mobile): matrice de test de la boucle de retour et délai de notification mesuré"
```

---

## Critères d'acceptation du plan

- Flutter vert ; aucune dépendance push ajoutée.
- Une réponse de propriétaire produit **une** notification locale, ouvre l'écran du suivi, et « traité » reste un geste explicite.
- Une réussite ne notifie jamais ; une situation vue au premier plan ne notifie pas ensuite.
- Le délai réel serveur → notification est mesuré et consigné ; la décision push, si elle vient, s'appuie sur ce chiffre.
