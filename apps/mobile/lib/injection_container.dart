import 'dart:math';

import 'package:connectivity_plus/connectivity_plus.dart';
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
import 'features/capture/data/drift_capture_store.dart';
import 'features/capture/data/file_capture_files.dart';
import 'features/capture/data/http_capture_api.dart';
import 'features/capture/data/record_audio_recorder.dart';
import 'features/capture/domain/audio_recorder.dart';
import 'features/capture/domain/capture_store.dart';
import 'features/capture/domain/sync_engine.dart';
import 'features/capture/domain/upload_client.dart';
import 'features/records/data/patient_repository_impl.dart';
import 'features/records/domain/patient_repository.dart';

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
    )
    ..registerLazySingleton<PatientRepository>(
      () => PatientRepositoryImpl(getIt(), getIt()),
    )
    ..registerLazySingleton<CaptureFiles>(() => FileCaptureFiles(getIt()))
    ..registerLazySingleton<CaptureStore>(() => DriftCaptureStore(getIt()))
    ..registerLazySingleton<CaptureApi>(() => HttpCaptureApi(getIt()))
    // L'enregistreur n'est pas un singleton paresseux partagé : chaque écran
    // de dictée en veut un neuf, et le précédent doit être libéré.
    ..registerFactory<AudioRecorder>(RecordAudioRecorder.new)
    ..registerLazySingleton(
      () => SyncEngine(
        store: getIt(),
        api: getIt(),
        files: getIt(),
        isOnline: () async =>
            !(await Connectivity().checkConnectivity()).contains(
              ConnectivityResult.none,
            ),
        now: DateTime.now,
        random: Random.secure().nextDouble,
      ),
    );
}
