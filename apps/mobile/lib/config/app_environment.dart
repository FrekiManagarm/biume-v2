/// Adresse du serveur, passée au build plutôt que codée en dur.
///
///   flutter run --dart-define=BIUME_API_URL=http://localhost:3000
///   flutter run --dart-define-from-file=dart_define/local.json
///
/// Sans l'un de ces flags, l'app pointe vers la prod (voir defaultValue
/// ci-dessous) — voir dart_define/local.json.example pour le dev local.
const String biumeApiUrl = String.fromEnvironment(
  'BIUME_API_URL',
  defaultValue: 'https://biume.app',
);

/// Clé de projet PostHog, passée au build. Vide en développement : le puits
/// reste alors la console, et aucun événement ne quitte le téléphone.
const String biumePosthogKey = String.fromEnvironment('BIUME_POSTHOG_KEY');

/// Hôte PostHog. L'instance européenne par défaut : les événements de parcours
/// d'un cabinet français n'ont pas à traverser l'Atlantique.
const String biumePosthogHost = String.fromEnvironment(
  'BIUME_POSTHOG_HOST',
  defaultValue: 'https://eu.i.posthog.com',
);
