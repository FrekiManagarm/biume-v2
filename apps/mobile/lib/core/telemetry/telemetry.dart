import 'package:flutter/foundation.dart';

/// Un événement produit, tel qu'il part vers l'outil d'analyse.
@immutable
class ProductEvent {
  const ProductEvent({
    required this.name,
    required this.journeyId,
    this.properties = const {},
  });

  final String name;

  /// Identifiant de parcours, porté de la capture jusqu'au brouillon.
  ///
  /// La métrique « temps médian entre la fin de séance et le brouillon prêt »
  /// traverse le téléphone **et** le serveur. Sans cet identifiant commun, elle
  /// est impossible à reconstituer — et c'est le critère de validation de toute
  /// la promesse produit.
  final String journeyId;

  final Map<String, Object> properties;
}

typedef TelemetrySink = void Function(ProductEvent event);

/// Champs autorisés dans un événement.
///
/// Liste blanche et non liste noire : un champ oublié ne doit pas partir par
/// défaut. Aucun nom de client, aucune note, aucune URL signée, aucun audio ne
/// doit pouvoir atteindre un outil d'analyse.
const Set<String> allowedTelemetryProperties = {
  'captureId',
  'durationMs',
  'byteSize',
  'attemptCount',
  'errorCode',
  'status',
  'section',
  'elapsedMs',
  'reportId',
  'sentToOwner',
  'textChanged',
  'delayMs',
};

// ignore_for_file: prefer_initializing_formals

class Telemetry {
  Telemetry({TelemetrySink? sink}) : _sink = sink;

  TelemetrySink? _sink;

  void installSink(TelemetrySink? sink) => _sink = sink;

  /// Les propriétés hors liste blanche sont retirées avant l'envoi, pas
  /// signalées : une erreur d'instrumentation ne doit jamais faire échouer un
  /// parcours de terrain.
  void emit(ProductEvent event) {
    final filtered = <String, Object>{
      for (final entry in event.properties.entries)
        if (allowedTelemetryProperties.contains(entry.key))
          entry.key: entry.value,
    };

    final sanitized = ProductEvent(
      name: event.name,
      journeyId: event.journeyId,
      properties: filtered,
    );

    try {
      _sink?.call(sanitized);
    } catch (_) {
      // L'envoi d'un événement ne doit jamais interrompre le praticien.
    }
  }
}
