import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/ids/uuid.dart';
import '../../../core/telemetry/journey_events.dart';
import '../../../core/telemetry/telemetry.dart';
import '../../../injection_container.dart';
import '../domain/audio_recorder.dart';
import '../domain/capture_store.dart';
import '../../../core/database/app_database.dart';
import '../domain/local_capture_rules.dart';
import '../domain/sync_engine.dart';
import 'recording_bloc.dart';
import 'recording_screen.dart';

/// Câble le Bloc et déclenche la synchronisation dès qu'une dictée est validée.
///
/// Séparé de l'écran pour que celui-ci reste testable sans conteneur
/// d'injection — et pour qu'un oubli de câblage se voie.
class RecordingPage extends StatelessWidget {
  const RecordingPage({this.appointmentId, this.patientId, super.key});

  final String? appointmentId;
  final String? patientId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => RecordingBloc(
        recorder: getIt<AudioRecorder>(),
        files: getIt<CaptureFiles>(),
        now: DateTime.now,
        newId: uuidV4,
        onSaved: (capture) async {
          // Premier moment du parcours : c'est l'identifiant de cette
          // capture qui relie, ensuite, la validation de la transcription,
          // l'extraction, la finalisation et le suivi.
          getIt<Telemetry>().emit(
            ProductEvent(
              name: JourneyEvents.dictationSaved,
              journeyId: capture.id,
              properties: {
                'durationMs': capture.durationMs,
                'byteSize': capture.byteSize,
              },
            ),
          );

          await getIt<CaptureStore>().create(
            id: capture.id,
            appointmentId: capture.appointmentId,
            durationMs: capture.durationMs,
            byteSize: capture.byteSize,
            sha256: capture.sha256,
            filePath: capture.filePath,
            createdAt: capture.createdAt,
            expiresAt: computeExpiry(capture.createdAt),
            patientId: patientId,
          );

          // La dictée entre en file dès sa validation, puis part si le réseau
          // le permet. Sans réseau, elle attend — et rien n'est perdu.
          await getIt<CaptureStore>().transition(
            capture.id,
            LocalCaptureStatus.queued,
          );
          unawaited(getIt<SyncEngine>().runOnce());
        },
      ),
      child: RecordingScreen(appointmentId: appointmentId),
    );
  }
}
