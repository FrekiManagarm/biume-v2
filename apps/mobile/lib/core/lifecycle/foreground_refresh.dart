import 'dart:async';

import 'package:flutter/widgets.dart';

import '../../features/agenda/domain/agenda_repository.dart';
import '../../features/capture/domain/sync_engine.dart';
import '../../features/records/domain/patient_repository.dart';
import '../../injection_container.dart';

/// Ce qui doit être à jour avant d'être sur le terrain : la file part, le
/// cache des animaux se remplit, la fenêtre d'agenda se rafraîchit. Appelé à
/// la connexion, à chaque retour au premier plan, et après toute écriture
/// qui change l'agenda (prise ou déplacement d'une séance) — jamais à la
/// demande d'un simple affichage.
Future<void> refreshForeground() async {
  final today = DateTime.now();
  final windowStart = DateTime.utc(today.year, today.month, today.day);
  final windowEnd = windowStart.add(const Duration(days: 8));

  await Future.wait<void>([
    getIt<SyncEngine>().runOnce().then((_) {}),
    getIt<PatientRepository>().refresh().then((_) {}),
    getIt<AgendaRepository>().refreshWindow(windowStart, windowEnd).then((
      _,
    ) {}),
  ]);
}

class ForegroundRefresh with WidgetsBindingObserver {
  ForegroundRefresh({required this.onForeground});

  final Future<void> Function() onForeground;

  void start() => WidgetsBinding.instance.addObserver(this);
  void stop() => WidgetsBinding.instance.removeObserver(this);

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) unawaited(onForeground());
  }
}
