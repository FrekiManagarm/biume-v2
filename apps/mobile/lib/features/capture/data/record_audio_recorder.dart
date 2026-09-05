import 'package:record/record.dart' as record;

import '../domain/audio_recorder.dart';

/// Adaptateur du paquet `record`.
///
/// `aacLc` produit du `m4a`, exactement le type MIME que le contrat serveur
/// impose. Changer d'encodeur ici casserait la déclaration de capture.
class RecordAudioRecorder implements AudioRecorder {
  RecordAudioRecorder([record.AudioRecorder? recorder])
    : _recorder = recorder ?? record.AudioRecorder();

  final record.AudioRecorder _recorder;

  @override
  Future<bool> hasPermission() => _recorder.hasPermission();

  @override
  Future<void> start(String filePath) => _recorder.start(
    const record.RecordConfig(
      encoder: record.AudioEncoder.aacLc,
      // 32 kbit/s mono en 22 kHz : la parole reste intelligible pour la
      // transcription, et dix minutes tiennent largement sous la borne de
      // seize mégaoctets du contrat.
      bitRate: 32000,
      sampleRate: 22050,
      numChannels: 1,
    ),
    path: filePath,
  );

  @override
  Future<String?> stop() => _recorder.stop();

  @override
  Future<void> cancel() => _recorder.cancel();

  @override
  Future<bool> isRecording() => _recorder.isRecording();

  /// `record` donne des décibels pleine échelle, donc négatifs. Le plancher à
  /// -50 dB est celui d'une pièce calme : en dessous, il n'y a rien à montrer.
  @override
  Stream<double> amplitude() => _recorder
      .onAmplitudeChanged(const Duration(milliseconds: 120))
      .map((mesure) => ((mesure.current + 50) / 50).clamp(0.0, 1.0));

  @override
  Future<void> dispose() => _recorder.dispose();
}
