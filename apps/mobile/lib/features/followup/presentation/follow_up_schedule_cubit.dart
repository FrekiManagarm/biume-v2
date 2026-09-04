import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/result.dart';
import '../../../core/telemetry/journey_events.dart';
import '../../../core/telemetry/telemetry.dart';
import '../domain/follow_up_questionnaire.dart';
import '../domain/follow_up_repository.dart';

/// Sentinelle distincte de `null` : elle permet à [FollowUpScheduleState.copyWith]
/// de distinguer « ne pas toucher au message » de « effacer le message ».
const Object _unset = Object();

@immutable
class FollowUpScheduleState {
  const FollowUpScheduleState({
    required this.dueAt,
    this.busy = false,
    this.message,
    this.done = false,
    this.declined = false,
  });

  final DateTime dueAt;
  final bool busy;
  final String? message;
  final bool done;
  final bool declined;

  FollowUpScheduleState copyWith({
    DateTime? dueAt,
    bool? busy,
    Object? message = _unset,
    bool? done,
    bool? declined,
  }) {
    return FollowUpScheduleState(
      dueAt: dueAt ?? this.dueAt,
      busy: busy ?? this.busy,
      message: identical(message, _unset) ? this.message : message as String?,
      done: done ?? this.done,
      declined: declined ?? this.declined,
    );
  }

  @override
  bool operator ==(Object other) =>
      other is FollowUpScheduleState &&
      other.dueAt == dueAt &&
      other.busy == busy &&
      other.message == message &&
      other.done == done &&
      other.declined == declined;

  @override
  int get hashCode => Object.hash(dueAt, busy, message, done, declined);
}

/// Le suivi est **proposé, jamais imposé** : programmer et refuser sont deux
/// gestes également légitimes, et refuser ne déclenche aucun appel réseau.
class FollowUpScheduleCubit extends Cubit<FollowUpScheduleState> {
  FollowUpScheduleCubit(
    this._repository, {
    required this.reportId,
    required DateTime Function() now,
    String? journeyId,
    Telemetry? telemetry,
  }) : _now = now,
       // L'identifiant de parcours est celui de la capture, porté par la
       // route depuis l'écran de compte rendu. Sans lui — un compte rendu
       // créé sur le web, par exemple — le parcours retombe sur
       // l'identifiant de rapport, seul disponible à ce stade.
       _journeyId = (journeyId == null || journeyId.isEmpty)
           ? reportId
           : journeyId,
       _telemetry = telemetry ?? Telemetry(),
       super(
         FollowUpScheduleState(
           dueAt: now().add(const Duration(days: followUpDefaultDelayDays)),
         ),
       );

  final FollowUpRepository _repository;
  final String reportId;
  final String _journeyId;
  final DateTime Function() _now;
  final Telemetry _telemetry;

  /// Le plancher est métier : un questionnaire envoyé le lendemain ne mesure
  /// rien. Une date hors bornes est ignorée, l'échéance précédente reste —
  /// l'application ne se met jamais dans un état invalide.
  void chooseDate(DateTime dueAt) {
    final min = _now().add(const Duration(days: followUpMinDelayDays));
    final max = _now().add(const Duration(days: followUpMaxDelayDays));
    if (dueAt.isBefore(min) || dueAt.isAfter(max)) return;
    emit(state.copyWith(dueAt: dueAt));
  }

  Future<void> schedule() async {
    emit(state.copyWith(busy: true, message: null));

    final result = await _repository.schedule(reportId, state.dueAt);
    // Le praticien reste libre de quitter cet écran pendant l'attente :
    // `BlocProvider` ferme alors le cubit avant que la requête ne revienne.
    // Émettre sur un cubit fermé lève un `StateError` que personne
    // n'attraperait ici.
    if (isClosed) return;
    switch (result) {
      case Success():
        _telemetry.emit(
          ProductEvent(
            name: JourneyEvents.followUpScheduled,
            journeyId: _journeyId,
            properties: {'reportId': reportId},
          ),
        );
        emit(state.copyWith(busy: false, done: true));
      case Err(:final failure):
        emit(state.copyWith(busy: false, message: failure.message));
    }
  }

  /// Refuser est un geste légitime : toutes les séances n'appellent pas un
  /// suivi. Aucun appel réseau — il n'y a rien à annuler côté serveur, rien
  /// n'a jamais été programmé.
  ///
  /// C'est un événement à part entière, distinct de la programmation : un
  /// praticien qui refuse explicitement n'est pas un praticien qui abandonne,
  /// et la mesure d'activation perdrait cette distinction sans lui.
  void decline() {
    _telemetry.emit(
      ProductEvent(
        name: JourneyEvents.followUpDeclined,
        journeyId: _journeyId,
        properties: {'reportId': reportId},
      ),
    );
    emit(state.copyWith(done: true, declined: true));
  }
}
