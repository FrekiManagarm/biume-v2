/// Le micro, derrière une interface.
///
/// Le domaine ne connaît ni `record` ni le système de fichiers : c'est ce qui
/// rend la machine à états testable sans micro, et c'est aussi ce qui permet de
/// la vérifier sur les scénarios qu'on ne peut pas provoquer à la demande —
/// appel entrant, application tuée, disque plein.
abstract class AudioRecorder {
  /// `false` quand le praticien a refusé le micro. Ce n'est pas une panne :
  /// l'écran doit le dire et proposer d'ouvrir les réglages.
  Future<bool> hasPermission();

  Future<void> start(String filePath);

  /// Retourne le chemin du fichier produit, ou `null` si rien n'a été capté.
  Future<String?> stop();

  /// Abandonne et supprime le fichier en cours.
  Future<void> cancel();

  Future<bool> isRecording();

  /// Le niveau capté, entre 0 et 1, tant que l'enregistrement tourne.
  ///
  /// L'écran de dictée en fait des barres. Sans mesure réelle, elles
  /// bougeraient de la même façon micro coupé : le praticien croirait
  /// enregistrer alors que rien n'entre.
  Stream<double> amplitude();

  Future<void> dispose();
}

/// Où les dictées vivent sur l'appareil, et ce que l'application sait faire de
/// leurs octets.
abstract class CaptureFiles {
  /// Chemin d'un nouveau fichier de dictée, dossier créé si besoin.
  Future<String> pathFor(String captureId);

  Future<int> sizeOf(String path);

  /// Empreinte du fichier **en clair**, telle que le serveur l'attend pour
  /// vérifier qu'il a reçu exactement ce qui a été enregistré.
  Future<String> sha256Of(String path);

  /// Chiffre le fichier sur place et retourne le chemin de l'enveloppe.
  Future<String> encryptInPlace(String path, String captureId);

  /// Déchiffre l'enveloppe et retourne les octets clairs, prêts à partir.
  Future<List<int>> readDecrypted(String path, String captureId);

  Future<void> delete(String path);

  Future<bool> exists(String path);
}
