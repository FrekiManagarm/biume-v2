import 'dart:async';

import 'package:collection/collection.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/database/app_database.dart';
import '../../../core/result.dart';
import '../../capture/domain/capture_store.dart';
import '../domain/todo_api.dart';
import '../domain/todo_item.dart';

@immutable
class TodoState {
  const TodoState({required this.items, this.offlineMessage});

  final List<TodoItem> items;

  /// Non nul quand le dernier rafraîchissement a échoué. La liste reste
  /// affichée : ce message dit « ces données peuvent dater », pas « il n'y a
  /// rien ».
  final String? offlineMessage;

  @override
  bool operator ==(Object other) =>
      other is TodoState &&
      other.offlineMessage == offlineMessage &&
      const ListEquality<TodoItem>().equals(other.items, items);

  @override
  int get hashCode =>
      Object.hash(offlineMessage, const ListEquality<TodoItem>().hash(items));
}

/// Ce qui attend un geste : dictées locales non envoyées en tête, puis ce que
/// le serveur signale. Cubit et non Bloc : afficher la liste et la
/// rafraîchir n'a pas de transitions concurrentes.
class TodoCubit extends Cubit<TodoState> {
  TodoCubit(
    this._store,
    this._api, {
    this.pollInterval = const Duration(seconds: 10),
    DateTime Function()? now,
  }) : _now = now ?? DateTime.now,
       super(const TodoState(items: []));

  final CaptureStore _store;
  final TodoApi _api;
  final Duration pollInterval;
  final DateTime Function() _now;

  /// La fenêtre pendant laquelle la marque locale « Biume prépare le compte
  /// rendu » l'emporte sur ce que dit le serveur, le temps qu'il reflète
  /// l'extraction lancée par « Valider la transcription ».
  static const preparingWindow = Duration(minutes: 2);

  List<LocalCapture> _local = const [];
  List<TodoItem> _remote = const [];
  StreamSubscription<List<LocalCapture>>? _subscription;
  Timer? _timer;

  // `isClosed` ne devient vrai qu'à l'exécution de `super.close()`, et notre
  // `close()` l'appelle en dernier, après avoir attendu l'annulation de
  // `_subscription`. Une réponse qui arrive pendant cette attente verrait
  // encore `isClosed` à `false` et passerait la garde. Ce drapeau, posé au
  // tout début de `close()`, couvre cette fenêtre : toute garde doit le lire
  // en plus de `isClosed`.
  bool _closing = false;

  bool get _shuttingDown => isClosed || _closing;

  void start() {
    _subscription = _store.watchAll().listen((rows) {
      if (_shuttingDown) return;
      _local = rows;
      _publish(state.offlineMessage);
    });
    unawaited(refresh());
  }

  Future<void> refresh() async {
    final result = await _api.list();
    if (_shuttingDown) return;
    switch (result) {
      case Success(:final value):
        _remote = value;
        _publish(null);
      case Err(:final failure):
        _publish(failure.message);
    }

    _timer?.cancel();
    // On ne réinterroge à intervalle court que si quelque chose est « en
    // cours » : sinon le retour au premier plan suffit, et un téléphone qui
    // interroge le serveur sans raison vide sa batterie dans une journée de
    // tournée.
    if (!_shuttingDown &&
        state.items.any(
          (i) => i.kind == TodoKind.transcribing || i.kind == TodoKind.preparing,
        )) {
      _timer = Timer(pollInterval, () {
        if (!_shuttingDown) unawaited(refresh());
      });
    }
  }

  void _publish(String? offlineMessage) {
    if (_shuttingDown) return;

    final now = _now();
    final requestedAt = {
      for (final c in _local)
        if (c.extractionRequestedAt != null) c.id: c.extractionRequestedAt!,
    };

    // Les dictées locales non envoyées passent en tête : ce sont les seules
    // dont le praticien peut faire quelque chose sans réseau.
    final local = _local
        .where(
          (c) =>
              c.status == LocalCaptureStatus.queued ||
              c.status == LocalCaptureStatus.uploading ||
              c.status == LocalCaptureStatus.needsAction,
        )
        .map(
          (c) => TodoItem(
            kind: c.status == LocalCaptureStatus.needsAction
                ? TodoKind.uploadBlocked
                : TodoKind.pendingUpload,
            captureId: c.id,
            appointmentId: c.appointmentId,
            updatedAt: c.createdAt,
          ),
        );

    final remote = _remote.map((item) {
      final at = requestedAt[item.captureId];
      final preparing =
          item.kind == TodoKind.transcriptToReview &&
          at != null &&
          now.difference(at) < preparingWindow;
      return preparing ? item.copyWith(kind: TodoKind.preparing) : item;
    });

    emit(TodoState(items: [...local, ...remote], offlineMessage: offlineMessage));
  }

  @override
  Future<void> close() async {
    // Posé avant la moindre annulation : c'est ce qui ferme la fenêtre entre
    // le début de `close()` et l'exécution de `super.close()`, pendant
    // laquelle `isClosed` mentirait encore.
    _closing = true;
    _timer?.cancel();
    await _subscription?.cancel();
    return super.close();
  }
}
