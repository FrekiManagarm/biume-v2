import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/telemetry/telemetry.dart';
import '../../../injection_container.dart';
import '../domain/follow_up_repository.dart';
import 'follow_up_schedule_cubit.dart';
import 'follow_up_schedule_screen.dart';

/// Câble le cubit depuis l'injection.
///
/// Séparée de l'écran présentationnel pour que celui-ci reste testable sans
/// conteneur d'injection — et pour qu'un oubli de câblage se voie.
class FollowUpSchedulePage extends StatelessWidget {
  const FollowUpSchedulePage({
    required this.reportId,
    this.captureId,
    super.key,
  });

  final String reportId;

  /// Identifiant de parcours de télémétrie, porté par la route depuis
  /// l'écran de compte rendu (`?capture=`). Absent pour un compte rendu créé
  /// sur le web : le cubit retombe alors sur l'identifiant de rapport.
  final String? captureId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => FollowUpScheduleCubit(
        getIt<FollowUpRepository>(),
        reportId: reportId,
        journeyId: captureId,
        now: DateTime.now,
        telemetry: getIt<Telemetry>(),
      ),
      child: const FollowUpScheduleScreen(),
    );
  }
}
