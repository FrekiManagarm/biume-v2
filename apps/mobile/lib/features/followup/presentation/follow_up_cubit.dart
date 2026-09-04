import 'package:collection/collection.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/result.dart';
import '../domain/actionable_follow_up_repository.dart';
import '../domain/follow_up.dart';

@immutable
class FollowUpState {
  const FollowUpState({required this.items, this.busy = false, this.message});

  final List<FollowUp> items;

  /// Vrai pendant un aller-retour serveur. Le bouton « Marquer comme traité »
  /// s'éteint : appuyer deux fois ne doit pas envoyer deux fois.
  final bool busy;

  /// Non nul quand le dernier appel a échoué. La liste reste affichée : ce
  /// message dit « ça n'est pas passé », jamais « il n'y a rien ».
  final String? message;

  FollowUpState copyWith({
    List<FollowUp>? items,
    bool? busy,
    String? message,
    bool clearMessage = false,
  }) => FollowUpState(
    items: items ?? this.items,
    busy: busy ?? this.busy,
    message: clearMessage ? null : (message ?? this.message),
  );

  @override
  bool operator ==(Object other) =>
      other is FollowUpState &&
      other.busy == busy &&
      other.message == message &&
      const ListEquality<FollowUp>().equals(other.items, items);

  @override
  int get hashCode =>
      Object.hash(busy, message, const ListEquality<FollowUp>().hash(items));
}

/// Les suivis qui demandent une action, et leur clôture explicite.
class FollowUpCubit extends Cubit<FollowUpState> {
  FollowUpCubit(this._repository) : super(const FollowUpState(items: []));

  final ActionableFollowUpRepository _repository;

  FollowUp? byId(String id) =>
      state.items.firstWhereOrNull((follow) => follow.id == id);

  Future<void> load() async {
    if (isClosed) return;
    emit(state.copyWith(busy: true, clearMessage: true));
    final result = await _repository.listActionable();
    if (isClosed) return;
    switch (result) {
      case Success(:final value):
        emit(
          FollowUpState(
            items: value.where((follow) => follow.isActionable).toList(),
          ),
        );
      case Err(:final failure):
        emit(state.copyWith(busy: false, message: failure.message));
    }
  }

  /// Le suivi ne disparaît qu'une fois le serveur d'accord : une liste qui se
  /// vide sur un échec réseau, c'est un propriétaire oublié.
  Future<void> markHandled(String id) async {
    if (isClosed || state.busy) return;
    emit(state.copyWith(busy: true, clearMessage: true));
    final result = await _repository.markHandled(id);
    if (isClosed) return;
    switch (result) {
      case Success():
        emit(
          FollowUpState(
            items: state.items.where((follow) => follow.id != id).toList(),
          ),
        );
      case Err(:final failure):
        emit(state.copyWith(busy: false, message: failure.message));
    }
  }
}
