import 'package:dio/dio.dart';

/// Appelle `/api/auth/*` en dio nu, et non en retrofit.
///
/// La règle du projet est « retrofit pour la surface JSON, dio nu pour les
/// transferts binaires ». L'authentification est une troisième situation, et
/// elle mérite d'être nommée : le jeton porteur n'arrive pas dans le corps mais
/// dans l'en-tête `set-auth-token`, ce que le modèle déclaratif de retrofit ne
/// décrit pas. C'est aussi l'amorçage — il tourne avant que le client
/// authentifié n'existe.
class AuthRemoteDataSource {
  const AuthRemoteDataSource(this._dio);

  final Dio _dio;

  /// Retourne le jeton porteur lu dans `set-auth-token`.
  Future<String> signIn({
    required String email,
    required String password,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '/api/auth/sign-in/email',
      data: {'email': email, 'password': password},
    );

    final token = response.headers.value('set-auth-token');
    if (token == null || token.isEmpty) {
      throw DioException(
        requestOptions: response.requestOptions,
        response: response,
        type: DioExceptionType.badResponse,
      );
    }

    return token;
  }

  Future<Map<String, dynamic>?> session() async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/api/mobile/v1/session',
    );
    return response.data;
  }

  Future<List<Map<String, dynamic>>> listCompanies() async {
    final response = await _dio.get<List<dynamic>>(
      '/api/auth/organization/list',
    );
    return (response.data ?? const [])
        .whereType<Map<String, dynamic>>()
        .toList();
  }

  Future<void> setActiveCompany(String companyId) async {
    await _dio.post<Map<String, dynamic>>(
      '/api/auth/organization/set-active',
      data: {'organizationId': companyId},
    );
  }

  Future<void> signOut() async {
    await _dio.post<void>('/api/auth/sign-out');
  }
}
