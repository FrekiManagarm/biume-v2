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
