import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/failure.dart';
import '../../../core/result.dart';
import '../domain/owner_repository.dart';
import '../domain/patient.dart';
import '../domain/patient_repository.dart';

/// Sentinelle distincte de `null`, comme dans `AppointmentFormState` : permet
/// à `copyWith` de distinguer « ne pas toucher » de « effacer ».
const Object _unset = Object();

/// Dit hors ligne, plutôt que la panne réseau brute : un praticien devant un
/// nouveau client doit savoir tout de suite que la création est impossible,
/// et ce qui reste possible en attendant.
const String newClientOfflineMessage =
    'Sans réseau, la fiche ne peut pas être créée. Dictez dès maintenant, '
    'vous rattacherez l\'animal plus tard.';

enum NewClientStep { owner, patient, done }

@immutable
class NewClientState {
  const NewClientState({
    required this.step,
    this.owner,
    this.patient,
    this.busy = false,
    this.message,
  });

  final NewClientStep step;
  final Owner? owner;
  final Patient? patient;
  final bool busy;

  /// Ce que le praticien lit quand quelque chose a empêché la soumission.
  /// `null` une fois le champ corrigé ou une nouvelle tentative lancée.
  final String? message;

  NewClientState copyWith({
    NewClientStep? step,
    Object? owner = _unset,
    Object? patient = _unset,
    bool? busy,
    Object? message = _unset,
  }) {
    return NewClientState(
      step: step ?? this.step,
      owner: identical(owner, _unset) ? this.owner : owner as Owner?,
      patient: identical(patient, _unset)
          ? this.patient
          : patient as Patient?,
      busy: busy ?? this.busy,
      message: identical(message, _unset) ? this.message : message as String?,
    );
  }

  @override
  bool operator ==(Object other) =>
      other is NewClientState &&
      other.step == step &&
      other.owner == owner &&
      other.patient == patient &&
      other.busy == busy &&
      other.message == message;

  @override
  int get hashCode => Object.hash(step, owner, patient, busy, message);
}

/// Crée un propriétaire puis un animal, depuis le terrain.
///
/// Cubit et non Bloc : deux volets et une soumission chacun n'ont pas de
/// transitions concurrentes.
class NewClientCubit extends Cubit<NewClientState> {
  NewClientCubit(this._owners, this._patients, {String? existingOwnerId})
    : _ownerId = existingOwnerId,
      super(
        NewClientState(
          step: existingOwnerId != null
              ? NewClientStep.patient
              : NewClientStep.owner,
        ),
      );

  final OwnerRepository _owners;
  final PatientRepository _patients;

  /// Renseigné dès la création du propriétaire, ou dès le départ quand un
  /// propriétaire existant est fourni (« Ajouter un animal à ce
  /// propriétaire »).
  String? _ownerId;

  // `isClosed` ne devient vrai qu'à l'exécution de `super.close()`, et notre
  // `close()` l'appelle en dernier. Une réponse qui arrive pendant cette
  // fenêtre verrait encore `isClosed` à `false` et passerait la garde. Ce
  // drapeau, posé au tout début de `close()`, couvre cette fenêtre : toute
  // garde doit le lire en plus de `isClosed`.
  bool _closing = false;

  bool get _shuttingDown => isClosed || _closing;

  Future<void> submitOwner({
    required String name,
    String? email,
    String? phone,
    String? city,
  }) async {
    if (_shuttingDown || state.busy) return;

    final trimmedName = name.trim();
    if (trimmedName.isEmpty) {
      emit(state.copyWith(message: 'Le nom est obligatoire.'));
      return;
    }

    emit(state.copyWith(busy: true, message: null));

    final result = await _owners.create(
      name: trimmedName,
      email: _clean(email),
      phone: _clean(phone),
      city: _clean(city),
    );

    if (_shuttingDown) return;

    switch (result) {
      case Success(:final value):
        _ownerId = value.id;
        emit(
          state.copyWith(
            busy: false,
            owner: value,
            step: NewClientStep.patient,
          ),
        );
      case Err(:final failure):
        emit(state.copyWith(busy: false, message: _messageFor(failure)));
    }
  }

  Future<void> submitPatient({
    required String name,
    required String species,
    String? breed,
    DateTime? birthDate,
  }) async {
    if (_shuttingDown || state.busy) return;

    final trimmedName = name.trim();
    if (trimmedName.isEmpty) {
      emit(state.copyWith(message: 'Le nom est obligatoire.'));
      return;
    }

    final ownerId = _ownerId;
    // Ne devrait jamais arriver : le volet animal n'est atteint qu'après un
    // propriétaire créé, ou fourni dès la construction du cubit.
    if (ownerId == null) {
      emit(state.copyWith(message: 'Choisissez un propriétaire.'));
      return;
    }

    emit(state.copyWith(busy: true, message: null));

    final result = await _owners.createPatient(
      ownerId: ownerId,
      name: trimmedName,
      species: species,
      breed: _clean(breed),
      birthDate: birthDate,
    );

    if (_shuttingDown) return;

    switch (result) {
      case Success(:final value):
        // Sans ce rafraîchissement, le sélecteur d'animal qui enchaîne ne
        // trouverait pas la fiche qui vient d'être créée.
        await _patients.refresh();
        if (_shuttingDown) return;
        emit(
          state.copyWith(
            busy: false,
            patient: value,
            step: NewClientStep.done,
          ),
        );
      case Err(:final failure):
        emit(state.copyWith(busy: false, message: _messageFor(failure)));
    }
  }

  String _messageFor(Failure failure) =>
      failure is NetworkFailure ? newClientOfflineMessage : failure.message;

  String? _clean(String? value) {
    if (value == null) return null;
    final trimmed = value.trim();
    return trimmed.isEmpty ? null : trimmed;
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
