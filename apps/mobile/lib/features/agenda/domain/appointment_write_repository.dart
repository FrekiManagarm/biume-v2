import 'package:collection/collection.dart';
import 'package:flutter/foundation.dart';
import 'package:intl/intl.dart';

import '../../../core/result.dart';

/// Une séance déjà prise sur le créneau que le serveur vient d'écrire.
///
/// Le serveur écrit d'abord, puis signale : un chevauchement n'est jamais un
/// motif de refus, seulement quelque chose que le praticien doit savoir.
@immutable
class AppointmentConflict {
  const AppointmentConflict({
    required this.appointmentId,
    required this.beginAt,
    this.patientName,
  });

  final String appointmentId;
  final DateTime beginAt;
  final String? patientName;

  /// Ce que l'écran affiche, une fois l'écriture faite. Le nom manque
  /// rarement, mais un animal du cache jamais synchronisé ne doit pas
  /// transformer un avertissement utile en écran cassé.
  String get sentence =>
      'Chevauche la séance de ${patientName ?? 'un animal'} à '
      '${DateFormat.Hm('fr_FR').format(beginAt.toLocal())}.';

  @override
  bool operator ==(Object other) =>
      other is AppointmentConflict &&
      other.appointmentId == appointmentId &&
      other.beginAt == beginAt &&
      other.patientName == patientName;

  @override
  int get hashCode => Object.hash(appointmentId, beginAt, patientName);
}

/// Réponse du serveur à une création ou un déplacement : même forme dans les
/// deux cas.
@immutable
class AppointmentWriteOutcome {
  const AppointmentWriteOutcome({
    required this.appointmentId,
    this.reportId,
    required this.conflicts,
  });

  final String appointmentId;
  final String? reportId;
  final List<AppointmentConflict> conflicts;

  @override
  bool operator ==(Object other) =>
      other is AppointmentWriteOutcome &&
      other.appointmentId == appointmentId &&
      other.reportId == reportId &&
      const ListEquality<AppointmentConflict>().equals(
        other.conflicts,
        conflicts,
      );

  @override
  int get hashCode => Object.hash(
    appointmentId,
    reportId,
    const ListEquality<AppointmentConflict>().hash(conflicts),
  );
}

/// Ce qui prend et déplace une séance, vu du serveur. Derrière cette
/// interface pour que le cubit ne connaisse jamais dio.
abstract class AppointmentWriteRepository {
  Future<Result<AppointmentWriteOutcome>> create({
    required String patientId,
    required DateTime beginAt,
    required DateTime endAt,
    required bool atHome,
  });

  Future<Result<AppointmentWriteOutcome>> move(
    String appointmentId, {
    required DateTime beginAt,
    required DateTime endAt,
  });

  /// La durée de la dernière séance du cache, sinon une heure. Sert de
  /// valeur par défaut à la création : un praticien qui prend des séances
  /// d'une heure toute la journée ne devrait pas avoir à le redire à chaque
  /// fois.
  Future<Duration> defaultDuration();
}
