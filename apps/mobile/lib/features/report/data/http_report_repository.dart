import 'dart:convert';

import 'package:dio/dio.dart';

import '../../../core/crypto/local_cipher.dart';
import '../../../core/database/app_database.dart';
import '../../../core/failure.dart';
import '../../../core/network/api_error.dart';
import '../../../core/result.dart';
import '../domain/proposal.dart';
import '../domain/report_repository.dart';

/// Suit le gabarit de `HttpTranscriptRepository` et `HttpCaptureApi` : chaque
/// appel traduit son `DioException` en échec de domaine, jamais en message de
/// transport.
class HttpReportRepository implements ReportRepository {
  const HttpReportRepository(this._dio, this._db, this._cipher);
  final Dio _dio;
  final AppDatabase _db;

  /// Le compte rendu en cache est chiffré sur le disque : la transcription et
  /// les propositions cliniques ne survivent pas en clair à un téléphone
  /// perdu (design parent, section 3).
  final LocalCipher _cipher;

  ReportProposals _parse(Map<String, dynamic> data) {
    final owner = data['owner'] as Map<String, dynamic>;
    final sections = (data['sections'] as Map<String, dynamic>? ?? const {}).map(
      (key, value) => MapEntry(reportSectionFrom(key), sectionStateFrom(value as String)),
    );
    return ReportProposals(
      reportId: data['reportId'] as String,
      status: reportStatusFrom(data['status'] as String),
      patientName: data['patientName'] as String,
      captureId: data['captureId'] as String?,
      owner: ReportOwner(id: owner['id'] as String, name: owner['name'] as String, email: owner['email'] as String?),
      transcript: data['transcript'] as String,
      proposals: (data['items'] as List<dynamic>).whereType<Map<String, dynamic>>().map((item) {
        final anchor = item['anchor'] as Map<String, dynamic>;
        return Proposal(
          id: item['id'] as String,
          section: reportSectionFrom(item['section'] as String),
          text: item['text'] as String,
          state: sectionStateFrom(item['state'] as String),
          anchor: TranscriptAnchor(start: anchor['start'] as int, end: anchor['end'] as int, quote: anchor['quote'] as String),
        );
      }).toList(),
      // Les quatre sections sont toujours présentes : une section absente de
      // la réponse est « à remplir », pas une clé manquante à l'écran.
      sections: {for (final s in ReportSection.values) s: sections[s] ?? SectionState.empty},
    );
  }

  Future<Result<ReportProposals>> _call(Future<Response<Map<String, dynamic>>> Function() request) async {
    try {
      return Success(_parse((await request()).data!));
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }

  @override
  Future<Result<ReportProposals>> load(String reportId) =>
      _call(() => _dio.get('/api/mobile/v1/reports/$reportId/proposals'));

  /// Ouvre un compte rendu passé depuis la fiche animal : le réseau d'abord,
  /// et seulement sur une panne réseau, `CachedReports` — le dernier compte
  /// rendu finalisé de l'animal, mis en cache pour cette raison précise.
  @override
  Future<Result<ReportProposals>> loadCachedOrRemote(String reportId) async {
    final result = await load(reportId);
    if (result case Success()) return result;

    final failure = (result as Err<ReportProposals>).failure;
    if (failure is! NetworkFailure) return result;

    final row = await (_db.select(
      _db.cachedReports,
    )..where((r) => r.reportId.equals(reportId))).getSingleOrNull();
    if (row == null) return result;

    // Une enveloppe qui ne s'ouvre pas — clé remplacée par une
    // réinstallation, ligne d'une version antérieure — est un cache manquant,
    // pas une erreur à montrer : le praticien lit la panne réseau.
    final clear = await _cipher.open(id: row.reportId, sealed: row.payload);
    if (clear == null) return result;

    return Success(_parse(jsonDecode(clear) as Map<String, dynamic>));
  }

  @override
  Future<Result<ReportProposals>> decide({required String reportId, required String proposalId, required SectionState decision}) =>
      _call(() => _dio.post('/api/mobile/v1/reports/$reportId/proposals/$proposalId/decision', data: {'state': sectionStateToApi(decision)}));

  @override
  Future<Result<ReportProposals>> decideSection({required String reportId, required ReportSection section, required SectionState decision}) =>
      _call(() => _dio.post('/api/mobile/v1/reports/$reportId/sections/${sectionToApi(section)}/decision', data: {'state': sectionStateToApi(decision)}));

  @override
  Future<Result<ReportProposals>> regenerate(String reportId) =>
      _call(() => _dio.post('/api/mobile/v1/reports/$reportId/proposals/regenerate'));

  @override
  Future<Result<FinalizeOutcome>> finalize(String reportId, {required bool sendToOwner}) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/api/mobile/v1/reports/$reportId/finalize',
        data: {'sendToOwner': sendToOwner},
      );
      final data = response.data!;
      return Success(FinalizeOutcome(status: reportStatusFrom(data['status'] as String), sentToOwner: data['sentToOwner'] as bool));
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }

  @override
  Future<Result<void>> updateOwnerEmail(String ownerId, String email) async {
    try {
      await _dio.post<Map<String, dynamic>>('/api/mobile/v1/owners/$ownerId/email', data: {'email': email});
      return const Success(null);
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }
}
