import 'dart:async';

import 'package:collection/collection.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/result.dart';
import '../domain/agenda_repository.dart';
import '../domain/appointment.dart';

@immutable
sealed class AgendaState {
  const AgendaState();
}

class AgendaInitial extends AgendaState {
  const AgendaInitial();

  @override
  bool operator ==(Object other) => other is AgendaInitial;

  @override
  int get hashCode => 0;
}

class AgendaLoading extends AgendaState {
  const AgendaLoading();

  @override
  bool operator ==(Object other) => other is AgendaLoading;

  @override
  int get hashCode => 1;
}

class AgendaLoaded extends AgendaState {
  const AgendaLoaded({
    required this.day,
    required this.appointments,
    this.offlineMessage,
  });

  final DateTime day;
  final List<Appointment> appointments;

  /// Non nul quand le dernier rafraîchissement a échoué. La liste reste
  /// affichée : ce message dit « ces données peuvent dater », pas « il n'y a
  /// rien ».
  final String? offlineMessage;

  bool get isEmpty => appointments.isEmpty;

  @override
  bool operator ==(Object other) =>
      other is AgendaLoaded &&
      other.day == day &&
      other.offlineMessage == offlineMessage &&
      const ListEquality<Appointment>().equals(
        other.appointments,
        appointments,
      );

  @override
  int get hashCode => Object.hash(
    2,
    day,
    offlineMessage,
    const ListEquality<Appointment>().hash(appointments),
  );
}

/// Cubit et non Bloc : afficher un jour et le rafraîchir n'a pas de transitions
/// concurrentes.
class AgendaCubit extends Cubit<AgendaState> {
  AgendaCubit(this._repository) : super(const AgendaInitial());

  final AgendaRepository _repository;
  StreamSubscription<List<Appointment>>? _subscription;
  DateTime? _day;

  // `isClosed` ne devient vrai qu'à l'exécution de `super.close()`, et notre
  // `close()` l'appelle en dernier, après avoir attendu l'annulation de
  // `_subscription`. Une réponse qui arrive pendant cette attente verrait
  // encore `isClosed` à `false` et passerait la garde. Ce drapeau, posé au
  // tout début de `close()`, couvre cette fenêtre : toute garde doit le lire
  // en plus de `isClosed`. Les deux gestes qui démontent ce cubit en pleine
  // requête — changer d'entreprise, se déconnecter — passent par là.
  bool _closing = false;

  bool get _shuttingDown => isClosed || _closing;

  Future<void> load(DateTime day) async {
    _day = day;
    emit(const AgendaLoading());

    // Le cache est branché avant le réseau : l'écran s'affiche même hors
    // ligne, et se met à jour tout seul quand le rafraîchissement écrit.
    await _subscription?.cancel();
    _subscription = _repository.watchDay(day).listen((appointments) {
      if (_shuttingDown || _day != day) return;
      final current = state;
      emit(
        AgendaLoaded(
          day: day,
          appointments: appointments,
          offlineMessage: current is AgendaLoaded
              ? current.offlineMessage
              : null,
        ),
      );
    });

    final result = await _repository.refresh(day);
    if (result case Err(:final failure)) {
      if (_shuttingDown || _day != day) return;
      final current = state;
      emit(
        AgendaLoaded(
          day: day,
          appointments: current is AgendaLoaded
              ? current.appointments
              : const [],
          offlineMessage: failure.message,
        ),
      );
    }
  }

  @override
  Future<void> close() async {
    // Posé avant la moindre annulation : c'est ce qui ferme la fenêtre entre
    // le début de `close()` et l'exécution de `super.close()`, pendant
    // laquelle `isClosed` mentirait encore.
    _closing = true;
    await _subscription?.cancel();
    return super.close();
  }
}
