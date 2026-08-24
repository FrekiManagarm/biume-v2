import 'package:dio/dio.dart';

import '../../../core/failure.dart';
import '../../../core/network/api_error.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/result.dart';
import '../domain/auth_repository.dart';
import '../domain/session.dart';
import 'auth_remote_datasource.dart';

class AuthRepositoryImpl implements AuthRepository {
  const AuthRepositoryImpl(this._remote, this._tokens);

  final AuthRemoteDataSource _remote;
  final TokenStore _tokens;

  @override
  Future<PractitionerSession?> restoreSession() async {
    if (await _tokens.read() == null) return null;

    try {
      return _toSession(await _remote.session());
    } on DioException {
      // Un jeton refusé n'est pas une panne : il a expiré, et le praticien
      // doit simplement se reconnecter.
      await _tokens.clear();
      return null;
    }
  }

  @override
  Future<Result<PractitionerSession>> signIn({
    required String email,
    required String password,
  }) async {
    try {
      await _tokens.write(await _remote.signIn(email: email, password: password));
      final session = _toSession(await _remote.session());
      if (session == null) return const Err(AuthFailureFallback());
      return Success(session);
    } on DioException catch (error) {
      await _tokens.clear();
      return Err(failureFromDioException(error));
    }
  }

  @override
  Future<void> signOut() async {
    try {
      await _remote.signOut();
    } on DioException {
      // Le serveur peut être injoignable ; le jeton local doit disparaître
      // quand même, sinon un téléphone perdu reste ouvert.
    } finally {
      await _tokens.clear();
    }
  }

  @override
  Future<Result<List<Company>>> listCompanies() async {
    try {
      final rows = await _remote.listCompanies();
      return Success(
        rows
            .map(
              (row) => Company(
                id: row['id'] as String,
                name: (row['name'] as String?) ?? 'Entreprise sans nom',
              ),
            )
            .toList(),
      );
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }

  @override
  Future<Result<PractitionerSession>> setActiveCompany(String companyId) async {
    try {
      await _remote.setActiveCompany(companyId);
      final session = _toSession(await _remote.session());
      if (session == null) return const Err(AuthFailureFallback());
      return Success(session);
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }

  PractitionerSession? _toSession(Map<String, dynamic>? payload) {
    if (payload == null) return null;

    final userId = payload['userId'];
    if (userId is! String) return null;

    final company = payload['organization'];
    return PractitionerSession(
      userId: userId,
      company: company is Map<String, dynamic>
          ? Company(
              id: company['id'] as String,
              name: (company['name'] as String?) ?? 'Entreprise sans nom',
            )
          : null,
    );
  }
}
