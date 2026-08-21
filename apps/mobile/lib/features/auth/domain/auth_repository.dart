import '../../../core/result.dart';
import 'session.dart';

abstract class AuthRepository {
  /// Restaure la session depuis le trousseau système au démarrage.
  /// `null` quand aucun jeton n'y est rangé ou qu'il n'est plus valide.
  Future<PractitionerSession?> restoreSession();

  Future<Result<PractitionerSession>> signIn({
    required String email,
    required String password,
  });

  /// Efface le jeton du trousseau. C'est la seule chose qui protège des
  /// données de santé sur un téléphone qui peut être perdu.
  Future<void> signOut();

  Future<Result<List<Company>>> listCompanies();

  Future<Result<PractitionerSession>> setActiveCompany(String companyId);
}
