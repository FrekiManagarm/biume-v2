import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../injection_container.dart';
import '../domain/actionable_follow_up_repository.dart';
import 'follow_up_cubit.dart';
import 'follow_up_screen.dart';

/// Câble le cubit depuis l'injection.
///
/// Son propre cubit, et non celui de l'accueil : cet écran s'ouvre aussi
/// depuis une notification, application fermée, sans qu'aucun accueil n'ait
/// jamais chargé quoi que ce soit.
class FollowUpPage extends StatelessWidget {
  const FollowUpPage({required this.followUpId, super.key});

  final String followUpId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) =>
          FollowUpCubit(getIt<ActionableFollowUpRepository>())..load(),
      child: FollowUpScreen(followUpId: followUpId),
    );
  }
}
