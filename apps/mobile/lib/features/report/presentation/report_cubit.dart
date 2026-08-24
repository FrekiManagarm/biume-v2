import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../core/result.dart';
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

/// Le mobile **valide, il n'édite pas**. Les seules écritures possibles ici
/// sont des décisions : confirmer, écarter, ou régénérer ce qui n'a pas encore
/// été décidé. Aucune méthode ne réécrit le texte d'une proposition.
class ReportCubit extends Cubit<ReportState> {
  ReportCubit(this._repository) : super(const ReportInitial());

  final ReportRepository _repository;

  Future<void> load(String reportId) async {
    emit(const ReportLoading());
    _apply(await _repository.load(reportId), fallback: null);
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
    _apply(
      await _repository.decideSection(
        reportId: current.data.reportId,
        section: section,
        decision: decision,
      ),
      fallback: current.data,
    );
  }

  /// Régénérer est une action **explicite** du praticien, et elle ne touche que
  /// les propositions encore à vérifier. Ce qu'il a validé ou écarté reste.
  Future<void> regenerate() async {
    final current = state;
    if (current is! ReportLoaded) return;

    emit(ReportLoaded(current.data, busy: true));
    _apply(
      await _repository.regenerate(current.data.reportId),
      fallback: current.data,
    );
  }

  Future<void> _decide(String proposalId, SectionState decision) async {
    final current = state;
    if (current is! ReportLoaded) return;

    emit(ReportLoaded(current.data, busy: true));
    _apply(
      await _repository.decide(
        reportId: current.data.reportId,
        proposalId: proposalId,
        decision: decision,
      ),
      fallback: current.data,
    );
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
