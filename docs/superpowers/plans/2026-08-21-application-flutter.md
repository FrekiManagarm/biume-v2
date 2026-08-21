# Application mobile Flutter — Plan d'implémentation

> **Pour les agents d'exécution :** SOUS-COMPÉTENCE REQUISE : utiliser `superpowers:subagent-driven-development` (recommandé) ou `superpowers:executing-plans` pour exécuter ce plan tâche par tâche. Les étapes utilisent la syntaxe à cases (`- [ ]`) pour le suivi.

**Objectif :** Remplacer l'application Expo par une application Flutter en clean architecture couvrant le parcours de terrain complet — agenda, dictée hors ligne, transcription corrigeable, validation du rapport prérempli, suivis actionnables.

**Architecture :** `features/<x>/{data,domain,presentation}` avec `get_it` pour l'injection. La couche domaine existe pour une raison opérationnelle avant d'être une préférence : chaque source de données a une doublure enregistrée sous la même interface, ce qui permet de construire l'application entière avant que les endpoints n'atterrissent, puis de basculer une ligne par endpoint. Cubit par défaut, Bloc là où il y a une vraie machine à états.

**Pile technique :** Flutter, Dart 3, `flutter_bloc`, `get_it`, `freezed`, `json_serializable`, `dio`, `retrofit`, `drift`, `go_router`, `flutter_secure_storage`, `cryptography`, `flutter_local_notifications`, `posthog_flutter`, `build_runner`.

**Spécification :** `docs/superpowers/specs/2026-08-21-mobile-flutter-rewrite-design.md`

**Dépend de :** plan 2 (contrat OpenAPI et jeton porteur). Les plans 2b, 3, 4 et 5 alimentent les tâches 8 à 12 ; jusque-là, ces features tournent sur doublures.

## Contraintes globales

- Langue de l'interface : **français uniquement**, aucune internationalisation.
- **Portrait seul**, pas de support tablette.
- Identité : `com.biume.mobile`, scheme `biume://`.
- Cibles : **iOS 15 minimum, Android 9 (API 28) minimum**.
- Source de vérité des couleurs : `packages/ui/src/styles/product.css`. Violet d'action `#6a52d6`, vert d'état `#047857`. Aucune couleur codée en dur hors du fichier de palette.
- Source de vérité des contrats : `apps/web/openapi.json`. Les modèles sont écrits à la main et validés contre lui.
- **`retrofit` pour toute la surface JSON, `dio` nu uniquement pour les transferts binaires** — le PUT présigné vers R2. Deux styles, une frontière nette.
- Hors ligne : **cache en lecture seule** et file de dictées. Aucune écriture mise en file, donc aucun conflit.
- Le mobile **valide, il n'édite pas**. La seule saisie de texte libre est la correction de la transcription.
- Aucune création de compte, aucun tarif affiché, aucun bouton d'achat.
- Vocabulaire métier français, jamais technique. Les utilisateurs sont des ostéopathes animaliers non-techniciens.
- **Format d'enveloppe imposé** : `"BIUME1"` (6 octets ASCII) + nonce 12 octets + AES-256-GCM, identifiant de capture en données authentifiées supplémentaires. Clé 256 bits dans le trousseau système.
- **Transitions locales imposées** : seul `review` atteint `queued`. Voir la spécification, section 8.2.
- **Temporisation imposée** : `base = min(1000 × 2^(tentatives-1), 900000)` ; `délai = min(900000, arrondi(base/2 + aléa()×base/2))`. Abandon automatique à **5** tentatives. `unauthorized`, `active_organization_required`, `forbidden`, `conflict` et `validation` arrêtent la boucle immédiatement et **ne consomment aucune tentative**.
- Rétention : `expiresAt = createdAt + 24 h`.
- Une erreur ne porte **qu'un code normalisé**. Aucune URL signée, aucun en-tête, aucun corps de réponse dans un journal ou une exception.

---

## Structure des fichiers

```
apps/mobile/
  package.json                  passerelle Bun/Turbo : test, check-types
  pubspec.yaml
  analysis_options.yaml
  lib/
    main.dart
    injection_container.dart
    config/
      app_palette.dart          transposition de product.css
      app_theme.dart
      app_router.dart
      app_environment.dart
    core/
      result.dart               sealed Result<T> + Failure de domaine
      failure.dart
      network/dio_client.dart   interceptors : jeton, langue, erreurs
      network/api_error.dart    traduction HTTP → Failure
      database/app_database.dart  drift : file de captures + cache
      crypto/capture_envelope.dart
    features/
      auth/{data,domain,presentation}
      agenda/{data,domain,presentation}
      records/{data,domain,presentation}
      capture/{data,domain,presentation}
      transcript/{data,domain,presentation}
      report/{data,domain,presentation}
      followup/{data,domain,presentation}
  test/
    ...miroir de lib/
```

---

### Tâche 1 : Socle du projet et passerelle monorepo

**Fichiers :**
- Supprimer : tout `apps/mobile/src`, `app.config.ts`, `jest.config.cjs`, `jest.setup.ts`, `tsconfig.json`
- Créer : `apps/mobile/pubspec.yaml`, `apps/mobile/analysis_options.yaml`, `apps/mobile/lib/main.dart`
- Réécrire : `apps/mobile/package.json`
- Modifier : `.github/workflows/ci.yml`

**Interfaces :**
- Consomme : rien.
- Produit : `bun run test:mobile` et `bun --filter @biume/mobile check-types` fonctionnent, désormais adossés à Flutter.

**Avant de supprimer quoi que ce soit**, vérifier que la section 8 de la spécification est complète et exacte : format d'enveloppe, table de transitions, formule de temporisation, seuils, rétention, confidentialité des erreurs. C'est elle qui remplace le code supprimé. `rtk git log` conserve le reste.

- [ ] **Étape 1 : Vérifier que la spécification porte bien les règles**

```bash
rtk grep -n "BIUME1" docs/superpowers/specs/2026-08-21-mobile-flutter-rewrite-design.md
rtk grep -n "900000" docs/superpowers/specs/2026-08-21-mobile-flutter-rewrite-design.md
```

Attendu : les deux présents. Sinon, compléter la spécification **avant** de continuer.

- [ ] **Étape 2 : Créer le projet Flutter**

```bash
cd /Users/mathieuchambaud/orca/workspaces/biume-v2/anhinga/apps
rtk git rm -r --cached mobile/src mobile/app.config.ts mobile/jest.config.cjs mobile/jest.setup.ts mobile/tsconfig.json
rm -rf mobile/src mobile/app.config.ts mobile/jest.config.cjs mobile/jest.setup.ts mobile/tsconfig.json mobile/node_modules
flutter create --org com.biume --project-name biume_mobile --platforms ios,android mobile
```

- [ ] **Étape 3 : Déclarer les dépendances**

Dans `apps/mobile/pubspec.yaml` :

```yaml
name: biume_mobile
description: Compagnon de terrain Biume pour ostéopathes animaliers.
publish_to: none
version: 1.0.0+1

environment:
  sdk: ">=3.5.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  flutter_bloc: ^9.0.0
  get_it: ^8.0.0
  go_router: ^14.0.0
  dio: ^5.7.0
  retrofit: ^4.4.0
  freezed_annotation: ^2.4.4
  json_annotation: ^4.9.0
  drift: ^2.20.0
  sqlite3_flutter_libs: ^0.5.0
  path_provider: ^2.1.0
  path: ^1.9.0
  flutter_secure_storage: ^9.2.0
  cryptography: ^2.7.0
  record: ^5.1.0
  just_audio: ^0.9.0
  connectivity_plus: ^6.0.0
  workmanager: ^0.5.2
  flutter_local_notifications: ^17.2.0
  posthog_flutter: ^4.10.0
  intl: ^0.19.0
  crypto: ^3.0.5

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0
  build_runner: ^2.4.0
  freezed: ^2.5.0
  json_serializable: ^6.8.0
  retrofit_generator: ^9.1.0
  drift_dev: ^2.20.0
  bloc_test: ^10.0.0
  mocktail: ^1.0.0

flutter:
  uses-material-design: true
```

- [ ] **Étape 4 : Fixer l'identité et les cibles**

- `ios/Runner/Info.plist` : `CFBundleIdentifier` à `com.biume.mobile`, orientations portrait seules, `NSMicrophoneUsageDescription` à « Biume utilise le microphone pour enregistrer votre dictée de séance. », scheme `biume` dans `CFBundleURLTypes`.
- `ios/Podfile` : `platform :ios, '15.0'`.
- `android/app/build.gradle` : `applicationId "com.biume.mobile"`, `minSdk 28`.
- `android/app/src/main/AndroidManifest.xml` : permission `RECORD_AUDIO`, `screenOrientation="portrait"`, intent-filter du scheme `biume`.

- [ ] **Étape 5 : Rebrancher la passerelle monorepo**

Réécrire `apps/mobile/package.json` :

```json
{
  "name": "@biume/mobile",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "flutter test",
    "check-types": "flutter analyze",
    "build-runner": "dart run build_runner build --delete-conflicting-outputs",
    "ios": "flutter run -d ios",
    "android": "flutter run -d android",
    "dev": "flutter run"
  }
}
```

Flutter ne peut pas être membre du workspace Bun, mais cette passerelle garde `bun run test:mobile` et les filtres Turbo fonctionnels. Mettre à jour les scripts racine `ios:mobile`, `android:mobile` et `dev:mobile` s'ils invoquent encore Expo.

- [ ] **Étape 6 : Vérifier et valider**

```bash
cd apps/mobile && flutter pub get && flutter analyze && flutter test
cd ../.. && bun run test:mobile
rtk git add apps/mobile/ package.json
rtk git commit -m "feat(mobile): remplacer l'application expo par un socle flutter"
```

Attendu : SUCCÈS. `flutter test` passe sur le test généré par défaut.

- [ ] **Étape 7 : Ajouter Flutter à l'intégration continue**

Dans `.github/workflows/ci.yml`, ajouter un job `mobile` sur `ubuntu-latest` :

```yaml
  mobile:
    name: Analyse et tests Flutter
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - uses: actions/checkout@v4

      - uses: subosito/flutter-action@v2
        with:
          channel: stable
          cache: true

      - name: Installer les dépendances
        run: flutter pub get
        working-directory: apps/mobile

      - name: Générer le code
        run: dart run build_runner build --delete-conflicting-outputs
        working-directory: apps/mobile

      - name: Analyser
        run: flutter analyze
        working-directory: apps/mobile

      - name: Tester
        run: flutter test
        working-directory: apps/mobile
```

Pousser, ouvrir une pull request, vérifier avec `rtk gh pr checks`. Ne pas clore la tâche sur un job rouge.

```bash
rtk git add .github/workflows/ci.yml
rtk git commit -m "ci: analyser et tester l'application flutter"
```

---

### Tâche 2 : Palette et thème

**Fichiers :**
- Créer : `apps/mobile/lib/config/app_palette.dart`
- Créer : `apps/mobile/lib/config/app_theme.dart`
- Test : `apps/mobile/test/config/app_palette_test.dart`

**Interfaces :**
- Consomme : rien.
- Produit : `AppPalette` avec `AppPalette.light` et `AppPalette.dark`, `buildAppTheme(AppPalette)`.

Valeurs transposées de `packages/ui/src/styles/product.css`, vérifiées le 21 août 2026. Un test échoue si le CSS change sans que le Dart suive.

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `apps/mobile/test/config/app_palette_test.dart` :

```dart
import 'dart:io';

import 'package:biume_mobile/config/app_palette.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('palette', () {
    test('le violet d\'action est celui du produit', () {
      expect(AppPalette.light.primary, const Color(0xFF6A52D6));
    });

    test('le vert d\'état est celui du produit', () {
      expect(AppPalette.light.success, const Color(0xFF047857));
    });

    /// Le fond n'est jamais blanc : le blanc appartient aux surfaces posées
    /// dessus, sinon plus rien ne détache une carte de la page.
    test('le fond clair n\'est pas blanc', () {
      expect(AppPalette.light.background, isNot(const Color(0xFFFFFFFF)));
      expect(AppPalette.light.surface, const Color(0xFFFFFFFF));
    });

    test('le sombre est une vraie apparence, pas une inversion', () {
      expect(AppPalette.dark.primary, const Color(0xFFA996F2));
      expect(AppPalette.dark.onPrimary, const Color(0xFF140E2B));
    });
  });

  group('dérive avec le web', () {
    /// Garde-fou de la même famille que celui du contrat d'API : la palette
    /// existe en trois exemplaires, et seule la machine peut voir qu'ils
    /// divergent.
    test('les couleurs clés se retrouvent dans product.css', () {
      final css = File('../../packages/ui/src/styles/product.css').readAsStringSync();

      expect(css, contains('#6a52d6'));
      expect(css, contains('#047857'));
      expect(css, contains('#f9fafb'));
      expect(css, contains('#a996f2'));
    });
  });
}
```

- [ ] **Étape 2 : Lancer les tests et vérifier qu'ils échouent**

Commande : `cd apps/mobile && flutter test test/config/app_palette_test.dart`

Attendu : ÉCHEC, `app_palette.dart` introuvable.

- [ ] **Étape 3 : Écrire la palette**

Créer `apps/mobile/lib/config/app_palette.dart` :

```dart
import 'package:flutter/material.dart';

/// Transposition de `packages/ui/src/styles/product.css`, qui fait foi.
///
/// Le violet porte l'action qui fait avancer le praticien, le vert porte l'état
/// atteint. Un ton n'est pas un choix esthétique : il dit au praticien si on
/// attend quelque chose de lui ou si c'est réglé.
@immutable
class AppPalette {
  const AppPalette({
    required this.background,
    required this.surface,
    required this.surfaceMuted,
    required this.border,
    required this.borderStrong,
    required this.ink,
    required this.inkMuted,
    required this.inkSubtle,
    required this.primary,
    required this.onPrimary,
    required this.primaryPressed,
    required this.primarySurface,
    required this.primaryBorder,
    required this.success,
    required this.onSuccess,
    required this.successSurface,
    required this.successBorder,
    required this.warning,
    required this.onWarning,
    required this.warningSurface,
    required this.warningBorder,
    required this.danger,
    required this.onDanger,
    required this.dangerSurface,
    required this.dangerBorder,
    required this.recording,
  });

  final Color background;
  final Color surface;
  final Color surfaceMuted;
  final Color border;
  final Color borderStrong;
  final Color ink;
  final Color inkMuted;
  final Color inkSubtle;
  final Color primary;
  final Color onPrimary;
  final Color primaryPressed;
  final Color primarySurface;
  final Color primaryBorder;
  final Color success;
  final Color onSuccess;
  final Color successSurface;
  final Color successBorder;
  final Color warning;
  final Color onWarning;
  final Color warningSurface;
  final Color warningBorder;
  final Color danger;
  final Color onDanger;
  final Color dangerSurface;
  final Color dangerBorder;

  /// L'indicateur d'enregistrement en cours, distinct du rouge d'erreur : il
  /// dit « ça tourne », pas « ça a raté ».
  final Color recording;

  static const light = AppPalette(
    background: Color(0xFFF9FAFB),
    surface: Color(0xFFFFFFFF),
    surfaceMuted: Color(0xFFF8FAFC),
    border: Color(0xFFCBD5E1),
    borderStrong: Color(0xFF94A3B8),
    ink: Color(0xFF020617),
    inkMuted: Color(0xFF475569),
    inkSubtle: Color(0xFF64748B),
    primary: Color(0xFF6A52D6),
    onPrimary: Color(0xFFFFFFFF),
    primaryPressed: Color(0xFF5943BB),
    primarySurface: Color(0xFFF3F0FD),
    primaryBorder: Color(0xFFD8CFFA),
    success: Color(0xFF047857),
    onSuccess: Color(0xFFFFFFFF),
    successSurface: Color(0xFFECFDF5),
    successBorder: Color(0xFFA7F3D0),
    warning: Color(0xFFB45309),
    onWarning: Color(0xFFFFFFFF),
    warningSurface: Color(0xFFFFFBEB),
    warningBorder: Color(0xFFFDE68A),
    danger: Color(0xFFB91C1C),
    onDanger: Color(0xFFFFFFFF),
    dangerSurface: Color(0xFFFEF2F2),
    dangerBorder: Color(0xFFFECACA),
    recording: Color(0xFFB91C1C),
  );

  static const dark = AppPalette(
    background: Color(0xFF020617),
    surface: Color(0xFF0F172A),
    surfaceMuted: Color(0xFF16213B),
    border: Color(0xFF2F3F59),
    borderStrong: Color(0xFF4A5B75),
    ink: Color(0xFFF8FAFC),
    inkMuted: Color(0xFFCBD5E1),
    inkSubtle: Color(0xFF94A3B8),
    primary: Color(0xFFA996F2),
    onPrimary: Color(0xFF140E2B),
    primaryPressed: Color(0xFF8F79E8),
    primarySurface: Color(0xFF1C1A3A),
    primaryBorder: Color(0xFF3B3470),
    success: Color(0xFF34D399),
    onSuccess: Color(0xFF07271F),
    successSurface: Color(0xFF07271F),
    successBorder: Color(0xFF115E4A),
    warning: Color(0xFFFCD34D),
    onWarning: Color(0xFF2A2110),
    warningSurface: Color(0xFF2A2110),
    warningBorder: Color(0xFF78350F),
    danger: Color(0xFFFCA5A5),
    onDanger: Color(0xFF2A0D0D),
    dangerSurface: Color(0xFF2A1113),
    dangerBorder: Color(0xFF7F1D1D),
    recording: Color(0xFFFCA5A5),
  );
}
```

- [ ] **Étape 4 : Écrire le thème**

Créer `apps/mobile/lib/config/app_theme.dart` construisant un `ThemeData` depuis une `AppPalette`, avec `radius` de 14 pour les contrôles et 20 pour les cartes — les valeurs de `--radius` et `--radius-card`. Une surface est tenue par sa bordure, pas par son ombre : `elevation: 0` partout sauf sur ce qui flotte réellement.

- [ ] **Étape 5 : Lancer les tests et valider**

```bash
cd apps/mobile && flutter test test/config/
rtk git add apps/mobile/lib/config apps/mobile/test/config
rtk git commit -m "feat(mobile): transposer la palette du produit en dart"
```

Attendu : SUCCÈS, 5 tests.

---

### Tâche 3 : Résultat scellé et traduction des erreurs

Le `DataState` du dépôt de référence importe `DioException` : sa couche domaine dépend du client HTTP, et un timeout réseau y est indistinguable d'une erreur métier. Ce défaut n'est pas reproduit.

**Fichiers :**
- Créer : `apps/mobile/lib/core/failure.dart`
- Créer : `apps/mobile/lib/core/result.dart`
- Créer : `apps/mobile/lib/core/network/api_error.dart`
- Test : `apps/mobile/test/core/api_error_test.dart`

**Interfaces :**
- Consomme : `dio`.
- Produit :
  - `sealed class Failure` avec `NetworkFailure`, `AuthFailure`, `OrganizationRequiredFailure`, `NotFoundFailure`, `ConflictFailure`, `ValidationFailure`, `RateLimitedFailure`, `ServerFailure`, `UnknownFailure`, chacune portant `code`, `message` et `retryable`
  - `sealed class Result<T>` avec `Success<T>` et `Err<T>`
  - `Failure failureFromDioException(DioException error)`
  - `bool consumesAttempt(Failure failure)`

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `apps/mobile/test/core/api_error_test.dart` :

```dart
import 'package:biume_mobile/core/failure.dart';
import 'package:biume_mobile/core/network/api_error.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

DioException responseWith(int status, Map<String, dynamic> body) {
  final options = RequestOptions(path: '/captures');
  return DioException(
    requestOptions: options,
    response: Response(requestOptions: options, statusCode: status, data: body),
    type: DioExceptionType.badResponse,
  );
}

void main() {
  group('traduction des erreurs du serveur', () {
    test('lit le code normalisé du contrat', () {
      final failure = failureFromDioException(responseWith(409, {
        'code': 'active_organization_required',
        'message': 'Sélectionnez une entreprise.',
        'retryable': false,
      }));

      expect(failure, isA<OrganizationRequiredFailure>());
      expect(failure.retryable, isFalse);
    });

    test('respecte le caractère réessayable annoncé par le serveur', () {
      final failure = failureFromDioException(responseWith(503, {
        'code': 'storage_unavailable',
        'message': 'Stockage indisponible.',
        'retryable': true,
      }));

      expect(failure.retryable, isTrue);
    });

    test('traduit une coupure réseau', () {
      final failure = failureFromDioException(DioException(
        requestOptions: RequestOptions(path: '/captures'),
        type: DioExceptionType.connectionError,
      ));

      expect(failure, isA<NetworkFailure>());
      expect(failure.retryable, isTrue);
    });

    /// Le serveur peut renvoyer une page d'erreur d'infrastructure au lieu du
    /// contrat. L'application doit rester utilisable, pas planter.
    test('survit à un corps qui ne suit pas le contrat', () {
      final failure = failureFromDioException(responseWith(502, {'oops': true}));

      expect(failure, isA<ServerFailure>());
      expect(failure.message, isNotEmpty);
    });

    /// Une URL signée dans un message d'erreur finirait dans les journaux de
    /// plantage. Aucun message issu du transport ne doit remonter tel quel.
    test('ne laisse jamais remonter une url', () {
      final failure = failureFromDioException(DioException(
        requestOptions: RequestOptions(path: '/captures'),
        message: 'connexion à https://bucket.r2.example/abc?X-Amz-Signature=zzz échouée',
        type: DioExceptionType.connectionError,
      ));

      expect(failure.message, isNot(contains('http')));
      expect(failure.message, isNot(contains('Signature')));
    });
  });

  group('consommation de tentative', () {
    /// Ces échecs ne seront jamais résolus par une nouvelle tentative. Ils
    /// arrêtent la boucle et ne consomment aucune tentative — c'est la règle du
    /// serveur, l'application s'y conforme exactement.
    test('les échecs à intervention manuelle ne consomment rien', () {
      expect(consumesAttempt(const AuthFailure()), isFalse);
      expect(consumesAttempt(const OrganizationRequiredFailure()), isFalse);
      expect(consumesAttempt(const ValidationFailure()), isFalse);
      expect(consumesAttempt(const ConflictFailure()), isFalse);
    });

    test('un échec transitoire consomme une tentative', () {
      expect(consumesAttempt(const NetworkFailure()), isTrue);
      expect(consumesAttempt(const ServerFailure()), isTrue);
    });
  });
}
```

- [ ] **Étape 2 : Lancer les tests, écrire les modules, revalider**

```bash
cd apps/mobile && flutter test test/core/api_error_test.dart
```

Écrire `failure.dart`, `result.dart` et `api_error.dart`. Dans `failureFromDioException`, le message renvoyé vient **du contrat** quand le corps le fournit, et d'une table de messages français locaux sinon. Le `message` de `DioException` n'est jamais propagé.

Relancer jusqu'au vert, puis :

```bash
rtk git add apps/mobile/lib/core apps/mobile/test/core
rtk git commit -m "feat(mobile): traduire les erreurs http en failures de domaine"
```

Attendu : SUCCÈS, 7 tests.

---

### Tâche 4 : Enveloppe de chiffrement

Compatibilité binaire avec le serveur : le format est imposé, pas choisi.

**Fichiers :**
- Créer : `apps/mobile/lib/core/crypto/capture_envelope.dart`
- Test : `apps/mobile/test/core/capture_envelope_test.dart`

**Interfaces :**
- Consomme : `cryptography`.
- Produit :
  - `const captureEnvelopeMarker = 'BIUME1'`, `const captureNonceLength = 12`, `const captureKeyLength = 32`
  - `Future<Uint8List> encryptCapture({required List<int> key, required List<int> nonce, required String captureId, required List<int> plaintext})`
  - `Future<Uint8List> decryptCapture({required List<int> key, required String captureId, required List<int> envelope})`
  - `int? readEnvelopeVersion(List<int> envelope)`

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `apps/mobile/test/core/capture_envelope_test.dart` :

```dart
import 'dart:typed_data';

import 'package:biume_mobile/core/crypto/capture_envelope.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final key = Uint8List.fromList(List<int>.generate(32, (i) => i));
  final nonce = Uint8List.fromList(List<int>.generate(12, (i) => i * 2));
  const captureId = '6f1a6d5e-3f2b-4c1d-9a7e-2b8c4d5e6f70';
  final plaintext = Uint8List.fromList(List<int>.generate(256, (i) => i % 251));

  group('format d\'enveloppe', () {
    test('commence par le marqueur puis le nonce', () async {
      final envelope = await encryptCapture(
        key: key, nonce: nonce, captureId: captureId, plaintext: plaintext);

      expect(String.fromCharCodes(envelope.sublist(0, 6)), 'BIUME1');
      expect(envelope.sublist(6, 18), nonce);
    });

    test('fait un aller-retour', () async {
      final envelope = await encryptCapture(
        key: key, nonce: nonce, captureId: captureId, plaintext: plaintext);

      expect(await decryptCapture(key: key, captureId: captureId, envelope: envelope),
          plaintext);
    });

    test('reconnaît sa version', () async {
      final envelope = await encryptCapture(
        key: key, nonce: nonce, captureId: captureId, plaintext: plaintext);

      expect(readEnvelopeVersion(envelope), 1);
      expect(readEnvelopeVersion(Uint8List.fromList('AUTRE1'.codeUnits)), isNull);
    });
  });

  group('garde-fous', () {
    /// L'identifiant de capture est lié en données authentifiées : une
    /// enveloppe ne peut pas être déplacée sur une autre capture, même en
    /// détenant la clé.
    test('refuse de déchiffrer sous un autre identifiant', () async {
      final envelope = await encryptCapture(
        key: key, nonce: nonce, captureId: captureId, plaintext: plaintext);

      expect(
        () => decryptCapture(
          key: key,
          captureId: '00000000-0000-4000-8000-000000000000',
          envelope: envelope),
        throwsA(anything),
      );
    });

    test('refuse une clé qui ne fait pas 256 bits', () {
      expect(
        () => encryptCapture(
          key: Uint8List(16), nonce: nonce, captureId: captureId, plaintext: plaintext),
        throwsA(anything),
      );
    });

    test('refuse un nonce qui ne fait pas 96 bits', () {
      expect(
        () => encryptCapture(
          key: key, nonce: Uint8List(8), captureId: captureId, plaintext: plaintext),
        throwsA(anything),
      );
    });

    test('refuse une enveloppe dont le marqueur est inconnu', () {
      expect(
        () => decryptCapture(
          key: key, captureId: captureId, envelope: Uint8List(64)),
        throwsA(anything),
      );
    });

    test('refuse une enveloppe altérée', () async {
      final envelope = await encryptCapture(
        key: key, nonce: nonce, captureId: captureId, plaintext: plaintext);
      envelope[envelope.length - 1] ^= 0xFF;

      expect(
        () => decryptCapture(key: key, captureId: captureId, envelope: envelope),
        throwsA(anything),
      );
    });
  });
}
```

- [ ] **Étape 2 : Lancer les tests, écrire le module, revalider**

```bash
cd apps/mobile && flutter test test/core/capture_envelope_test.dart
```

Implémenter avec `AesGcm.with256bits()` du paquet `cryptography`, en passant l'identifiant de capture en `aad`. Disposition sur disque : marqueur, nonce, puis chiffré et tag concaténés — le tag doit suivre le chiffré, comme le fait `@noble/ciphers`, sans quoi le serveur ne pourra jamais relire une enveloppe.

```bash
rtk git add apps/mobile/lib/core/crypto apps/mobile/test/core
rtk git commit -m "feat(mobile): reproduire le format d'enveloppe BIUME1"
```

Attendu : SUCCÈS, 8 tests.

---

### Tâche 5 : Base locale drift

Deux besoins, deux politiques opposées dans une seule base : la **file de dictées** est durable et critique, le **cache de lecture** est jetable et reconstructible.

**Fichiers :**
- Créer : `apps/mobile/lib/core/database/app_database.dart`
- Créer : `apps/mobile/lib/core/database/tables.dart`
- Test : `apps/mobile/test/core/app_database_test.dart`

**Interfaces :**
- Consomme : `drift`.
- Produit : `AppDatabase` avec les tables `LocalCaptures`, `CachedAppointments`, `CachedPatients`, `CachedOwners`, et `clearReadCache()`.

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `apps/mobile/test/core/app_database_test.dart`, ouvrant la base en mémoire (`NativeDatabase.memory()`), avec au minimum :

```dart
void main() {
  late AppDatabase db;

  setUp(() => db = AppDatabase.forTesting(NativeDatabase.memory()));
  tearDown(() => db.close());

  test('conserve une dictée en file entre deux ouvertures', () async { /* ... */ });

  /// Le cache est jetable, la file ne l'est jamais. Vider le cache au retour
  /// du réseau ne doit pas pouvoir emporter une dictée non synchronisée.
  test('vider le cache ne touche pas la file de dictées', () async {
    await db.into(db.localCaptures).insert(/* une dictée en `queued` */);
    await db.into(db.cachedAppointments).insert(/* un rendez-vous */);

    await db.clearReadCache();

    expect(await db.select(db.localCaptures).get(), hasLength(1));
    expect(await db.select(db.cachedAppointments).get(), isEmpty);
  });

  test('émet un flux quand l\'agenda en cache change', () async { /* ... */ });

  test('refuse deux dictées avec le même identifiant', () async { /* ... */ });
}
```

Écrire les corps complets en suivant la documentation de drift pour les tests.

- [ ] **Étape 2 : Lancer les tests, écrire les tables, générer, revalider**

```bash
cd apps/mobile && dart run build_runner build --delete-conflicting-outputs && flutter test test/core/app_database_test.dart
rtk git add apps/mobile/lib/core/database apps/mobile/test/core
rtk git commit -m "feat(mobile): separer la file de dictees du cache de lecture"
```

---

### Tâche 6 : Authentification et navigation

**Fichiers :**
- Créer : `apps/mobile/lib/features/auth/**`
- Créer : `apps/mobile/lib/config/app_router.dart`
- Créer : `apps/mobile/lib/injection_container.dart`
- Test : `apps/mobile/test/features/auth/auth_cubit_test.dart`

**Interfaces :**
- Consomme : `Result`, `Failure` de la tâche 3 ; `flutter_secure_storage`.
- Produit :
  - `abstract class AuthRepository` avec `signIn`, `signOut`, `restoreSession`, `listOrganizations`, `setActiveOrganization`
  - `AuthCubit` avec les états `AuthInitial`, `AuthChecking`, `AuthUnauthenticated`, `AuthNeedsOrganization`, `AuthAuthenticated`
  - `GoRouter buildRouter(AuthCubit)`

L'application ne permet **pas** de créer un compte, n'affiche aucun tarif et ne propose aucun achat. Un abonnement inactif produit un état neutre.

- [ ] **Étape 1 : Écrire les tests qui échouent**

Créer `apps/mobile/test/features/auth/auth_cubit_test.dart` avec `bloc_test` et `mocktail` :

```dart
void main() {
  group('AuthCubit', () {
    blocTest<AuthCubit, AuthState>(
      'passe authentifié quand une entreprise est déjà active',
      /* ... */
    );

    /// Une session valide sans entreprise active n'est pas une session
    /// utilisable : toute lecture de données de patient l'exige.
    blocTest<AuthCubit, AuthState>(
      'demande de choisir une entreprise quand aucune n\'est active',
      /* ... */
    );

    blocTest<AuthCubit, AuthState>(
      'reste déconnecté sur identifiants refusés, sans détail technique',
      /* ... */
    );

    /// Le jeton est la seule chose qui protège des données de santé sur un
    /// téléphone qui peut être perdu.
    blocTest<AuthCubit, AuthState>(
      'efface le jeton du trousseau à la déconnexion',
      /* ... */
    );

    blocTest<AuthCubit, AuthState>(
      'restaure la session au démarrage depuis le trousseau',
      /* ... */
    );
  });
}
```

- [ ] **Étape 2 : Écrire la feature**

`AuthRemoteDataSource` en `retrofit` appelle `/api/auth/sign-in/email`, lit l'en-tête `set-auth-token`, et le range dans `flutter_secure_storage`. Un intercepteur `dio` ajoute `Authorization: Bearer` sur chaque requête et `Accept-Language: fr`.

Le `redirect` de `go_router` est branché sur le flux de `AuthCubit` : c'est la garde d'authentification en une dizaine de lignes.

- [ ] **Étape 3 : Écrire l'injection**

`injection_container.dart` enregistre tout à la main dans `get_it`. Chaque source de données distante est enregistrée **derrière son interface de domaine**, avec un commentaire indiquant si l'implémentation réelle ou la doublure est active — c'est ce qui permet de basculer un endpoint d'une ligne quand il atterrit.

- [ ] **Étape 4 : Lancer, vérifier sur appareil, valider**

```bash
cd apps/mobile && dart run build_runner build --delete-conflicting-outputs && flutter analyze && flutter test
flutter run
```

Se connecter avec un compte réel contre le serveur du plan 2, vérifier que la session survit à un redémarrage complet de l'application.

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): connecter le praticien et garder sa session"
```

---

### Tâche 7 : Agenda avec cache hors ligne

**Fichiers :**
- Créer : `apps/mobile/lib/features/agenda/**`
- Test : `apps/mobile/test/features/agenda/agenda_repository_test.dart`, `agenda_cubit_test.dart`

**Interfaces :**
- Consomme : `AppDatabase` de la tâche 5 ; les modèles générés du contrat.
- Produit : `AgendaRepository` avec `watchDay(DateTime)`, `refresh(DateTime)` ; `AgendaCubit`.

Le cache est en **lecture seule**. `watchDay` émet depuis drift, `refresh` remplit le cache. L'écran ne dépend jamais du réseau pour s'afficher.

- [ ] **Étape 1 : Écrire les tests qui échouent**

```dart
void main() {
  group('AgendaRepository', () {
    test('sert le cache immédiatement, sans attendre le réseau', () async { /* ... */ });

    test('remplace le cache du jour au rafraîchissement', () async { /* ... */ });

    /// Un praticien dans une écurie sans réseau doit savoir chez qui il va.
    /// Perdre l'agenda parce que la requête a échoué serait la pire panne
    /// possible pour ce produit.
    test('garde le cache quand le rafraîchissement échoue', () async { /* ... */ });

    test('n\'écrase pas le cache d\'un autre jour', () async { /* ... */ });
  });

  group('AgendaCubit', () {
    blocTest('affiche le cache puis la version rafraîchie', /* ... */);
    blocTest('signale l\'état hors ligne sans vider la liste', /* ... */);
    blocTest('dit qu\'il n\'y a pas de séance plutôt que d\'afficher un vide', /* ... */);
  });
}
```

- [ ] **Étape 2 : Écrire la feature, l'écran, vérifier hors ligne**

L'écran d'agenda reprend la table de décision du web : le couple (état de séance, état de compte rendu) détermine une **action unique**, dont le libellé dit le geste — « Préparer le compte rendu », « Créer le compte rendu », « Remplir le compte rendu », « Continuer le compte rendu », « Envoyer au propriétaire », « Voir le compte rendu ». Ne pas en inventer une seconde.

Vérifier sur appareil : charger l'agenda, activer le mode avion, tuer l'application, la rouvrir. L'agenda du jour doit s'afficher, avec un état hors ligne visible.

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): afficher l'agenda du jour meme sans reseau"
```

---

### Tâche 8 : Enregistrement de la dictée

C'est ici que le Bloc se justifie : transitions concurrentes réelles — appel entrant pendant une dictée, application suspendue par le système, coupure d'alimentation.

**Fichiers :**
- Créer : `apps/mobile/lib/features/capture/**`
- Test : `apps/mobile/test/features/capture/recording_bloc_test.dart`, `local_capture_test.dart`

**Interfaces :**
- Consomme : `encryptCapture` de la tâche 4 ; `AppDatabase` de la tâche 5 ; `record`.
- Produit :
  - `RecordingBloc` avec les états `Idle`, `Recording`, `Interrupted`, `Review`, `Saved`
  - `bool canTransitionLocal(LocalCaptureStatus from, LocalCaptureStatus to)`
  - `Duration computeBackoff(int attemptCount, double Function() random)`

- [ ] **Étape 1 : Écrire les tests qui échouent**

```dart
void main() {
  group('transitions locales', () {
    /// Valider une dictée est un acte délibéré du praticien : rien ne doit
    /// mettre en file un audio qu'il n'a jamais réécouté et accepté.
    test('seul review atteint queued', () {
      expect(canTransitionLocal(LocalCaptureStatus.review, LocalCaptureStatus.queued), isTrue);
      expect(canTransitionLocal(LocalCaptureStatus.recording, LocalCaptureStatus.queued), isFalse);
    });

    test('cancelled et expired sont terminaux', () { /* ... */ });
    test('uploading peut revenir en queued', () { /* ... */ });
  });

  group('temporisation', () {
    test('croît exponentiellement', () { /* ... */ });

    /// Aléa sur toute la fenêtre : des appareils tombés en panne ensemble ne
    /// doivent pas réessayer ensemble.
    test('reste entre la moitié et la totalité de la fenêtre', () { /* ... */ });

    test('plafonne à quinze minutes', () {
      expect(computeBackoff(20, () => 1.0), const Duration(minutes: 15));
    });
  });

  group('RecordingBloc', () {
    blocTest('passe en review à l\'arrêt', /* ... */);

    /// Une dictée perdue est inacceptable. Une interruption doit toujours
    /// laisser un fichier récupérable, jamais un état vide.
    blocTest('conserve la dictée quand un appel interrompt l\'enregistrement', /* ... */);

    blocTest('récupère une dictée interrompue au démarrage suivant', /* ... */);
    blocTest('refuse de dépasser dix minutes', /* ... */);
    blocTest('refuse de démarrer sans permission micro, en le disant', /* ... */);
  });
}
```

- [ ] **Étape 2 : Écrire la feature et vérifier sur appareil réel**

Vérifications obligatoires sur téléphone, pas en simulateur :

- démarrer une dictée, recevoir un appel, raccrocher : la dictée est récupérable ;
- démarrer une dictée, tuer l'application : la dictée est récupérable au démarrage suivant ;
- atteindre dix minutes : l'enregistrement s'arrête proprement et passe en relecture.

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): enregistrer et recuperer une dictee de seance"
```

---

### Tâche 9 : Moteur de synchronisation

**Fichiers :**
- Créer : `apps/mobile/lib/features/capture/domain/usecases/sync_captures.dart`
- Créer : `apps/mobile/lib/features/capture/data/upload_client.dart`
- Test : `apps/mobile/test/features/capture/sync_test.dart`

**Interfaces :**
- Consomme : `computeBackoff` et `canTransitionLocal` de la tâche 8 ; `consumesAttempt` de la tâche 3 ; `decryptCapture` de la tâche 4.
- Produit : `SyncCaptures` (UseCase, l'un des rares justifiés), `SyncBloc`.

Le chiffrement est **local seul** : la dictée est déchiffrée juste avant l'envoi, et les octets en clair partent vers l'URL présignée en TLS. C'est ce qui rend la transcription possible. Le PUT présigné passe par **`dio` nu** — c'est le seul endroit du projet où `retrofit` ne s'applique pas.

- [ ] **Étape 1 : Écrire les tests qui échouent**

```dart
void main() {
  group('moteur de synchronisation', () {
    test('déclare, obtient une url, envoie, confirme', () async { /* ... */ });

    /// La transcription serveur en dépend : envoyer les octets chiffrés
    /// rendrait l'audio illisible et casserait tout le parcours produit.
    test('déchiffre avant d\'envoyer', () async { /* ... */ });

    test('ne fait rien hors ligne, sans consommer de tentative', () async { /* ... */ });

    test('réessaie après un échec transitoire, avec temporisation', () async { /* ... */ });

    /// Ces échecs ne seront jamais résolus par une nouvelle tentative : ils
    /// arrêtent la boucle immédiatement et ne consomment aucune tentative.
    test('s\'arrête net sur un refus d\'authentification', () async { /* ... */ });

    test('passe en needs_action après cinq échecs', () async { /* ... */ });

    test('est idempotent : renvoyer la même dictée ne la duplique pas', () async { /* ... */ });

    test('purge les dictées expirées, y compris celles déjà marquées', () async { /* ... */ });

    /// Une url signée dans un journal survivrait à la purge des 24 heures et
    /// donnerait accès à l'audio.
    test('ne journalise jamais l\'url signée', () async { /* ... */ });
  });
}
```

- [ ] **Étape 2 : Écrire le moteur et le travail de fond**

Brancher `workmanager` côté Android et une `BGProcessingTask` côté iOS, déclarée dans `Info.plist` et enregistrée dans `AppDelegate`. **C'est le point identifié comme faible dès la conception** : lui allouer du temps réel, et le vérifier sur appareil plutôt que le supposer.

- [ ] **Étape 3 : Vérifier sur appareil réel**

- Enregistrer une dictée en mode avion, réactiver le réseau : elle part.
- Enregistrer, mettre l'application en arrière-plan, attendre : elle part sans réouverture.
- Couper le réseau en plein envoi : l'envoi reprend, sans doublon côté serveur.

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): synchroniser les dictees avec reprise et purge"
```

---

### Tâche 10 : Correction de la transcription

**Fichiers :**
- Créer : `apps/mobile/lib/features/transcript/**`
- Test : `apps/mobile/test/features/transcript/transcript_cubit_test.dart`

**Interfaces :**
- Consomme : les endpoints du plan 3.
- Produit : `TranscriptRepository`, `TranscriptCubit`.

C'est **la seule saisie de texte libre de l'application**. Le praticien corrige la source ; il ne corrige pas le dérivé.

- [ ] **Étape 1 : Écrire les tests qui échouent**

```dart
void main() {
  group('TranscriptCubit', () {
    blocTest('affiche la transcription prête', /* ... */);
    blocTest('attend pendant que la transcription est en cours', /* ... */);

    /// Une dictée inaudible dit ce qui s'est passé et propose de réenregistrer.
    /// Elle ne montre jamais un texte vide sans explication.
    blocTest('explique une dictée inaudible', /* ... */);

    blocTest('enregistre la correction et passe à l\'état corrigé', /* ... */);
    blocTest('garde la saisie locale quand l\'enregistrement échoue', /* ... */);
    blocTest('empêche de corriger une transcription non prête', /* ... */);
  });
}
```

- [ ] **Étape 2 : Écrire la feature et vérifier**

L'écran affiche le texte dans un champ multiligne, avec un bouton d'enregistrement unique. Aucune sauvegarde automatique silencieuse : le praticien doit savoir ce qui est enregistré.

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): corriger la transcription avant toute interpretation"
```

---

### Tâche 11 : Validation du rapport prérempli

**Fichiers :**
- Créer : `apps/mobile/lib/features/report/**`
- Test : `apps/mobile/test/features/report/report_cubit_test.dart`, `report_screen_test.dart`

**Interfaces :**
- Consomme : les endpoints du plan 4.
- Produit : `ReportRepository`, `ReportCubit`, `ReportScreen`.

Le mobile **valide, il n'édite pas**. Chaque proposition offre trois gestes et trois seulement : confirmer, écarter, voir la source. La section anatomique est en lecture seule, avec un renvoi vers le web.

- [ ] **Étape 1 : Écrire les tests qui échouent**

```dart
void main() {
  group('ReportCubit', () {
    blocTest('affiche les propositions groupées par section', /* ... */);
    blocTest('confirme une proposition et met la section à jour', /* ... */);
    blocTest('écarte une proposition sans la supprimer de la vue', /* ... */);
    blocTest('marque une section entière sans objet', /* ... */);

    /// « proposed » ne veut rien dire pour un ostéopathe. « À vérifier » lui dit
    /// quoi faire.
    blocTest('n\'expose jamais un état machine à l\'écran', /* ... */);

    blocTest('n\'autorise la finalisation que quand tout est décidé', /* ... */);

    /// La traçabilité rendue visible : le praticien doit pouvoir vérifier d'où
    /// vient chaque phrase avant de l'envoyer au propriétaire.
    blocTest('retrouve le passage de transcription d\'une proposition', /* ... */);
  });

  group('ReportScreen', () {
    testWidgets('affiche l\'anatomie en lecture seule avec un renvoi au web', /* ... */);
    testWidgets('n\'offre aucun champ de saisie de texte libre', /* ... */);
    testWidgets('avertit avant de régénérer que seules les propositions en attente changent', /* ... */);
  });
}
```

- [ ] **Étape 2 : Écrire la feature et vérifier sur appareil**

Vérifier le parcours complet sur téléphone : dictée, transcription, correction, propositions, validation, partage. **C'est le parcours signature du produit ;** le chronométrer et consigner le temps actif dans le document de spécification.

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): valider un compte rendu prerempli sans l'editer"
```

---

### Tâche 12 : Suivis actionnables, notifications et télémétrie

**Fichiers :**
- Créer : `apps/mobile/lib/features/followup/**`
- Créer : `apps/mobile/lib/core/notifications/local_notifications.dart`
- Créer : `apps/mobile/lib/core/telemetry/telemetry.dart`
- Test : miroirs dans `test/`

**Interfaces :**
- Consomme : les endpoints du plan 5 ; `flutter_local_notifications` ; `posthog_flutter`.
- Produit : `FollowUpRepository`, `FollowUpCubit`, `LocalNotifications`, `Telemetry`.

Notifications **locales seules**, pour les deux déclencheurs que le téléphone connaît sans serveur : dictée non synchronisée, brouillon en attente. Aucun événement passif ne notifie.

La télémétrie porte un **identifiant de parcours** de la capture jusqu'au brouillon : sans lui, la métrique « temps médian entre la fin de séance et le brouillon prêt » est impossible à reconstituer, puisqu'elle traverse le téléphone et le serveur.

- [ ] **Étape 1 : Écrire les tests qui échouent**

```dart
void main() {
  group('notifications locales', () {
    test('notifie une dictée non synchronisée', () async { /* ... */ });
    test('notifie un brouillon en attente', () async { /* ... */ });

    /// Une notification pour une réussite est du bruit. Le praticien
    /// désactiverait tout, y compris ce qui compte.
    test('ne notifie jamais une synchronisation réussie', () async { /* ... */ });

    test('ne notifie pas deux fois la même dictée', () async { /* ... */ });
  });

  group('télémétrie', () {
    test('porte l\'identifiant de parcours de la capture au brouillon', () async { /* ... */ });

    /// Aucun nom, aucune note, aucune url signée, aucun audio ne doit pouvoir
    /// atteindre un outil d'analyse.
    test('ne transporte que des champs techniques', () async { /* ... */ });

    test('n\'échoue pas quand l\'envoi d\'événement échoue', () async { /* ... */ });
  });

  group('FollowUpCubit', () {
    blocTest('ne liste que ce qui demande une action', /* ... */);
    blocTest('fait disparaître un suivi une fois traité', /* ... */);
    blocTest('dit le motif en français, jamais son code', /* ... */);
  });
}
```

- [ ] **Étape 2 : Écrire les features et vérifier**

```bash
rtk git add apps/mobile/
rtk git commit -m "feat(mobile): traiter les suivis, notifier et mesurer le parcours"
```

---

### Tâche 13 : Vérification finale et distribution

- [ ] **Étape 1 : Faire tourner toute la chaîne**

```bash
cd apps/mobile && dart run build_runner build --delete-conflicting-outputs && flutter analyze && flutter test
cd ../.. && bun run check-types && bun --filter @biume/web test
rtk gh pr checks
```

Attendu : SUCCÈS partout, job vert.

- [ ] **Étape 2 : Vérifier le parcours signature de bout en bout, sur appareil**

Sur un téléphone réel, avec un compte réel et un vrai animal dans les données :

1. se connecter ;
2. ouvrir un rendez-vous du jour ;
3. **couper le réseau** ;
4. dicter une minute ;
5. valider la dictée en relecture ;
6. **rétablir le réseau** et vérifier que la dictée part sans réouverture de l'application ;
7. lire la transcription, la corriger ;
8. valider les propositions du rapport ;
9. partager ;
10. programmer un suivi.

**Chronométrer le temps actif** entre la fin de la dictée et le brouillon prêt à relire, et le consigner dans le document de spécification, section 13.

- [ ] **Étape 3 : Vérifier ce qui doit être absent**

- Aucun tarif, aucun bouton d'achat, aucune création de compte nulle part.
- Aucun champ de saisie de texte libre en dehors de la correction de transcription.
- Aucune couleur codée en dur : `rtk grep -n "Color(0xFF" apps/mobile/lib` ne doit rien retourner en dehors de `app_palette.dart`.
- Aucune URL ni jeton dans les journaux : `flutter run` puis parcours complet, en lisant la console.

- [ ] **Étape 4 : Retirer le plugin Expo côté serveur**

L'application Expo n'existe plus. Dans `packages/auth/src/index.ts`, retirer `expo()` et son import, retirer `@better-auth/expo` des dépendances, et adapter le test de la tâche 1 du plan 2 : il attendait explicitement la présence du plugin pendant la transition.

```bash
bun --filter @biume/auth test
bun run check-types
rtk git add packages/auth/ bun.lock
rtk git commit -m "chore(auth): retirer le plugin expo, l'application flutter l'a remplace"
```

- [ ] **Étape 5 : Construire et distribuer**

```bash
cd apps/mobile
flutter build ipa --release
flutter build appbundle --release
```

Envoyer sur TestFlight via Transporter, et sur Play Internal Testing. Pour cinq ostéopathes en pilote privé, la distribution manuelle suffit ; l'automatiser avant d'avoir un utilisateur serait du travail sans retour.

- [ ] **Étape 6 : Valider**

```bash
rtk git add docs/superpowers/specs/
rtk git commit -m "docs: consigner la verification du parcours signature sur appareil"
```

---

## Critères d'acceptation du plan

- `apps/mobile` ne contient plus une ligne de TypeScript, et `bun run test:mobile` fait tourner `flutter test`.
- Une dictée enregistrée sans réseau part toute seule au retour du réseau, application en arrière-plan, sans doublon côté serveur.
- Une dictée survit à un appel entrant et à une fermeture forcée de l'application.
- L'enveloppe produite par Dart est déchiffrable côté serveur : marqueur `BIUME1`, nonce de 12 octets, identifiant de capture en données authentifiées.
- Cinq échecs transitoires font passer une dictée en `needs_action` ; un refus d'authentification l'y fait passer immédiatement, sans consommer de tentative.
- L'agenda du jour s'affiche sans réseau, et un rafraîchissement échoué ne le vide pas.
- Aucun champ de saisie de texte libre n'existe en dehors de la correction de transcription.
- Aucune couleur n'est codée en dur hors de `app_palette.dart`, et un test échoue si `product.css` change sans que le Dart suive.
- Aucun état machine n'est visible à l'écran : le praticien lit « À vérifier », jamais `proposed`.
- Aucun journal, aucun événement de télémétrie et aucune exception ne contient d'URL signée, de nom de client ou de contenu de note.
- Le temps actif entre la fin de la dictée et le brouillon prêt à relire a été mesuré sur appareil réel et consigné.
