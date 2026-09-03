import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/ids/uuid.dart';
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
  const RecordingPage({this.appointmentId, super.key});

  final String? appointmentId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => RecordingBloc(
        recorder: getIt<AudioRecorder>(),
        files: getIt<CaptureFiles>(),
        now: DateTime.now,
        newId: uuidV4,
        onSaved: (capture) async {
          await getIt<CaptureStore>().create(
            id: capture.id,
            appointmentId: capture.appointmentId,
            durationMs: capture.durationMs,
            byteSize: capture.byteSize,
            sha256: capture.sha256,
            filePath: capture.filePath,
            createdAt: capture.createdAt,
            expiresAt: computeExpiry(capture.createdAt),
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
