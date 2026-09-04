import 'package:flutter/foundation.dart';

import '../../report/domain/proposal.dart';
import 'owner_repository.dart';
import 'patient.dart';

/// Une ligne de l'historique d'un animal : ce qui s'est passé, et où en est
/// son compte rendu. Jamais le contenu clinique — la fiche ne l'affiche pas.
@immutable
class PatientHistoryEntry {
  const PatientHistoryEntry({
    required this.appointmentId,
    required this.beginAt,
    required this.reportId,
    required this.reportStatus,
    required this.consultationReason,
  });

  final String appointmentId;
  final DateTime beginAt;
  final String? reportId;
  final ReportStatus? reportStatus;
  final String consultationReason;

  /// Une séance passée n'ouvre son compte rendu que s'il est verrouillé —
  /// finalisé ou envoyé. Un brouillon donnerait l'illusion qu'on peut le
  /// consulter, alors qu'il n'existe pas encore vraiment pour le praticien
  /// pressé devant l'écurie.
  bool get hasFinalizedReport =>
      reportId != null &&
      (reportStatus == ReportStatus.finalized ||
          reportStatus == ReportStatus.sent);

  @override
  bool operator ==(Object other) =>
      other is PatientHistoryEntry &&
      other.appointmentId == appointmentId &&
      other.beginAt == beginAt &&
      other.reportId == reportId &&
      other.reportStatus == reportStatus &&
      other.consultationReason == consultationReason;

  @override
  int get hashCode => Object.hash(
    appointmentId,
    beginAt,
    reportId,
    reportStatus,
    consultationReason,
  );
}

/// Ce que l'écran « avant la séance » affiche : l'animal, son propriétaire, et
/// ses dernières séances. Fiche en lecture seule — aucune saisie ici, la
/// gestion des dossiers reste sur le web.
@immutable
class PatientSheet {
  const PatientSheet({
    required this.patient,
    required this.owner,
    required this.ageYears,
    required this.history,
  });

  final Patient patient;
  final Owner owner;

  /// Années révolues, `null` sans date de naissance connue : la fiche se
  /// tait plutôt que d'afficher un âge inventé.
  final int? ageYears;

  final List<PatientHistoryEntry> history;

  PatientSheet copyWith({List<PatientHistoryEntry>? history}) => PatientSheet(
    patient: patient,
    owner: owner,
    ageYears: ageYears,
    history: history ?? this.history,
  );
}
