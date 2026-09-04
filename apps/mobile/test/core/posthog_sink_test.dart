import 'package:biume_mobile/core/telemetry/posthog_sink.dart';
import 'package:biume_mobile/core/telemetry/telemetry.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:posthog_flutter/posthog_flutter.dart';

class MockPosthog extends Mock implements Posthog {}

void main() {
  late MockPosthog client;

  setUp(() => client = MockPosthog());

  test('envoie le nom, les propriétés et l\'identifiant de parcours', () async {
    when(
      () => client.capture(
        eventName: any(named: 'eventName'),
        properties: any(named: 'properties'),
      ),
    ).thenAnswer((_) async {});

    createPosthogSink(client)(
      const ProductEvent(
        name: 'mobile.followup_notified',
        journeyId: 'report-1',
        properties: {'delayMs': 7200000},
      ),
    );

    final capture = verify(
      () => client.capture(
        eventName: 'mobile.followup_notified',
        properties: captureAny(named: 'properties'),
      ),
    ).captured.single as Map<String, Object>;
    expect(capture['delayMs'], 7200000);
    expect(capture['journeyId'], 'report-1');
  });

  /// Une panne de l'outil d'analyse ne doit jamais interrompre une tournée.
  test('avale une exception du client', () {
    when(
      () => client.capture(
        eventName: any(named: 'eventName'),
        properties: any(named: 'properties'),
      ),
    ).thenThrow(Exception('hors service'));

    expect(
      () => createPosthogSink(client)(
        const ProductEvent(name: 'mobile.dictation_saved', journeyId: 'c-1'),
      ),
      returnsNormally,
    );
  });

  test('avale un échec asynchrone du client', () async {
    when(
      () => client.capture(
        eventName: any(named: 'eventName'),
        properties: any(named: 'properties'),
      ),
    ).thenAnswer((_) async => throw Exception('réseau'));

    createPosthogSink(client)(
      const ProductEvent(name: 'mobile.dictation_saved', journeyId: 'c-1'),
    );

    // Sans capture de l'échec, l'erreur remonterait à la zone du test au
    // prochain tour de boucle et le ferait rougir.
    await Future<void>.delayed(Duration.zero);
  });
}
