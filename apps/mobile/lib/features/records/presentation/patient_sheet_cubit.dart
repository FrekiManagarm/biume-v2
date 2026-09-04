// Le champ est privé et le paramètre nommé public : Dart n'autorise pas les
// paramètres formels d'initialisation sur un champ privé, et rendre ce champ
// public exposerait un détail d'implémentation du cubit.
// ignore_for_file: prefer_initializing_formals

import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/result.dart';
import '../domain/owner_repository.dart';
import '../domain/patient_history.dart';
import '../domain/patient_repository.dart';

@immutable
sealed class PatientSheetState {
  const PatientSheetState();
}

class PatientSheetInitial extends PatientSheetState {
  const PatientSheetInitial();
}

/// L'animal, ou son propriétaire, n'a jamais été mis en cache : rien à
/// montrer, même hors ligne.
class PatientSheetUnavailable extends PatientSheetState {
  const PatientSheetUnavailable(this.message);
  final String message;
}

class PatientSheetLoaded extends PatientSheetState {
  const PatientSheetLoaded(this.sheet, {this.offlineMessage});

  final PatientSheet sheet;

  /// Non nul quand l'historique du serveur n'a pas pu être chargé. La fiche
  /// reste affichée depuis le cache : ce message dit « ces séances peuvent
  /// dater », jamais « il n'y a rien ».
  final String? offlineMessage;
}

const String _sheetUnavailableMessage =
    'Fiche introuvable. Connectez-vous une fois au réseau pour la charger.';

/// La fiche « avant la séance » : elle s'affiche depuis le cache d'abord —
/// nom de l'animal, téléphone du propriétaire — puis se complète avec
/// l'historique du serveur. Un praticien devant l'écurie ne doit jamais
/// attendre le réseau pour voir ce qu'il sait déjà.
class PatientSheetCubit extends Cubit<PatientSheetState> {
  PatientSheetCubit(
    this._patients,
    this._owners, {
    DateTime Function() now = DateTime.now,
  }) : _now = now,
       super(const PatientSheetInitial());

  final PatientRepository _patients;
  final OwnerRepository _owners;
  final DateTime Function() _now;

  // `isClosed` ne devient vrai qu'à l'exécution de `super.close()`, et notre
  // `close()` l'appelle en dernier. Une réponse qui arrive pendant cette
  // fenêtre verrait encore `isClosed` à `false` et passerait la garde. Ce
  // drapeau, posé au tout début de `close()`, couvre cette fenêtre : toute
  // garde doit le lire en plus de `isClosed`.
  bool _closing = false;

  bool get _shuttingDown => isClosed || _closing;

  Future<void> load(String patientId) async {
    if (_shuttingDown) return;

    final patient = await _patients.byId(patientId);
    if (_shuttingDown) return;
    if (patient == null) {
      emit(const PatientSheetUnavailable(_sheetUnavailableMessage));
      return;
    }

    final owner = await _owners.byId(patient.ownerId);
    if (_shuttingDown) return;
    if (owner == null) {
      emit(const PatientSheetUnavailable(_sheetUnavailableMessage));
      return;
    }

    final sheet = PatientSheet(
      patient: patient,
      owner: owner,
      ageYears: _ageYears(patient.birthDate),
      history: const [],
    );
    emit(PatientSheetLoaded(sheet));

    final result = await _patients.history(patientId);
    if (_shuttingDown) return;
    switch (result) {
      case Success(:final value):
        emit(PatientSheetLoaded(sheet.copyWith(history: value)));
      case Err(:final failure):
        emit(PatientSheetLoaded(sheet, offlineMessage: failure.message));
    }
  }

  /// Années révolues entre la date de naissance et `_now()`. `null` sans
  /// date de naissance connue : l'âge se tait plutôt que d'être inventé.
  int? _ageYears(DateTime? birthDate) {
    if (birthDate == null) return null;
    final today = _now();
    var age = today.year - birthDate.year;
    final birthdayReached =
        today.month > birthDate.month ||
        (today.month == birthDate.month && today.day >= birthDate.day);
    if (!birthdayReached) age--;
    return age;
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
