import '../../../core/result.dart';
import 'transcript.dart';

abstract class TranscriptRepository {
  Future<Result<Transcript>> load(String captureId);

  Future<Result<Transcript>> correct(String captureId, String text);
}
