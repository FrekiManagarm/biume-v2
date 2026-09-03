import 'package:flutter/foundation.dart';

/// Ce qui attend un geste du praticien, ou ce que Biume est en train de
/// faire pour lui. `pendingUpload` et `uploadBlocked` n'existent que côté
/// mobile : ce sont des dictées encore en file locale, jamais vues par le
/// serveur.
enum TodoKind {
  pendingUpload,
  uploadBlocked,
  toAttach,
  transcribing,
  transcriptToReview,
  inaudible,
  transcriptionFailed,
  preparing,
  reportToValidate,
  readyToSend,
}

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

/// Traduit le genre renvoyé par le serveur. Une valeur inconnue ne doit
/// jamais faire planter l'application : elle retombe sur `transcribing`,
/// l'état le plus neutre — « Biume s'en occupe » — plutôt que de lever.
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
  const TodoItem({
    required this.kind,
    required this.captureId,
    required this.updatedAt,
    this.reportId,
    this.appointmentId,
    this.patientName,
  });

  final TodoKind kind;
  final String captureId;
  final String? reportId;
  final String? appointmentId;
  final String? patientName;
  final DateTime updatedAt;

  String get label => todoLabels[kind]!;

  /// L'écran qui répond au geste. `null` quand il n'y a rien à ouvrir —
  /// l'élément dit seulement ce qui se passe.
  String? get route => switch (kind) {
    TodoKind.pendingUpload || TodoKind.uploadBlocked => null,
    TodoKind.toAttach =>
      '/dictees/$captureId/transcription?rattacher=1${appointmentId == null ? '' : '&rdv=$appointmentId'}',
    TodoKind.transcriptToReview ||
    TodoKind.inaudible ||
    TodoKind.transcriptionFailed =>
      '/dictees/$captureId/transcription${appointmentId == null ? '' : '?rdv=$appointmentId'}',
    TodoKind.transcribing => null,
    TodoKind.preparing || TodoKind.reportToValidate || TodoKind.readyToSend =>
      reportId == null ? null : '/comptes-rendus/$reportId',
  };

  TodoItem copyWith({TodoKind? kind}) => TodoItem(
    kind: kind ?? this.kind,
    captureId: captureId,
    updatedAt: updatedAt,
    reportId: reportId,
    appointmentId: appointmentId,
    patientName: patientName,
  );

  // `captureId` seul ne suffit pas à identifier ce qu'affiche l'élément : son
  // genre change au cours de sa vie (`transcriptToReview` devient
  // `preparing`, par exemple), et deux publications avec le même
  // `captureId` mais un genre différent sont deux états visuels distincts.
  // Comparer sur chaque champ est ce qui laisse `Cubit.emit` déduplique
  // correctement deux publications réellement identiques.
  @override
  bool operator ==(Object other) =>
      other is TodoItem &&
      other.kind == kind &&
      other.captureId == captureId &&
      other.reportId == reportId &&
      other.appointmentId == appointmentId &&
      other.patientName == patientName &&
      other.updatedAt == updatedAt;

  @override
  int get hashCode => Object.hash(
    kind,
    captureId,
    reportId,
    appointmentId,
    patientName,
    updatedAt,
  );
}
