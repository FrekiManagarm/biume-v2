import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/telemetry/telemetry.dart';
import '../../../injection_container.dart';
import '../../capture/domain/capture_store.dart';
import '../domain/transcript_repository.dart';
import 'transcript_cubit.dart';
import 'transcript_screen.dart';

/// Câble le cubit depuis l'injection et déclenche le chargement.
///
/// Séparée de l'écran présentationnel pour que celui-ci reste testable sans
/// conteneur d'injection — et pour qu'un oubli de câblage se voie.
class TranscriptPage extends StatelessWidget {
  const TranscriptPage({
    required this.captureId,
    required this.needsPatient,
    required this.appointmentId,
    super.key,
  });

  final String captureId;
  final bool needsPatient;
  final String? appointmentId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => TranscriptCubit(
        getIt<TranscriptRepository>(),
        getIt<CaptureStore>(),
        telemetry: getIt<Telemetry>(),
      )..load(captureId),
      child: TranscriptScreen(
        captureId: captureId,
        needsPatient: needsPatient,
        appointmentId: appointmentId,
      ),
    );
  }
}
