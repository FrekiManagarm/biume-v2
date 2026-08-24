import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/result.dart';
import '../domain/transcript.dart';
import '../domain/transcript_repository.dart';

@immutable
sealed class TranscriptState {
  const TranscriptState();
}

class TranscriptInitial extends TranscriptState {
  const TranscriptInitial();
  @override
  bool operator ==(Object other) => other is TranscriptInitial;
  @override
  int get hashCode => 0;
}

class TranscriptLoading extends TranscriptState {
  const TranscriptLoading();
  @override
  bool operator ==(Object other) => other is TranscriptLoading;
  @override
  int get hashCode => 1;
}

/// La transcription n'est pas encore produite. L'écran le dit plutôt que
/// d'afficher un champ vide.
class TranscriptPending extends TranscriptState {
  const TranscriptPending();
  @override
  bool operator ==(Object other) => other is TranscriptPending;
  @override
  int get hashCode => 2;
}

/// Rien n'a été capté. Le produit ne remplit jamais un silence par un texte
/// plausible : il explique et propose de réenregistrer.
class TranscriptInaudible extends TranscriptState {
  const TranscriptInaudible();
  @override
  bool operator ==(Object other) => other is TranscriptInaudible;
  @override
  int get hashCode => 3;
}

class TranscriptReady extends TranscriptState {
  const TranscriptReady(this.transcript, {this.draft, this.message});

  final Transcript transcript;

  /// La saisie du praticien quand l'enregistrement a échoué. Perdre du texte
  /// qu'il vient de taper à une main serait inacceptable.
  final String? draft;
  final String? message;

  @override
  bool operator ==(Object other) =>
      other is TranscriptReady &&
      other.transcript == transcript &&
      other.draft == draft &&
      other.message == message;

  @override
  int get hashCode => Object.hash(4, transcript, draft, message);
}

class TranscriptSaving extends TranscriptState {
  const TranscriptSaving(this.transcript);

  final Transcript transcript;

  @override
  bool operator ==(Object other) =>
      other is TranscriptSaving && other.transcript == transcript;

  @override
  int get hashCode => Object.hash(5, transcript);
}

class TranscriptUnavailable extends TranscriptState {
  const TranscriptUnavailable(this.message);

  final String message;

  @override
  bool operator ==(Object other) =>
      other is TranscriptUnavailable && other.message == message;

  @override
  int get hashCode => Object.hash(6, message);
}

class TranscriptCubit extends Cubit<TranscriptState> {
  TranscriptCubit(this._repository) : super(const TranscriptInitial());

  final TranscriptRepository _repository;

  Future<void> load(String captureId) async {
    emit(const TranscriptLoading());

    final result = await _repository.load(captureId);
    switch (result) {
      case Err(:final failure):
        emit(TranscriptUnavailable(failure.message));
      case Success(:final value):
        emit(_stateFor(value));
    }
  }

  Future<void> correct(String text) async {
    final current = state;
    // La correction porte sur la source. Une transcription qui n'existe pas
    // encore n'a rien à corriger.
    if (current is! TranscriptReady) return;

    emit(TranscriptSaving(current.transcript));

    final result = await _repository.correct(
      current.transcript.captureId,
      text,
    );

    switch (result) {
      case Success(:final value):
        emit(TranscriptReady(value));
      case Err(:final failure):
        emit(
          TranscriptReady(
            current.transcript,
            draft: text,
            message: failure.message,
          ),
        );
    }
  }

  TranscriptState _stateFor(Transcript transcript) {
    if (transcript.isPending) return const TranscriptPending();
    if (transcript.status == TranscriptStatus.inaudible) {
      return const TranscriptInaudible();
    }
    if (transcript.status == TranscriptStatus.failed) {
      return const TranscriptUnavailable(
        "La transcription n'a pas abouti. Vous pouvez relancer.",
      );
    }
    return TranscriptReady(transcript);
  }
}
