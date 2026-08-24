import 'package:biume_mobile/core/telemetry/telemetry.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  late List<ProductEvent> recus;
  late Telemetry telemetry;

  setUp(() {
    recus = [];
    telemetry = Telemetry(sink: recus.add);
  });

  test("porte l'identifiant de parcours", () {
    telemetry.emit(
      const ProductEvent(name: 'capture_started', journeyId: 'parcours-1'),
    );

    expect(recus.single.journeyId, 'parcours-1');
  });

  /// Aucun nom de client, aucune note, aucune URL signée, aucun audio ne doit
  /// pouvoir atteindre un outil d'analyse.
  test('ne transporte que des champs techniques', () {
    telemetry.emit(
      const ProductEvent(
        name: 'capture_uploaded',
        journeyId: 'parcours-1',
        properties: {
          'durationMs': 120000,
          'patientName': 'Filou',
          'signedUrl': 'https://bucket.example/signed?sig=zzz',
          'note': 'Tension lombaire',
        },
      ),
    );

    final properties = recus.single.properties;
    expect(properties.keys, ['durationMs']);
    expect(properties.toString(), isNot(contains('Filou')));
    expect(properties.toString(), isNot(contains('http')));
  });

  test("n'échoue pas quand l'envoi d'événement échoue", () {
    final fragile = Telemetry(sink: (_) => throw StateError('réseau'));

    expect(
      () => fragile.emit(
        const ProductEvent(name: 'x', journeyId: 'parcours-1'),
      ),
      returnsNormally,
    );
  });

  test('ne fait rien quand aucun transport n\'est installé', () {
    final muet = Telemetry();

    expect(
      () => muet.emit(const ProductEvent(name: 'x', journeyId: 'parcours-1')),
      returnsNormally,
    );
  });
}
