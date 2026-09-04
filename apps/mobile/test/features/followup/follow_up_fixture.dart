import 'package:biume_mobile/features/followup/domain/follow_up.dart';

/// Un suivi de référence, partagé par les tests du domaine, du cubit et de
/// « À traiter ». Les valeurs par défaut décrivent le cas courant — une
/// alerte non traitée, un propriétaire joignable — pour que chaque test ne
/// nomme que ce qu'il fait varier.
FollowUp suivi({
  String id = 'followup-1',
  String reportId = 'report-1',
  String patientName = 'Filou',
  String ownerName = 'Camille Roux',
  List<AlertReason> reasons = const [AlertReason.contactRequested],
  bool handled = false,
  FollowUpAnswer? answer,
  DateTime? answeredAt,
  String? ownerPhone = '+33600000000',
  String? ownerEmail = 'camille.roux@example.test',
  String? patientId = 'pet-1',
}) => FollowUp(
  id: id,
  reportId: reportId,
  patientName: patientName,
  ownerName: ownerName,
  reasons: reasons,
  handled: handled,
  answer: answer,
  answeredAt: answeredAt,
  ownerPhone: ownerPhone,
  ownerEmail: ownerEmail,
  patientId: patientId,
);
