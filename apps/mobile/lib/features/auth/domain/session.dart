import 'package:flutter/foundation.dart';

/// L'entreprise dans laquelle le praticien travaille.
///
/// « Entreprise » et non « organisation » : c'est le vocabulaire retenu pour
/// des ostéopathes animaliers, et il est déjà appliqué côté web et dans les
/// messages d'erreur du serveur.
@immutable
class Company {
  const Company({required this.id, required this.name});

  final String id;
  final String name;

  @override
  bool operator ==(Object other) =>
      other is Company && other.id == id && other.name == name;

  @override
  int get hashCode => Object.hash(id, name);
}

@immutable
class PractitionerSession {
  const PractitionerSession({required this.userId, required this.company});

  final String userId;

  /// `null` quand aucune entreprise n'est active. Toute lecture de données de
  /// patient l'exige : une session sans entreprise n'est pas utilisable.
  final Company? company;

  bool get canWork => company != null;

  @override
  bool operator ==(Object other) =>
      other is PractitionerSession &&
      other.userId == userId &&
      other.company == company;

  @override
  int get hashCode => Object.hash(userId, company);
}
