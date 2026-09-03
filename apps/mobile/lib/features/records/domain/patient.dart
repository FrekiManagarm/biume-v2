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
  });

  final String id;
  final String ownerId;
  final String ownerName;
  final String name;
  final String species;
  final String? breed;

  /// Ce que le sélecteur affiche sous le nom : « Chien · Camille Roux ».
  String get subtitle => '${speciesLabels[species] ?? species} · $ownerName';

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
