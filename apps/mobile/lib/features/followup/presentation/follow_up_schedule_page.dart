import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../injection_container.dart';
import '../domain/follow_up_repository.dart';
import 'follow_up_schedule_cubit.dart';
import 'follow_up_schedule_screen.dart';

/// Câble le cubit depuis l'injection.
///
/// Séparée de l'écran présentationnel pour que celui-ci reste testable sans
/// conteneur d'injection — et pour qu'un oubli de câblage se voie.
class FollowUpSchedulePage extends StatelessWidget {
  const FollowUpSchedulePage({required this.reportId, super.key});

  final String reportId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => FollowUpScheduleCubit(
        getIt<FollowUpRepository>(),
        reportId: reportId,
        now: DateTime.now,
      ),
      child: const FollowUpScheduleScreen(),
    );
  }
}
