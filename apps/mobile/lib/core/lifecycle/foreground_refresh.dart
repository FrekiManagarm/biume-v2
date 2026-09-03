import 'dart:async';

import 'package:flutter/widgets.dart';

import '../../features/capture/domain/sync_engine.dart';
import '../../features/records/domain/patient_repository.dart';
import '../../injection_container.dart';

/// Ce qui doit être à jour avant d'être sur le terrain : la file part, le cache
/// des animaux se remplit. Appelé à la connexion et à chaque retour au premier
/// plan, jamais à la demande depuis un écran.
Future<void> refreshForeground() async {
  await Future.wait<void>([
    getIt<SyncEngine>().runOnce().then((_) {}),
    getIt<PatientRepository>().refresh().then((_) {}),
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
