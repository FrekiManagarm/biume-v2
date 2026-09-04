// Harnais d'aperçu, hors suite : rend un écran hors ligne et l'écrit en PNG.
// Lancé à la main (`flutter test test/preview_screens.dart`), jamais par
// `flutter test`, qui ne ramasse que les fichiers `*_test.dart`.
import 'dart:io';
import 'dart:ui' as ui;

import 'package:biume_mobile/config/app_palette.dart';
import 'package:biume_mobile/config/app_theme.dart';
import 'package:biume_mobile/core/result.dart';
import 'package:biume_mobile/features/agenda/domain/agenda_repository.dart';
import 'package:biume_mobile/features/agenda/domain/appointment.dart';
import 'package:biume_mobile/features/auth/domain/auth_repository.dart';
import 'package:biume_mobile/features/auth/domain/session.dart';
import 'package:biume_mobile/features/auth/presentation/auth_cubit.dart';
import 'package:biume_mobile/features/capture/domain/capture_store.dart';
import 'package:biume_mobile/features/followup/domain/actionable_follow_up_repository.dart';
import 'package:biume_mobile/features/followup/domain/follow_up.dart';
import 'package:biume_mobile/features/home/presentation/home_screen.dart';
import 'package:biume_mobile/features/todo/domain/todo_api.dart';
import 'package:biume_mobile/features/todo/domain/todo_item.dart';
import 'package:biume_mobile/injection_container.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:mocktail/mocktail.dart';

class MockCaptureStore extends Mock implements CaptureStore {}

class MockTodoApi extends Mock implements TodoApi {}

class MockFollowUps extends Mock implements ActionableFollowUpRepository {}

class MockAgendaRepository extends Mock implements AgendaRepository {}

class MockAuthRepository extends Mock implements AuthRepository {}

const _sortie = 'PREVIEW_DIR';

void main() {
  final dossier = Platform.environment[_sortie] ?? 'build/apercus';
  final maintenant = DateTime.now();

  setUpAll(() => initializeDateFormatting('fr_FR'));

  // `flutter test` rend tout avec sa police de substitution, et le greffon de
  // polices ne survit pas d'un cas à l'autre : sans ce rechargement, le
  // deuxième aperçu ne montrerait que des rectangles noirs.
  setUp(_chargerLesPolices);

  Future<void> capturer(
    WidgetTester tester,
    String nom,
    Brightness brightness,
  ) async {
    final store = MockCaptureStore();
    final api = MockTodoApi();
    final followUps = MockFollowUps();
    final agenda = MockAgendaRepository();
    final auth = MockAuthRepository();

    registerFallbackValue(DateTime(2026, 9, 8));
    when(() => store.watchAll()).thenAnswer((_) => const Stream.empty());
    when(() => api.list()).thenAnswer(
      (_) async => Success([
        TodoItem(
          kind: TodoKind.reportToValidate,
          captureId: 'c-1',
          reportId: 'r-1',
          patientName: 'Iron',
          updatedAt: maintenant.subtract(const Duration(minutes: 40)),
        ),
      ]),
    );
    when(() => followUps.listActionable()).thenAnswer(
      (_) async => Success([
        FollowUp(
          id: 'f-1',
          reportId: 'r-0',
          patientName: 'Naya',
          ownerName: 'Mme Perrot',
          reasons: const [AlertReason.declaredWorsening],
          handled: false,
          answeredAt: maintenant.subtract(const Duration(days: 1)),
        ),
      ]),
    );
    when(() => agenda.watchWindow(any(), any())).thenAnswer(
      (_) => Stream.value([
        Appointment(
          id: 'a-1',
          patientId: 'p-1',
          patientName: 'Iron',
          species: 'DOG',
          beginAt: maintenant.subtract(const Duration(minutes: 20)),
          endAt: maintenant.add(const Duration(minutes: 40)),
          status: 'CONFIRMED',
        ),
        Appointment(
          id: 'a-2',
          patientId: 'p-2',
          patientName: 'Vega',
          species: 'HORSE',
          beginAt: maintenant.add(const Duration(hours: 2)),
          endAt: maintenant.add(const Duration(hours: 3)),
          status: 'CONFIRMED',
        ),
        Appointment(
          id: 'a-3',
          patientId: 'p-3',
          patientName: 'Naya',
          species: 'DOG',
          beginAt: maintenant.add(const Duration(hours: 4)),
          endAt: maintenant.add(const Duration(hours: 5)),
          status: 'CONFIRMED',
        ),
      ]),
    );
    when(() => agenda.refreshWindow(any(), any()))
        .thenAnswer((_) async => const Success(null));
    when(() => auth.restoreSession()).thenAnswer(
      (_) async => const PractitionerSession(
        userId: 'u-1',
        company: Company(id: 'org-1', name: 'Camille Marchand'),
      ),
    );

    await getIt.reset();
    getIt
      ..registerLazySingleton<CaptureStore>(() => store)
      ..registerLazySingleton<TodoApi>(() => api)
      ..registerLazySingleton<ActionableFollowUpRepository>(() => followUps)
      ..registerLazySingleton<AgendaRepository>(() => agenda);

    final cle = GlobalKey();
    final router = GoRouter(
      initialLocation: '/',
      routes: [GoRoute(path: '/', builder: (_, _) => const HomeScreen())],
    );

    tester.view.devicePixelRatio = 3;
    tester.view.physicalSize = const Size(390 * 3, 844 * 3);
    addTearDown(tester.view.reset);

    await tester.pumpWidget(
      RepaintBoundary(
        key: cle,
        child: BlocProvider(
          create: (_) => AuthCubit(auth, clearReadCache: () async {})..start(),
          child: MaterialApp.router(
            debugShowCheckedModeBanner: false,
            theme: buildAppTheme(
              brightness == Brightness.dark ? AppPalette.dark : AppPalette.light,
              brightness,
              platform: TargetPlatform.iOS,
            ),
            routerConfig: router,
          ),
        ),
      ),
    );
    for (var i = 0; i < 6; i++) {
      await tester.pump(const Duration(milliseconds: 60));
    }

    final limite =
        cle.currentContext!.findRenderObject()! as RenderRepaintBoundary;
    final image = await limite.toImage(pixelRatio: 3);
    final octets = await image.toByteData(format: ui.ImageByteFormat.png);
    Directory(dossier).createSync(recursive: true);
    File('$dossier/$nom.png').writeAsBytesSync(
      octets!.buffer.asUint8List(),
    );
  }

  testWidgets('accueil clair', (tester) async {
    await capturer(tester, 'accueil-clair', Brightness.light);
  });

  testWidgets('accueil sombre', (tester) async {
    await capturer(tester, 'accueil-sombre', Brightness.dark);
  });
}

Future<void> _chargerLesPolices() async {
  const familles = {
    'BricolageGrotesque': [
      'assets/fonts/BricolageGrotesque-SemiBold.ttf',
      'assets/fonts/BricolageGrotesque-Bold.ttf',
    ],
    'PlusJakartaSans': [
      'assets/fonts/PlusJakartaSans-Regular.ttf',
      'assets/fonts/PlusJakartaSans-SemiBold.ttf',
      'assets/fonts/PlusJakartaSans-Bold.ttf',
    ],
  };

  for (final entree in familles.entries) {
    final loader = FontLoader(entree.key);
    for (final chemin in entree.value) {
      loader.addFont(
        File(chemin).readAsBytes().then(
          (octets) => ByteData.view(Uint8List.fromList(octets).buffer),
        ),
      );
    }
    await loader.load();
  }
}
