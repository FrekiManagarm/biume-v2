import 'package:dio/dio.dart';

import '../../../core/network/api_error.dart';
import '../../../core/result.dart';
import '../domain/owner_repository.dart';
import '../domain/patient.dart';

/// Suit le gabarit de `HttpAppointmentWriteRepository` : chaque appel traduit
/// son `DioException` en échec de domaine, jamais en message de transport.
///
/// Le contrat serveur est strict et ses champs optionnels sont `optional`,
/// pas `nullable` : une clé absente passe, une clé valant `null` est
/// rejetée. Chaque corps ci-dessous n'inclut donc une clé optionnelle que
/// lorsque sa valeur n'est pas nulle.
class HttpOwnerRepository implements OwnerRepository {
  const HttpOwnerRepository(this._dio);

  final Dio _dio;

  @override
  Future<Result<Owner>> create({
    required String name,
    String? email,
    String? phone,
    String? city,
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/api/mobile/v1/owners',
        data: {
          'name': name,
          'email': ?email,
          'phone': ?phone,
          'city': ?city,
        },
      );
      final data = response.data!;
      return Success(
        Owner(
          id: data['id'] as String,
          name: data['name'] as String,
          email: data['email'] as String?,
          phone: data['phone'] as String?,
          city: data['city'] as String?,
        ),
      );
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }

  @override
  Future<Result<Patient>> createPatient({
    required String ownerId,
    required String name,
    required String species,
    String? breed,
    DateTime? birthDate,
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/api/mobile/v1/patients',
        data: {
          'ownerId': ownerId,
          'name': name,
          'species': species,
          'breed': ?breed,
          'birthDate': ?birthDate?.toUtc().toIso8601String(),
        },
      );
      final data = response.data!;
      return Success(
        Patient(
          id: data['id'] as String,
          ownerId: data['ownerId'] as String,
          ownerName: data['ownerName'] as String,
          name: data['name'] as String,
          species: data['species'] as String,
          breed: data['breed'] as String?,
        ),
      );
    } on DioException catch (error) {
      return Err(failureFromDioException(error));
    }
  }
}
