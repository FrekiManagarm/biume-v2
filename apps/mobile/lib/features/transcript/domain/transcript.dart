import 'package:flutter/foundation.dart';

/// États d'une transcription, imposés par le contrat serveur.
enum TranscriptStatus { pending, running, ready, corrected, inaudible, failed }

TranscriptStatus transcriptStatusFrom(String value) => switch (value) {
  'pending' => TranscriptStatus.pending,
  'running' => TranscriptStatus.running,
  'ready' => TranscriptStatus.ready,
  'corrected' => TranscriptStatus.corrected,
  'inaudible' => TranscriptStatus.inaudible,
  _ => TranscriptStatus.failed,
};

@immutable
class Transcript {
  const Transcript({
    required this.captureId,
    required this.status,
    required this.text,
  });

  final String captureId;
  final TranscriptStatus status;
  final String text;

  /// Le praticien corrige la source, jamais le dérivé. Il ne peut le faire que
  /// sur un texte réellement produit.
  bool get isCorrectable =>
      status == TranscriptStatus.ready || status == TranscriptStatus.corrected;

  bool get isPending =>
      status == TranscriptStatus.pending || status == TranscriptStatus.running;

  @override
  bool operator ==(Object other) =>
      other is Transcript &&
      other.captureId == captureId &&
      other.status == status &&
      other.text == text;

  @override
  int get hashCode => Object.hash(captureId, status, text);
}
