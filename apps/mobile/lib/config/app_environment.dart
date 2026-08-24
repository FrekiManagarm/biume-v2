/// Adresse du serveur, passée au build plutôt que codée en dur.
///
///   flutter run --dart-define=BIUME_API_URL=http://localhost:3000
const String biumeApiUrl = String.fromEnvironment(
  'BIUME_API_URL',
  defaultValue: 'https://biume.app',
);
