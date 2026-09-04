import 'package:flutter/foundation.dart';

@immutable
class Patient {
  const Patient({
    required this.id,
    required this.ownerId,
    required this.ownerName,
    required this.name,
    required this.species,
    this.breed,
    this.birthDate,
  });

  final String id;
  final String ownerId;
  final String ownerName;
  final String name;
  final String species;
  final String? breed;

  /// Sert au calcul de l'âge en années révolues sur la fiche animal. `null`
  /// quand la date de naissance n'a jamais été renseignée : la fiche se tait
  /// alors sur l'âge plutôt que d'afficher un chiffre inventé.
  final DateTime? birthDate;

  /// Ce que le sélecteur affiche sous le nom : « Chien · Camille Roux ».
  String get subtitle => '${speciesLabels[species] ?? species} · $ownerName';

  Patient copyWith({
    String? id,
    String? ownerId,
    String? ownerName,
    String? name,
    String? species,
    String? breed,
    DateTime? birthDate,
  }) => Patient(
    id: id ?? this.id,
    ownerId: ownerId ?? this.ownerId,
    ownerName: ownerName ?? this.ownerName,
    name: name ?? this.name,
    species: species ?? this.species,
    breed: breed ?? this.breed,
    birthDate: birthDate ?? this.birthDate,
  );

  @override
  bool operator ==(Object other) => other is Patient && other.id == id;
  @override
  int get hashCode => id.hashCode;
}

const Map<String, String> speciesLabels = {
  'DOG': 'Chien',
  'CAT': 'Chat',
  'HORSE': 'Cheval',
  'RABBIT': 'Lapin',
  'NAC': 'NAC',
  'COW': 'Bovin',
  'OTHER': 'Autre',
};
