import 'package:flutter/foundation.dart';

/// Ce que l'écran d'agenda a besoin de savoir pour nommer la séance à venir.
@immutable
class Appointment {
  const Appointment({
    required this.id,
    required this.patientId,
    required this.patientName,
    required this.species,
    required this.beginAt,
    required this.endAt,
    required this.status,
  });

  final String id;
  final String patientId;
  final String patientName;
  final String species;
  final DateTime beginAt;
  final DateTime endAt;
  final String status;

  /// Une séance devient terminée toute seule quand son heure de fin est
  /// passée. Demander au praticien de cliquer « séance terminée » serait un
  /// geste de plus à retenir, qu'il oublierait.
  bool isDone(DateTime now) =>
      status == 'COMPLETED' || !endAt.isAfter(now);

  bool get isCancelled => status == 'CANCELLED';

  @override
  bool operator ==(Object other) => other is Appointment && other.id == id;

  @override
  int get hashCode => id.hashCode;
}
