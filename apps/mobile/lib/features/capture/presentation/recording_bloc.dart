// Les champs sont privés et les paramètres nommés publics : Dart n'autorise pas
// les paramètres formels d'initialisation sur un champ privé, et rendre ces
// champs publics exposerait les dépendances internes.
// ignore_for_file: prefer_initializing_formals

import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../domain/audio_recorder.dart';

/// Durée maximale d'une dictée, imposée par le contrat serveur.
const Duration captureMaxDuration = Duration(minutes: 10);

@immutable
sealed class RecordingEvent {
  const RecordingEvent();
}

class RecordingStarted extends RecordingEvent {
  const RecordingStarted({required this.appointmentId});
  final String? appointmentId;
}

class RecordingStopped extends RecordingEvent {
  const RecordingStopped();
}

/// Le système a suspendu l'enregistrement — appel entrant, réveil d'une autre
/// application, coupure audio. La dictée déjà captée est conservée.
class RecordingInterrupted extends RecordingEvent {
  const RecordingInterrupted();
}

class RecordingTicked extends RecordingEvent {
  const RecordingTicked(this.elapsed);
  final Duration elapsed;
}

class RecordingAccepted extends RecordingEvent {
  const RecordingAccepted();
}

class RecordingDiscarded extends RecordingEvent {
  const RecordingDiscarded();
}

@immutable
sealed class RecordingState {
  const RecordingState();
}

class RecordingIdle extends RecordingState {
  const RecordingIdle();
  @override
  bool operator ==(Object other) => other is RecordingIdle;
  @override
  int get hashCode => 0;
}

class RecordingPreparing extends RecordingState {
  const RecordingPreparing();
  @override
  bool operator ==(Object other) => other is RecordingPreparing;
  @override
  int get hashCode => 1;
}

class RecordingPermissionDenied extends RecordingState {
  const RecordingPermissionDenied();
  @override
  bool operator ==(Object other) => other is RecordingPermissionDenied;
  @override
  int get hashCode => 2;
}

class RecordingInProgress extends RecordingState {
  const RecordingInProgress({required this.elapsed});
  final Duration elapsed;

  Duration get remaining => captureMaxDuration - elapsed;
}

/// La dictée est captée mais **pas encore en file**. Seule une validation
/// explicite du praticien l'y met.
class RecordingReview extends RecordingState {
  const RecordingReview({
    required this.filePath,
    required this.duration,
    required this.interrupted,
  });

  final String filePath;
  final Duration duration;

  /// Vrai quand l'enregistrement a été coupé par le système plutôt que par le
  /// praticien : l'écran doit le dire, pour qu'il sache pourquoi c'est court.
  final bool interrupted;
}

class RecordingSaving extends RecordingState {
  const RecordingSaving();
}

class RecordingSaved extends RecordingState {
  const RecordingSaved(this.captureId);
  final String captureId;
}

class RecordingFailed extends RecordingState {
  const RecordingFailed(this.message);
  final String message;
}

/// Ce qui part vers la file une fois le praticien d'accord.
@immutable
class RecordedCapture {
  const RecordedCapture({
    required this.id,
    required this.appointmentId,
    required this.durationMs,
    required this.byteSize,
    required this.sha256,
    required this.filePath,
    required this.createdAt,
  });

  final String id;
  final String? appointmentId;
  final int durationMs;
  final int byteSize;
  final String sha256;
  final String filePath;
  final DateTime createdAt;
}

/// Un Bloc et non un Cubit, parce qu'il y a de vraies transitions concurrentes :
/// un appel entrant pendant une dictée, le système qui suspend l'application,
/// la durée maximale atteinte pendant que le praticien s'apprête à valider.
/// Un Cubit y ferait écrire une machine à états implicite et fragile.
class RecordingBloc extends Bloc<RecordingEvent, RecordingState> {
  RecordingBloc({
    required AudioRecorder recorder,
    required CaptureFiles files,
    required Future<void> Function(RecordedCapture) onSaved,
    required DateTime Function() now,
    required String Function() newId,
  }) : _recorder = recorder,
       _files = files,
       _onSaved = onSaved,
       _now = now,
       _newId = newId,
       super(const RecordingIdle()) {
    on<RecordingStarted>(_onStarted);
    on<RecordingStopped>(_onStopped);
    on<RecordingInterrupted>(_onInterrupted);
    on<RecordingTicked>(_onTicked);
    on<RecordingAccepted>(_onAccepted);
    on<RecordingDiscarded>(_onDiscarded);
  }

  final AudioRecorder _recorder;
  final CaptureFiles _files;
  final Future<void> Function(RecordedCapture) _onSaved;
  final DateTime Function() _now;
  final String Function() _newId;

  String? _captureId;
  String? _appointmentId;
  DateTime? _startedAt;

  /// Le niveau capté, tel quel. Il ne passe pas par un état : à dix mesures
  /// par seconde, il ferait reconstruire tout l'écran pour animer vingt-sept
  /// barres, et rendrait la machine à états illisible pour ce qu'elle a de
  /// vraiment concurrent.
  Stream<double> get amplitude => _recorder.amplitude();

  Future<void> _onStarted(
    RecordingStarted event,
    Emitter<RecordingState> emit,
  ) async {
    emit(const RecordingPreparing());

    if (!await _recorder.hasPermission()) {
      emit(const RecordingPermissionDenied());
      return;
    }

    _captureId = _newId();
    _appointmentId = event.appointmentId;
    _startedAt = _now();

    try {
      await _recorder.start(await _files.pathFor(_captureId!));
      emit(const RecordingInProgress(elapsed: Duration.zero));
    } catch (_) {
      emit(
        const RecordingFailed(
          "L'enregistrement n'a pas pu démarrer. Réessayez.",
        ),
      );
    }
  }

  Future<void> _onStopped(
    RecordingStopped event,
    Emitter<RecordingState> emit,
  ) => _finish(emit, interrupted: false);

  Future<void> _onInterrupted(
    RecordingInterrupted event,
    Emitter<RecordingState> emit,
  ) => _finish(emit, interrupted: true);

  Future<void> _onTicked(
    RecordingTicked event,
    Emitter<RecordingState> emit,
  ) async {
    if (state is! RecordingInProgress) return;

    if (event.elapsed >= captureMaxDuration) {
      await _finish(emit, interrupted: false);
      return;
    }

    emit(RecordingInProgress(elapsed: event.elapsed));
  }

  /// Ferme l'enregistrement et passe en relecture.
  ///
  /// Une interruption produit exactement le même état qu'un arrêt volontaire :
  /// la dictée déjà captée est conservée et reste récupérable. Perdre ce que le
  /// praticien vient de dire serait la pire panne de ce produit.
  Future<void> _finish(
    Emitter<RecordingState> emit, {
    required bool interrupted,
  }) async {
    final startedAt = _startedAt;
    if (startedAt == null) return;

    try {
      final path = await _recorder.stop();
      if (path == null) {
        emit(const RecordingFailed('Aucun son n\'a été capté.'));
        return;
      }

      emit(
        RecordingReview(
          filePath: path,
          duration: _now().difference(startedAt),
          interrupted: interrupted,
        ),
      );
    } catch (_) {
      emit(
        const RecordingFailed(
          "L'enregistrement s'est interrompu. Le fichier peut être récupérable.",
        ),
      );
    }
  }

  Future<void> _onAccepted(
    RecordingAccepted event,
    Emitter<RecordingState> emit,
  ) async {
    final current = state;
    final captureId = _captureId;
    if (current is! RecordingReview || captureId == null) return;

    emit(const RecordingSaving());

    try {
      final byteSize = await _files.sizeOf(current.filePath);
      // L'empreinte porte sur le clair : c'est ce que le serveur vérifie pour
      // savoir qu'il a reçu exactement ce qui a été enregistré.
      final sha256 = await _files.sha256Of(current.filePath);
      final encrypted = await _files.encryptInPlace(
        current.filePath,
        captureId,
      );

      await _onSaved(
        RecordedCapture(
          id: captureId,
          appointmentId: _appointmentId,
          durationMs: current.duration.inMilliseconds,
          byteSize: byteSize,
          sha256: sha256,
          filePath: encrypted,
          createdAt: _now(),
        ),
      );

      emit(RecordingSaved(captureId));
    } catch (_) {
      emit(
        const RecordingFailed(
          "La dictée n'a pas pu être enregistrée. Elle est toujours sur "
          "l'appareil, réessayez.",
        ),
      );
    }
  }

  Future<void> _onDiscarded(
    RecordingDiscarded event,
    Emitter<RecordingState> emit,
  ) async {
    final current = state;
    if (current is! RecordingReview) return;

    // Une dictée jetée ne laisse aucun octet sur l'appareil : c'est de la
    // donnée de santé sur un téléphone qui peut être perdu.
    await _files.delete(current.filePath);
    emit(const RecordingIdle());
  }

  @override
  Future<void> close() async {
    await _recorder.dispose();
    return super.close();
  }
}
