import 'package:flutter/foundation.dart';

import '../../../core/result.dart';
import 'patient.dart';

/// Ce que le terrain a besoin de connaître d'un propriétaire fraîchement créé.
/// L'adresse complète et les notes restent sur le serveur.
@immutable
class Owner {
  const Owner({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    this.city,
  });

  final String id;
  final String name;

  /// Insisté mais jamais exigé : un praticien pressé peut créer le
  /// propriétaire sans e-mail, l'application le redemandera au moment
  /// d'envoyer le compte rendu.
  final String? email;
  final String? phone;
  final String? city;

  @override
  bool operator ==(Object other) => other is Owner && other.id == id;
  @override
  int get hashCode => id.hashCode;
}

/// Crée un propriétaire puis un animal rattaché, depuis le terrain.
///
/// Derrière cette interface pour que le cubit ne connaisse jamais dio, et
/// pour que le contrat strict du serveur (champs optionnels, jamais
/// nullables) reste l'affaire de l'implémentation HTTP.
abstract class OwnerRepository {
  /// Depuis le cache local (`CachedOwners`), rempli par
  /// `PatientRepository.refreshSheetsFor`. `null` si ce propriétaire n'a
  /// jamais été mis en cache — un praticien devant l'écurie doit pouvoir le
  /// dire, plutôt que d'afficher une fiche à moitié vide.
  Future<Owner?> byId(String id);

  Future<Result<Owner>> create({
    required String name,
    String? email,
    String? phone,
    String? city,
  });

  Future<Result<Patient>> createPatient({
    required String ownerId,
    required String name,
    required String species,
    String? breed,
    DateTime? birthDate,
  });
}
