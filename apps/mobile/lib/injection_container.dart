import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:get_it/get_it.dart';

import 'config/app_environment.dart';
import 'core/database/app_database.dart';
import 'core/network/dio_client.dart';
import 'features/agenda/data/agenda_repository_impl.dart';
import 'features/agenda/domain/agenda_repository.dart';
import 'features/auth/data/auth_remote_datasource.dart';
import 'features/auth/data/auth_repository_impl.dart';
import 'features/auth/domain/auth_repository.dart';

final getIt = GetIt.instance;

/// Enregistrement manuel plutôt que généré.
///
/// Chaque source de données distante est enregistrée **derrière son interface
/// de domaine**. C'est ce qui permet de basculer un endpoint d'une seule ligne
/// quand il atterrit côté serveur, et c'est la raison opérationnelle pour
/// laquelle la couche domaine existe — avant toute considération de pureté.
Future<void> configureDependencies() async {
  getIt
    ..registerLazySingleton(() => const FlutterSecureStorage())
    ..registerLazySingleton(() => TokenStore(getIt()))
    ..registerLazySingleton<Dio>(
      () => createDioClient(baseUrl: biumeApiUrl, tokens: getIt()),
    )
    ..registerLazySingleton(AppDatabase.new)
    ..registerLazySingleton(() => AuthRemoteDataSource(getIt()))
    // Implémentation réelle. Pour développer contre le serveur avant qu'un
    // endpoint n'existe, remplacer cette ligne par sa doublure : c'est le seul
    // point à changer.
    ..registerLazySingleton<AuthRepository>(
      () => AuthRepositoryImpl(getIt(), getIt()),
    )
    ..registerLazySingleton<AgendaRepository>(
      () => AgendaRepositoryImpl(getIt(), getIt()),
    );
}
