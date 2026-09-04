import 'package:biume_mobile/core/telemetry/journey_events.dart';
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
      () =>
          fragile.emit(const ProductEvent(name: 'x', journeyId: 'parcours-1')),
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

  /// Une liste blanche doit décrire ce qui existe : `kind` y figurait alors
  /// qu'aucun événement ne le porte, et un champ blanchi sans usage est une
  /// porte ouverte pour ce qui passera un jour sous son nom.
  test("le genre d'un élément de liste ne passe pas", () {
    telemetry.emit(
      const ProductEvent(
        name: JourneyEvents.extractionRequested,
        journeyId: 'c-1',
        properties: {'kind': 'ready_to_send', 'reportId': 'r-1'},
      ),
    );

    expect(recus.single.properties.keys, ['reportId']);
  });

  test('sentToOwner et reportId passent la liste blanche', () {
    ProductEvent? sent;
    Telemetry(sink: (e) => sent = e).emit(
      const ProductEvent(
        name: JourneyEvents.reportFinalized,
        journeyId: 'c-1',
        properties: {
          'reportId': 'r-1',
          'sentToOwner': true,
          'ownerEmail': 'x@y.z',
        },
      ),
    );
    expect(sent!.properties.keys, unorderedEquals(['reportId', 'sentToOwner']));
  });
}
