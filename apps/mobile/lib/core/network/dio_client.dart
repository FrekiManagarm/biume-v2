import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Clé du jeton porteur dans le trousseau système.
const String bearerTokenKey = 'biume.bearer';

/// Le jeton, rangé dans le trousseau et posé sur chaque requête.
///
/// C'est la seule chose qui protège des données de santé sur un téléphone qui
/// peut être perdu : il ne transite jamais par des préférences en clair.
class TokenStore {
  const TokenStore(this._storage);

  final FlutterSecureStorage _storage;

  Future<String?> read() => _storage.read(key: bearerTokenKey);

  Future<void> write(String token) =>
      _storage.write(key: bearerTokenKey, value: token);

  Future<void> clear() => _storage.delete(key: bearerTokenKey);
}

Dio createDioClient({required String baseUrl, required TokenStore tokens}) {
  final dio = Dio(
    BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
      // Le serveur ne parle qu'une langue au praticien, et ses messages
      // d'erreur sont déjà en français.
      headers: {'accept-language': 'fr'},
    ),
  );

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await tokens.read();
        if (token != null) {
          options.headers['authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
    ),
  );

  return dio;
}
