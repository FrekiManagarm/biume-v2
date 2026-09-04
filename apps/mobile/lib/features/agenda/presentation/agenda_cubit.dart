// Les champs sont privés et les paramètres nommés publics : Dart n'autorise pas
// les paramètres formels d'initialisation sur un champ privé, et rendre ces
// champs publics exposerait les dépendances internes.
// ignore_for_file: prefer_initializing_formals

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

/// Les séances d'un seul jour de la fenêtre, groupées côté cubit. Le jour est
/// toujours présent, même sans séance : c'est une information pour un
/// praticien qui organise sa tournée, pas un vide à masquer.
class AgendaDay {
  const AgendaDay({required this.day, required this.appointments});

  final DateTime day;
  final List<Appointment> appointments;

  bool get isEmpty => appointments.isEmpty;

  @override
  bool operator ==(Object other) =>
      other is AgendaDay &&
      other.day == day &&
      const ListEquality<Appointment>().equals(
        other.appointments,
        appointments,
      );

  @override
  int get hashCode => Object.hash(
    day,
    const ListEquality<Appointment>().hash(appointments),
  );
}

class AgendaLoaded extends AgendaState {
  const AgendaLoaded({required this.days, this.offlineMessage});

  /// Toujours huit éléments : aujourd'hui puis les sept jours suivants.
  final List<AgendaDay> days;

  /// Non nul quand le dernier rafraîchissement a échoué. La fenêtre reste
  /// affichée : ce message dit « ces données peuvent dater », pas « il n'y a
  /// rien ».
  final String? offlineMessage;

  @override
  bool operator ==(Object other) =>
      other is AgendaLoaded &&
      other.offlineMessage == offlineMessage &&
      const ListEquality<AgendaDay>().equals(other.days, days);

  @override
  int get hashCode => Object.hash(
    2,
    offlineMessage,
    const ListEquality<AgendaDay>().hash(days),
  );
}

/// Réponse à `showDay` pour un jour choisi par le sélecteur de date : montrée
/// dans une feuille modale, sans remplacer la fenêtre affichée en-dessous.
class AgendaDayLoaded extends AgendaState {
  const AgendaDayLoaded({
    required this.day,
    required this.appointments,
    required this.request,
  });

  final DateTime day;
  final List<Appointment> appointments;

  /// Le rang de la demande qui a produit cet état. Il entre dans l'égalité :
  /// sans lui, rechoisir deux fois de suite la même date émettrait un état
  /// identique au précédent, le cubit ne notifierait rien, et la feuille ne
  /// se rouvrirait pas — le neuvième jour devenait inatteignable au deuxième
  /// essai.
  final int request;

  @override
  bool operator ==(Object other) =>
      other is AgendaDayLoaded &&
      other.request == request &&
      other.day == day &&
      const ListEquality<Appointment>().equals(
        other.appointments,
        appointments,
      );

  @override
  int get hashCode => Object.hash(
    3,
    request,
    day,
    const ListEquality<Appointment>().hash(appointments),
  );
}

/// Un jour hors fenêtre dont la lecture directe a échoué.
class AgendaDayUnavailable extends AgendaState {
  const AgendaDayUnavailable({required this.message, required this.request});

  final String message;

  /// Même raison que dans `AgendaDayLoaded` : réessayer la même date qui
  /// échoue doit redire le message, pas se taire.
  final int request;

  @override
  bool operator ==(Object other) =>
      other is AgendaDayUnavailable &&
      other.request == request &&
      other.message == message;

  @override
  int get hashCode => Object.hash(4, request, message);
}

/// Cubit de l'écran d'accueil : la fenêtre de huit jours (aujourd'hui et les
/// sept suivants) tient dans un seul état, et un jour choisi hors fenêtre par
/// le sélecteur de date est une réponse ponctuelle, sans perdre cette
/// fenêtre.
class AgendaCubit extends Cubit<AgendaState> {
  AgendaCubit(this._repository, {DateTime Function() now = DateTime.now})
    : _now = now,
      super(const AgendaInitial());

  final AgendaRepository _repository;
  final DateTime Function() _now;
  StreamSubscription<List<Appointment>>? _subscription;
  DateTime? _windowStart;
  AgendaLoaded? _lastLoaded;

  /// Incrémenté à chaque `showDay` : c'est ce qui distingue deux réponses
  /// identiques pour la même date, et fait rouvrir la feuille.
  int _dayRequests = 0;

  static const _windowLength = Duration(days: 8);

  // `isClosed` ne devient vrai qu'à l'exécution de `super.close()`, et notre
  // `close()` l'appelle en dernier, après avoir attendu l'annulation de
  // `_subscription`. Une réponse qui arrive pendant cette attente verrait
  // encore `isClosed` à `false` et passerait la garde. Ce drapeau, posé au
  // tout début de `close()`, couvre cette fenêtre : toute garde doit le lire
  // en plus de `isClosed`. Les deux gestes qui démontent ce cubit en pleine
  // requête — changer d'entreprise, se déconnecter — passent par là.
  bool _closing = false;

  bool get _shuttingDown => isClosed || _closing;

  DateTime _dateOnly(DateTime value) =>
      DateTime(value.year, value.month, value.day);

  Future<void> load(DateTime today) async {
    if (_shuttingDown) return;

    final localStart = _dateOnly(today);
    final windowStart = DateTime.utc(today.year, today.month, today.day);
    final windowEnd = windowStart.add(_windowLength);
    _windowStart = localStart;
    emit(const AgendaLoading());

    // Le cache est branché avant le réseau : l'écran s'affiche même hors
    // ligne, et se met à jour tout seul quand le rafraîchissement écrit.
    await _subscription?.cancel();
    _subscription = _repository.watchWindow(windowStart, windowEnd).listen((
      appointments,
    ) {
      if (_shuttingDown || _windowStart != localStart) return;
      final loaded = AgendaLoaded(
        days: _groupByDay(localStart, appointments),
        offlineMessage: _lastLoaded?.offlineMessage,
      );
      _lastLoaded = loaded;
      emit(loaded);
    });

    final result = await _repository.refreshWindow(windowStart, windowEnd);
    if (result case Err(:final failure)) {
      if (_shuttingDown || _windowStart != localStart) return;
      final loaded = AgendaLoaded(
        days: _lastLoaded?.days ?? _groupByDay(localStart, const []),
        offlineMessage: failure.message,
      );
      _lastLoaded = loaded;
      emit(loaded);
    }
  }

  /// Un jour dans la fenêtre est déjà dans `_lastLoaded` : pas de nouvelle
  /// lecture. Un jour hors fenêtre est lu directement, sans passer par le
  /// cache et sans y écrire.
  Future<void> showDay(DateTime day) async {
    if (_shuttingDown) return;

    final target = _dateOnly(day);
    final today = _dateOnly(_now());
    final windowEnd = today.add(_windowLength);
    final request = ++_dayRequests;

    if (!target.isBefore(today) && target.isBefore(windowEnd)) {
      final match = _lastLoaded?.days.firstWhereOrNull(
        (candidate) => candidate.day == target,
      );
      if (match != null) {
        emit(
          AgendaDayLoaded(
            day: match.day,
            appointments: match.appointments,
            request: request,
          ),
        );
        return;
      }
    }

    final result = await _repository.fetchDay(target);
    if (_shuttingDown) return;
    switch (result) {
      case Success(:final value):
        emit(
          AgendaDayLoaded(day: target, appointments: value, request: request),
        );
      case Err(:final failure):
        emit(
          AgendaDayUnavailable(message: failure.message, request: request),
        );
    }
  }

  List<AgendaDay> _groupByDay(
    DateTime localStart,
    List<Appointment> appointments,
  ) {
    return List.generate(8, (index) {
      final day = localStart.add(Duration(days: index));
      final dayAppointments =
          appointments.where((appointment) {
              final local = appointment.beginAt.toLocal();
              return local.year == day.year &&
                  local.month == day.month &&
                  local.day == day.day;
            }).toList()
            ..sort((a, b) => a.beginAt.compareTo(b.beginAt));
      return AgendaDay(day: day, appointments: dayAppointments);
    });
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
