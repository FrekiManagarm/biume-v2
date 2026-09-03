import 'package:dio/dio.dart';

import '../../../core/network/api_error.dart';
import '../../../core/result.dart';
import '../domain/proposal.dart';
import '../domain/report_repository.dart';

/// Suit le gabarit de `HttpTranscriptRepository` et `HttpCaptureApi` : chaque
/// appel traduit son `DioException` en échec de domaine, jamais en message de
/// transport.
class HttpReportRepository implements ReportRepository {
  const HttpReportRepository(this._dio);
  final Dio _dio;

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
