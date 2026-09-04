import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/result.dart';
import '../../../core/telemetry/journey_events.dart';
import '../../../core/telemetry/telemetry.dart';
import '../domain/proposal.dart';
import '../domain/report_repository.dart';

@immutable
sealed class ReportState {
  const ReportState();
}

class ReportInitial extends ReportState {
  const ReportInitial();
}

class ReportLoading extends ReportState {
  const ReportLoading();
}

/// L'extraction serveur est en cours : le cubit interroge en boucle courte.
/// Le praticien reste libre de partir, aucun écran ne l'enferme.
class ReportPreparing extends ReportState {
  const ReportPreparing();
}

class ReportLoaded extends ReportState {
  const ReportLoaded(this.data, {this.message, this.busy = false});

  final ReportProposals data;
  final String? message;
  final bool busy;
}

class ReportUnavailable extends ReportState {
  const ReportUnavailable(this.message);

  final String message;
}

/// Le compte rendu vient d'être finalisé (et éventuellement envoyé). L'écran
/// quitte cette route pour le suivi.
class ReportFinalized extends ReportState {
  const ReportFinalized({required this.reportId, required this.outcome});

  final String reportId;
  final FinalizeOutcome outcome;

  @override
  bool operator ==(Object other) =>
      other is ReportFinalized &&
      other.reportId == reportId &&
      other.outcome == outcome;

  @override
  int get hashCode => Object.hash(reportId, outcome);
}

/// Le mobile **valide, il n'édite pas**. Les seules écritures possibles ici
/// sont des décisions : confirmer, écarter, ou régénérer ce qui n'a pas encore
/// été décidé — puis finaliser et éventuellement envoyer.
class ReportCubit extends Cubit<ReportState> {
  ReportCubit(
    this._repository, {
    this.pollInterval = const Duration(seconds: 3),
    this.maxPolls = 40,
    Telemetry? telemetry,
  }) : _telemetry = telemetry ?? Telemetry(),
       super(const ReportInitial());

  final ReportRepository _repository;
  final Duration pollInterval;
  final int maxPolls;
  final Telemetry _telemetry;

  /// Après « Valider la transcription », les propositions arrivent dans les
  /// secondes qui suivent. On interroge tant qu'il n'y en a pas, à intervalle
  /// court, et on cesse au bout du nombre d'essais prévu : le praticien reste
  /// libre de partir, « À traiter » le rappellera.
  /// `preferCache` sert l'ouverture d'un compte rendu **passé** depuis la
  /// fiche animal : réseau d'abord, cache local en repli. Un compte rendu
  /// ouvert ainsi est toujours verrouillé (finalisé ou envoyé), donc jamais
  /// en attente d'extraction — la boucle ci-dessous ne s'y attarde pas.
  Future<void> load(String reportId, {bool preferCache = false}) async {
    emit(const ReportLoading());
    for (var attempt = 0; ; attempt++) {
      final result = preferCache
          ? await _repository.loadCachedOrRemote(reportId)
          : await _repository.load(reportId);
      // Le praticien reste libre de quitter cet écran pendant l'attente :
      // `BlocProvider` ferme alors le cubit avant que la requête ne
      // revienne. Émettre sur un cubit fermé lève un `StateError` que
      // personne n'attraperait ici.
      if (isClosed) return;
      switch (result) {
        case Err(:final failure):
          emit(ReportUnavailable(failure.message));
          return;
        case Success(:final value):
          final waiting = value.proposals.isEmpty && !value.isReadOnly;
          if (!waiting) {
            emit(ReportLoaded(value));
            return;
          }
          if (attempt >= maxPolls - 1) {
            emit(
              ReportLoaded(
                value,
                message: "La préparation prend plus long que prévu. Revenez dans un instant depuis « À traiter ».",
              ),
            );
            return;
          }
          if (state is! ReportPreparing) emit(const ReportPreparing());
          if (isClosed) return;
          await Future<void>.delayed(pollInterval);
          if (isClosed) return;
      }
    }
  }

  Future<void> confirm(String proposalId) =>
      _decide(proposalId, SectionState.confirmed);

  Future<void> dismiss(String proposalId) =>
      _decide(proposalId, SectionState.notApplicable);

  Future<void> decideWholeSection(
    ReportSection section,
    SectionState decision,
  ) async {
    final current = state;
    if (current is! ReportLoaded) return;

    emit(ReportLoaded(current.data, busy: true));
    final result = await _repository.decideSection(
      reportId: current.data.reportId,
      section: section,
      decision: decision,
    );
    // Même geste, même risque : le praticien a pu quitter l'écran pendant
    // que la décision était en vol.
    if (isClosed) return;
    _apply(result, fallback: current.data);
  }

  /// Régénérer est une action **explicite** du praticien, et elle ne touche que
  /// les propositions encore à vérifier. Ce qu'il a validé ou écarté reste.
  Future<void> regenerate() async {
    final current = state;
    if (current is! ReportLoaded) return;

    emit(ReportLoaded(current.data, busy: true));
    final result = await _repository.regenerate(current.data.reportId);
    // Même geste, même risque.
    if (isClosed) return;
    _apply(result, fallback: current.data);
  }

  Future<void> finalize({required bool sendToOwner}) async {
    final current = state;
    if (current is! ReportLoaded ||
        !current.data.canFinalize ||
        current.data.isReadOnly) {
      return;
    }
    emit(ReportLoaded(current.data, busy: true));
    final result = await _repository.finalize(
      current.data.reportId,
      sendToOwner: sendToOwner,
    );
    // Même geste, même risque : le praticien a pu quitter l'écran pendant
    // que la finalisation était en vol.
    if (isClosed) return;
    switch (result) {
      case Success(:final value):
        _telemetry.emit(
          ProductEvent(
            name: JourneyEvents.reportFinalized,
            journeyId: current.data.captureId ?? current.data.reportId,
            properties: {
              'reportId': current.data.reportId,
              'sentToOwner': value.sentToOwner,
            },
          ),
        );
        emit(ReportFinalized(reportId: current.data.reportId, outcome: value));
      case Err(:final failure):
        emit(ReportLoaded(current.data, message: failure.message));
    }
  }

  /// Compléter ou corriger l'adresse du destinataire. C'est une fiche client,
  /// pas le compte rendu : le mobile peut l'écrire sans jamais toucher au
  /// contenu qu'il valide.
  ///
  /// L'écriture ne finalise rien. L'irréversible se décide à l'écran de
  /// finalisation, après que le praticien a relu qui va recevoir quoi.
  Future<void> changeOwnerEmail(String email) async {
    final current = state;
    if (current is! ReportLoaded) return;
    emit(ReportLoaded(current.data, busy: true));
    final result = await _repository.updateOwnerEmail(
      current.data.owner.id,
      email,
    );
    // Le praticien reste libre de quitter cet écran pendant l'attente :
    // `BlocProvider` ferme alors le cubit avant que la requête ne revienne.
    if (isClosed) return;
    if (result case Err(:final failure)) {
      emit(ReportLoaded(current.data, message: failure.message));
      return;
    }
    emit(ReportLoaded(current.data.withOwnerEmail(email)));
  }

  Future<void> _decide(String proposalId, SectionState decision) async {
    final current = state;
    if (current is! ReportLoaded) return;

    emit(ReportLoaded(current.data, busy: true));
    final result = await _repository.decide(
      reportId: current.data.reportId,
      proposalId: proposalId,
      decision: decision,
    );
    // Même geste, même risque : le praticien a pu quitter l'écran pendant
    // que la décision était en vol.
    if (isClosed) return;
    _apply(result, fallback: current.data);
  }

  void _apply(Result<ReportProposals> result, {ReportProposals? fallback}) {
    switch (result) {
      case Success(:final value):
        emit(ReportLoaded(value));
      case Err(:final failure):
        // Les propositions affichées ne disparaissent pas parce qu'une requête
        // a échoué : le praticien garde son écran et peut réessayer.
        emit(
          fallback == null
              ? ReportUnavailable(failure.message)
              : ReportLoaded(fallback, message: failure.message),
        );
    }
  }
}
