import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../domain/patient.dart';
import '../domain/patient_repository.dart';

@immutable
class PatientPickerState {
  const PatientPickerState({required this.all, required this.query});

  final List<Patient> all;
  final String query;

  /// Les animaux à afficher : tous, ou ceux qui correspondent à la
  /// recherche par nom d'animal ou de propriétaire.
  List<Patient> get visible {
    final needle = _fold(query);
    if (needle.isEmpty) return all;
    return all
        .where(
          (p) =>
              _fold(p.name).contains(needle) ||
              _fold(p.ownerName).contains(needle),
        )
        .toList();
  }
}

/// Minuscules et accents retirés : « Léo » se trouve en tapant « leo ».
String _fold(String value) => value
    .toLowerCase()
    .replaceAll(RegExp('[àáâä]'), 'a')
    .replaceAll(RegExp('[éèêë]'), 'e')
    .replaceAll(RegExp('[îï]'), 'i')
    .replaceAll(RegExp('[ôö]'), 'o')
    .replaceAll(RegExp('[ùûü]'), 'u')
    .replaceAll('ç', 'c');

/// Sélectionne l'animal d'une dictée libre parmi le cache local.
///
/// Le praticien qui dicte sans rendez-vous est souvent debout, à une main,
/// dans une écurie sans réseau : cet écran lit le cache, jamais le réseau.
class PatientPickerCubit extends Cubit<PatientPickerState> {
  PatientPickerCubit(this._repository)
    : super(const PatientPickerState(all: [], query: ''));

  final PatientRepository _repository;
  StreamSubscription<List<Patient>>? _subscription;

  void start() {
    _subscription = _repository.watchAll().listen(
      (all) => emit(PatientPickerState(all: all, query: state.query)),
    );
  }

  void search(String query) =>
      emit(PatientPickerState(all: state.all, query: query));

  @override
  Future<void> close() async {
    await _subscription?.cancel();
    return super.close();
  }
}
