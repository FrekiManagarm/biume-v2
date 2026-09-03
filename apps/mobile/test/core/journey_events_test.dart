import 'package:biume_mobile/core/telemetry/journey_events.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('les six événements du parcours ont un nom préfixé mobile.', () {
    for (final name in JourneyEvents.all) {
      expect(name, startsWith('mobile.'));
    }
  });

  test('les six moments du parcours sont tous listés, une seule fois', () {
    expect(JourneyEvents.all, hasLength(6));
    expect(JourneyEvents.all.toSet(), hasLength(6));
    expect(
      JourneyEvents.all,
      containsAll([
        JourneyEvents.dictationSaved,
        JourneyEvents.transcriptValidated,
        JourneyEvents.extractionRequested,
        JourneyEvents.reportFinalized,
        JourneyEvents.followUpScheduled,
        JourneyEvents.followUpDeclined,
      ]),
    );
  });

  /// Le refus de suivi est un événement à part entière, distinct de la
  /// programmation : sans lui, un praticien qui refuse explicitement se
  /// confondrait avec un praticien qui abandonne dans les mesures d'activation.
  test(
    'la programmation et le refus du suivi sont deux événements distincts',
    () {
      expect(
        JourneyEvents.followUpScheduled,
        isNot(JourneyEvents.followUpDeclined),
      );
    },
  );
}
