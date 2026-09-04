import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/failure.dart';
import '../../../core/result.dart';
import '../../records/domain/patient.dart';
import '../domain/appointment.dart';
import '../domain/appointment_write_repository.dart';

/// Sentinelle distincte de `null` : elle permet à [AppointmentFormState.copyWith]
/// de distinguer « ne pas toucher au champ » de « l'effacer ».
const Object _unset = Object();

/// Dit hors ligne, plutôt que la panne réseau brute : un praticien dans une
/// écurie doit savoir tout de suite que la création est impossible, et ce
/// qui reste possible en attendant.
const String appointmentOfflineCreateMessage =
    'Sans réseau, la séance ne peut pas être créée. Vous pouvez dicter dès '
    'maintenant et rattacher ensuite.';

const String appointmentOfflineMoveMessage =
    'Sans réseau, la séance ne peut pas être déplacée. Vous pouvez dicter '
    'dès maintenant et rattacher ensuite.';

/// Les durées proposées par le sélecteur de l'écran, en minutes.
const List<int> appointmentDurationOptionsMinutes = [30, 45, 60, 90];

@immutable
class AppointmentFormState {
  const AppointmentFormState({
    this.patient,
    required this.day,
    required this.start,
    required this.duration,
    this.atHome = false,
    this.busy = false,
    this.message,
    this.offline = false,
    this.saved,
  });

  final Patient? patient;
  final DateTime day;
  final TimeOfDay start;
  final Duration duration;
  final bool atHome;
  final bool busy;

  /// Ce que le praticien lit quand quelque chose a empêché la soumission.
  /// `null` une fois le champ corrigé ou une nouvelle tentative lancée.
  final String? message;

  /// Distingue une panne réseau — la seule pour laquelle l'écran propose de
  /// dicter en attendant — d'un autre échec, affiché sans ce geste de repli.
  final bool offline;

  /// Renseigné une fois l'écriture réussie. L'écran bascule alors sur la
  /// confirmation, conflits compris : ils ne sont jamais montrés avant.
  final AppointmentWriteOutcome? saved;

  AppointmentFormState copyWith({
    Object? patient = _unset,
    DateTime? day,
    TimeOfDay? start,
    Duration? duration,
    bool? atHome,
    bool? busy,
    Object? message = _unset,
    bool? offline,
    Object? saved = _unset,
  }) {
    return AppointmentFormState(
      patient: identical(patient, _unset) ? this.patient : patient as Patient?,
      day: day ?? this.day,
      start: start ?? this.start,
      duration: duration ?? this.duration,
      atHome: atHome ?? this.atHome,
      busy: busy ?? this.busy,
      message: identical(message, _unset) ? this.message : message as String?,
      offline: offline ?? this.offline,
      saved: identical(saved, _unset)
          ? this.saved
          : saved as AppointmentWriteOutcome?,
    );
  }

  @override
  bool operator ==(Object other) =>
      other is AppointmentFormState &&
      other.patient == patient &&
      other.day == day &&
      other.start == start &&
      other.duration == duration &&
      other.atHome == atHome &&
      other.busy == busy &&
      other.message == message &&
      other.offline == offline &&
      other.saved == saved;

  @override
  int get hashCode => Object.hash(
    patient,
    day,
    start,
    duration,
    atHome,
    busy,
    message,
    offline,
    saved,
  );
}

/// Prend ou déplace une séance. Cinq champs, dont trois déjà remplis en
/// déplacement (le jour, l'heure et la durée viennent de la séance
/// existante) : seul le nouveau créneau se redemande, jamais une nouvelle
/// durée.
///
/// Cubit et non Bloc : un formulaire à cinq champs et une soumission n'a pas
/// de transitions concurrentes.
class AppointmentFormCubit extends Cubit<AppointmentFormState> {
  AppointmentFormCubit(
    this._repository, {
    Appointment? existing,
    Patient? initialPatient,
    required DateTime Function() now,
  }) : _existing = existing,
       super(_seed(now(), existing: existing, initialPatient: initialPatient));

  final AppointmentWriteRepository _repository;

  /// Non nul en déplacement. `submit()` appelle alors `move` plutôt que
  /// `create`, et conserve la durée de la séance plutôt que d'en redemander
  /// une.
  final Appointment? _existing;

  // `isClosed` ne devient vrai qu'à l'exécution de `super.close()`, et notre
  // `close()` l'appelle en dernier. Une réponse de `submit()` qui arrive
  // pendant cette fenêtre verrait encore `isClosed` à `false` et passerait
  // la garde. Ce drapeau, posé au tout début de `close()`, couvre cette
  // fenêtre : toute garde doit le lire en plus de `isClosed`.
  bool _closing = false;

  bool get _shuttingDown => isClosed || _closing;

  /// Vu de l'écran : quels champs se masquent, quel libellé prend le
  /// bouton, quelle phrase confirme l'écriture.
  bool get isMove => _existing != null;

  static AppointmentFormState _seed(
    DateTime now, {
    required Appointment? existing,
    required Patient? initialPatient,
  }) {
    final begin = existing?.beginAt.toLocal() ?? now;
    return AppointmentFormState(
      patient: initialPatient,
      day: DateTime(begin.year, begin.month, begin.day),
      start: TimeOfDay(hour: begin.hour, minute: begin.minute),
      duration: existing != null
          ? existing.endAt.difference(existing.beginAt)
          : const Duration(hours: 1),
    );
  }

  /// En création, remplace la durée provisoire par celle de la dernière
  /// séance du cache. En déplacement, la durée est déjà fixée par la séance
  /// existante — rien à charger.
  Future<void> start() async {
    if (_shuttingDown || _existing != null) return;
    final duration = await _repository.defaultDuration();
    if (_shuttingDown) return;
    emit(state.copyWith(duration: duration));
  }

  void choosePatient(Patient patient) {
    if (_shuttingDown) return;
    emit(state.copyWith(patient: patient, message: null, offline: false));
  }

  void chooseDay(DateTime day) {
    if (_shuttingDown) return;
    emit(
      state.copyWith(
        day: DateTime(day.year, day.month, day.day),
        message: null,
        offline: false,
      ),
    );
  }

  void chooseStart(TimeOfDay start) {
    if (_shuttingDown) return;
    emit(state.copyWith(start: start, message: null, offline: false));
  }

  /// Sans effet en déplacement : la durée de la séance existante n'est
  /// jamais redemandée.
  void chooseDuration(Duration duration) {
    if (_shuttingDown || _existing != null) return;
    emit(state.copyWith(duration: duration, message: null, offline: false));
  }

  void toggleAtHome(bool atHome) {
    if (_shuttingDown || _existing != null) return;
    emit(state.copyWith(atHome: atHome, message: null, offline: false));
  }

  Future<void> submit() async {
    if (_shuttingDown || state.busy) return;

    if (_existing == null && state.patient == null) {
      emit(state.copyWith(message: 'Choisissez un animal.', offline: false));
      return;
    }

    emit(state.copyWith(busy: true, message: null, offline: false));

    final beginAt = DateTime(
      state.day.year,
      state.day.month,
      state.day.day,
      state.start.hour,
      state.start.minute,
    );
    final endAt = beginAt.add(state.duration);

    final existing = _existing;
    final result = existing == null
        ? await _repository.create(
            patientId: state.patient!.id,
            beginAt: beginAt,
            endAt: endAt,
            atHome: state.atHome,
          )
        : await _repository.move(existing.id, beginAt: beginAt, endAt: endAt);

    // Le praticien reste libre de quitter cet écran pendant l'attente :
    // `BlocProvider` ferme alors le cubit avant que la requête ne revienne.
    if (_shuttingDown) return;

    switch (result) {
      case Success(:final value):
        emit(state.copyWith(busy: false, saved: value));
      case Err(:final failure):
        final offline = failure is NetworkFailure;
        final message = offline
            ? (existing == null
                  ? appointmentOfflineCreateMessage
                  : appointmentOfflineMoveMessage)
            : failure.message;
        emit(state.copyWith(busy: false, message: message, offline: offline));
    }
  }

  @override
  Future<void> close() async {
    // Posé avant toute chose : c'est ce qui ferme la fenêtre entre le début
    // de `close()` et l'exécution de `super.close()`, pendant laquelle
    // `isClosed` mentirait encore.
    _closing = true;
    return super.close();
  }
}
